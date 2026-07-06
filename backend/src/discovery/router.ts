import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DiscoveryService } from './service';
import { DiscoveryValidators } from './validators';
import { ResultNotFoundError } from './exceptions';
import { DbService } from '../services/db';
import { assessmentService } from '../assessment/dependencies';
import { CareerNotFoundError } from '../career/exceptions';

export function createDiscoveryRouter(service: DiscoveryService): Router {
  const router = Router();

  /**
   * POST /api/career/discovery
   * Evaluates complete profile information and generates Top 5 careers list.
   */
  router.post('/discovery', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      
      const profile = await DbService.getUserProfile(uid);
      if (!profile) {
        return res.status(404).json({ error: 'User profile not found. Please complete profile details first.' });
      }

      // Retrieve assessment attempts logs
      const assessments = await assessmentService.getAttemptsHistory(uid);
      const result = await service.runDiscovery(uid, profile, assessments);
      
      return res.json(result);
    } catch (error: any) {
      console.error('POST /career/discovery error:', error);
      return res.status(500).json({ error: error.message || 'Failed to execute career discovery analysis' });
    }
  });

  /**
   * GET /api/career/recommendations
   * Retrieves the most recent active discovery recommendations.
   */
  router.get('/recommendations', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const result = await service.getLatestRecommendations(uid);
      return res.json(result);
    } catch (error: any) {
      if (error instanceof ResultNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('GET /career/recommendations error:', error);
      return res.status(500).json({ error: 'Failed to retrieve career recommendations' });
    }
  });

  /**
   * GET /api/career/compare
   * Returns side-by-side analysis comparison between two career IDs.
   */
  router.get('/compare', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { careerA, careerB } = DiscoveryValidators.validateCompareParams(req.query);
      const comparison = await service.getCompareCareers(careerA, careerB);
      return res.json(comparison);
    } catch (error: any) {
      if (error instanceof CareerNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('GET /career/compare error:', error);
      return res.status(500).json({ error: error.message || 'Failed to compare career paths' });
    }
  });

  /**
   * GET /api/career/history
   * Returns history of past discovery items.
   */
  router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const list = await service.getDiscoveryHistory(uid);
      return res.json(list);
    } catch (error: any) {
      console.error('GET /career/history error:', error);
      return res.status(500).json({ error: 'Failed to retrieve discovery history log' });
    }
  });

  return router;
}
export default createDiscoveryRouter;
