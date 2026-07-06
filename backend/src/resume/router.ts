import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ResumeService } from './service';
import { ResumeValidators } from './validators';
import { VersionNotFoundError } from './exceptions';
import { DbService } from '../services/db';
import { assessmentService } from '../assessment/dependencies';
import { CareerNotFoundError } from '../career/exceptions';
import { EventBus } from '../integration/event_bus';
import { EventCatalog } from '../integration/event_catalog';

export function createResumeRouter(service: ResumeService): Router {
  const router = Router();

  /**
   * POST /api/resume/upload
   * Saves raw resume textContent in local version draft state.
   */
  router.post('/upload', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { textContent, fileName } = ResumeValidators.validateUpload(req.body);
      const result = await service.uploadResume(uid, textContent, fileName);
      return res.json(result);
    } catch (error: any) {
      console.error('POST /resume/upload error:', error);
      return res.status(400).json({ error: error.message || 'Failed to upload resume text' });
    }
  });

  /**
   * POST /api/resume/analyze
   * Grades the latest resume upload against target careers and verified skill sets.
   */
  router.post('/analyze', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { method, fileName } = req.body;
      
      const profile = await DbService.getUserProfile(uid);
      if (!profile) {
        return res.status(404).json({ error: 'User profile not found. Please onboarding details first.' });
      }

      const assessments = await assessmentService.getAttemptsHistory(uid);
      const result = await service.analyzeLatestResume(uid, profile, assessments, method, fileName);
      
      // Trigger integration workflow asynchronously
      EventBus.publish(EventCatalog.RESUME_ANALYZED, { uid, resumeVersion: result });

      // Construct a merged payload satisfying both legacy routes and Sprint 8 requirements
      return res.json({
        success: true,
        method: method || 'upload',
        fileName: result.fileName,
        atsScore: result.atsAnalysis!.atsScore,
        strengths: result.improvementReport!.strengths,
        weaknesses: result.improvementReport!.weaknesses,
        missingSkills: result.skillGapAnalysis!.missingSkills,
        improvementSuggestions: result.improvementReport!.actionableSuggestions,
        confidence: result.atsAnalysis!.atsScore >= 80 ? 'High' : result.atsAnalysis!.atsScore >= 50 ? 'Medium' : 'Low',
        nextRecommendedAction: result.skillGapAnalysis!.missingSkills.length > 0
          ? `Focus on studying and verifying: ${result.skillGapAnalysis!.missingSkills.slice(0, 2).join(', ')}`
          : 'Your resume is highly optimized! Start applying to target catalog openings.'
      });
    } catch (error: any) {
      if (error instanceof CareerNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      if (error.message && (error.message.includes('No uploaded resume') || error.message.includes('career path not selected'))) {
        return res.status(400).json({ error: error.message });
      }
      console.error('POST /resume/analyze error:', error);
      return res.status(500).json({ error: error.message || 'Failed to execute resume analysis' });
    }
  });

  /**
   * GET /api/resume/latest
   * Returns latest graded resume session details.
   */
  router.get('/latest', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const result = await service.getLatestResume(uid);
      return res.json(result);
    } catch (error: any) {
      console.error('GET /resume/latest error:', error);
      return res.status(404).json({ error: error.message || 'No resume files analyzed yet' });
    }
  });

  /**
   * GET /api/resume/history
   * Returns all upload histories and grades.
   */
  router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const history = await service.getResumeHistory(uid);
      return res.json(history);
    } catch (error: any) {
      console.error('GET /resume/history error:', error);
      return res.status(500).json({ error: 'Failed to retrieve resume history' });
    }
  });

  /**
   * GET /api/resume/compare
   * Compares two resume versions side-by-side.
   */
  router.get('/compare', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { versionA, versionB } = ResumeValidators.validateCompare(req.query);
      const comparison = await service.compareVersions(versionA, versionB);
      return res.json(comparison);
    } catch (error: any) {
      if (error instanceof VersionNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('GET /resume/compare error:', error);
      return res.status(500).json({ error: error.message || 'Failed to run comparison report' });
    }
  });

  return router;
}
export default createResumeRouter;
