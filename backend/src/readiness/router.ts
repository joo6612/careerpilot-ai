import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ReadinessService } from './service';
import { ReadinessValidators } from './validators';
import { ReportNotFoundError } from './exceptions';
import { DbService } from '../services/db';
import { assessmentService } from '../assessment/dependencies';
import { CareerNotFoundError } from '../career/exceptions';

export function createReadinessRouter(service: ReadinessService): Router {
  const router = Router();

  /**
   * POST /api/readiness/calculate
   * Runs the complete scoring evaluation and returns the latest readiness report.
   */
  router.post('/calculate', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;

      const profile = await DbService.getUserProfile(uid);
      if (!profile) {
        return res.status(404).json({ error: 'User profile not found. Please onboarding details first.' });
      }

      ReadinessValidators.validateSelectedCareer(profile);

      const assessments = await assessmentService.getAttemptsHistory(uid);
      const result = await service.calculateReadiness(uid, profile, assessments);

      return res.json({
        success: true,
        overallReadiness: result.report.overallReadiness,
        categoryScores: result.report.categoryScores,
        strengths: result.report.strengths,
        weaknesses: result.report.weaknesses,
        missingSkills: result.report.missingSkills,
        recommendations: result.report.recommendations,
        estimatedCompletionTimeHours: result.report.estimatedCompletionTimeHours,
        confidence: result.report.confidence,
        metadata: result.report.metadata
      });
    } catch (error: any) {
      if (error instanceof CareerNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('POST /readiness/calculate error:', error);
      return res.status(500).json({ error: error.message || 'Failed to calculate career readiness score' });
    }
  });

  /**
   * GET /api/readiness/latest
   * Returns latest calculated readiness report.
   */
  router.get('/latest', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const report = await service.getLatestReport(uid);
      return res.json(report);
    } catch (error: any) {
      if (error instanceof ReportNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('GET /readiness/latest error:', error);
      return res.status(500).json({ error: 'Failed to retrieve latest readiness report' });
    }
  });

  /**
   * GET /api/readiness/trends
   * Returns score changes and assessment completions history.
   */
  router.get('/trends', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const trends = await service.getTrends(uid);
      return res.json(trends);
    } catch (error: any) {
      console.error('GET /readiness/trends error:', error);
      return res.status(500).json({ error: 'Failed to retrieve readiness trends' });
    }
  });

  /**
   * GET /api/readiness/history
   * Returns full runs history.
   */
  router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const list = await service.getHistory(uid);
      return res.json(list);
    } catch (error: any) {
      console.error('GET /readiness/history error:', error);
      return res.status(500).json({ error: 'Failed to retrieve readiness history log' });
    }
  });

  return router;
}
export default createReadinessRouter;
