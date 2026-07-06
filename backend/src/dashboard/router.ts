import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DashboardService } from './service';
import { validateDashboardQuery } from './validators';

export function createDashboardRouter(service: DashboardService): Router {
  const router = Router();

  // Apply common validator middleware
  router.use(validateDashboardQuery);

  /**
   * GET /api/dashboard
   * Returns the complete career progress dashboard response.
   */
  router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const widgetsQuery = req.query.widgets;
      const widgetsFilter = typeof widgetsQuery === 'string'
        ? widgetsQuery.split(',').map(w => w.trim())
        : undefined;

      const dashboard = await service.getDashboard(uid, widgetsFilter);
      return res.json(dashboard);
    } catch (error: any) {
      console.error('GET /dashboard error:', error);
      return res.status(500).json({ error: error.message || 'Failed to load dashboard' });
    }
  });

  /**
   * GET /api/dashboard/snapshot
   * Returns only the Career Snapshot summary block.
   */
  router.get('/snapshot', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const snapshot = await service.getSnapshot(uid);
      return res.json(snapshot);
    } catch (error: any) {
      console.error('GET /dashboard/snapshot error:', error);
      return res.status(500).json({ error: error.message || 'Failed to load dashboard snapshot' });
    }
  });

  /**
   * GET /api/dashboard/widgets
   * Returns list of configured widget blocks and their corresponding data.
   */
  router.get('/widgets', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const widgetsQuery = req.query.widgets;
      const widgetsFilter = typeof widgetsQuery === 'string'
        ? widgetsQuery.split(',').map(w => w.trim())
        : undefined;

      const widgets = await service.getWidgets(uid, widgetsFilter);
      return res.json(widgets);
    } catch (error: any) {
      console.error('GET /dashboard/widgets error:', error);
      return res.status(500).json({ error: error.message || 'Failed to load dashboard widgets' });
    }
  });

  /**
   * GET /api/dashboard/activity
   * Returns the aggregated recent activity timeline feed.
   */
  router.get('/activity', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const activity = await service.getActivity(uid);
      return res.json(activity);
    } catch (error: any) {
      console.error('GET /dashboard/activity error:', error);
      return res.status(500).json({ error: error.message || 'Failed to load dashboard activity log' });
    }
  });

  /**
   * GET /api/dashboard/analytics
   * Returns historical progress rates and career trends.
   */
  router.get('/analytics', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const analytics = await service.getAnalytics(uid);
      return res.json(analytics);
    } catch (error: any) {
      console.error('GET /dashboard/analytics error:', error);
      return res.status(500).json({ error: error.message || 'Failed to load dashboard analytics' });
    }
  });

  /**
   * GET /api/dashboard/insights
   * Returns AI synthesized recommendations and strengths/weaknesses.
   */
  router.get('/insights', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const insights = await service.getInsights(uid);
      return res.json(insights);
    } catch (error: any) {
      console.error('GET /dashboard/insights error:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate dashboard AI insights' });
    }
  });

  return router;
}

export default createDashboardRouter;
