import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AssessmentService } from './service';
import { AssessmentValidators } from './validators';
import { SessionNotFoundError, SkillNotFoundError } from './exceptions';
import { EventBus } from '../integration/event_bus';
import { EventCatalog } from '../integration/event_catalog';

export function createAssessmentRouter(service: AssessmentService): Router {
  const router = Router();

  /**
   * GET /api/assessment/skills
   * Returns list of skills with configured assessments
   */
  router.get('/skills', async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const list = await service.getSkillsAvailable();
      return res.json(list);
    } catch (error: any) {
      console.error('GET /assessment/skills error:', error);
      return res.status(500).json({ error: 'Failed to retrieve assessment skills list' });
    }
  });

  /**
   * POST /api/assessment/start
   * Starts a new assessment session
   */
  router.post('/start', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { skill, selfRating } = AssessmentValidators.validateStartParams(req.body);
      const session = await service.startAssessmentSession(uid, skill, selfRating);
      return res.json(session);
    } catch (error: any) {
      if (error instanceof SkillNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('POST /assessment/start error:', error);
      return res.status(500).json({ error: error.message || 'Failed to start assessment session' });
    }
  });

  /**
   * POST /api/assessment/submit
   * Submits answers and returns graded results
   */
  router.post('/submit', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { sessionId, answers } = AssessmentValidators.validateSubmitParams(req.body);
      const result = await service.submitAssessmentSession(uid, sessionId, answers);
      
      // Trigger integration workflow asynchronously
      EventBus.publish(EventCatalog.ASSESSMENT_COMPLETED, { uid, result });
      
      return res.json(result);
    } catch (error: any) {
      if (error instanceof SessionNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('POST /assessment/submit error:', error);
      return res.status(500).json({ error: error.message || 'Failed to submit assessment answers' });
    }
  });

  /**
   * GET /api/assessment/history
   * Retrieves past attempts history
   */
  router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const list = await service.getAttemptsHistory(uid);
      return res.json(list);
    } catch (error: any) {
      console.error('GET /assessment/history error:', error);
      return res.status(500).json({ error: 'Failed to retrieve assessment history' });
    }
  });

  /**
   * GET /api/assessment/result/:id
   * Resolves past attempt results
   */
  router.get('/result/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const id = String(req.params.id || '').trim();
      if (!id) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const result = await service.getResultDetails(uid, id);
      if (!result) {
        return res.status(404).json({ error: `Assessment result for session '${id}' was not found.` });
      }
      return res.json(result);
    } catch (error: any) {
      console.error(`GET /assessment/result/${req.params.id} error:`, error);
      return res.status(500).json({ error: 'Failed to retrieve assessment result details' });
    }
  });

  return router;
}
