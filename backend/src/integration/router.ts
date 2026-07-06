import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { IntegrationService } from './integration_service';

export function createIntegrationRouter(service: IntegrationService): Router {
  const router = Router();

  /**
   * GET /api/system/status
   * Returns overall system orchestrator status and logs.
   */
  router.get('/status', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = await service.getStatus();
      return res.json(status);
    } catch (error: any) {
      console.error('GET /system/status error:', error);
      return res.status(500).json({ error: error.message || 'Failed to retrieve system status' });
    }
  });

  /**
   * POST /api/system/refresh
   * Triggers a manual dashboard refresh for the user.
   */
  router.post('/refresh', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { uid } = req.body;
      const targetUid = uid || req.user?.uid;
      if (!targetUid) {
        return res.status(400).json({ error: 'User UID is required' });
      }

      await service.refreshDashboard(targetUid);
      return res.json({ success: true, message: `Dashboard refresh triggered for User: ${targetUid}` });
    } catch (error: any) {
      console.error('POST /system/refresh error:', error);
      return res.status(500).json({ error: error.message || 'Failed to trigger refresh' });
    }
  });

  /**
   * POST /api/system/recalculate
   * Forces a manual workflow execution check.
   */
  router.post('/recalculate', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { uid, force } = req.body;
      const targetUid = uid || req.user?.uid;
      if (!targetUid) {
        return res.status(400).json({ error: 'User UID is required' });
      }

      const result = await service.recalculateWorkflows(targetUid, force === true);
      return res.json(result);
    } catch (error: any) {
      console.error('POST /system/recalculate error:', error);
      return res.status(500).json({ error: error.message || 'Failed to queue recalculation' });
    }
  });

  /**
   * GET /api/system/workflows
   * Returns catalog list of integrated pipelines.
   */
  router.get('/workflows', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const workflows = await service.getWorkflows();
      return res.json(workflows);
    } catch (error: any) {
      console.error('GET /system/workflows error:', error);
      return res.status(500).json({ error: error.message || 'Failed to list workflows' });
    }
  });

  return router;
}

export default createIntegrationRouter;
