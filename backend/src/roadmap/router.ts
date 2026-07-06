import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { RoadmapService } from './service';
import { RoadmapValidators } from './validators';
import { RoadmapNotFoundError } from './exceptions';
import { DbService } from '../services/db';
import { assessmentService } from '../assessment/dependencies';
import { CareerNotFoundError } from '../career/exceptions';
import { RoadmapProgressTracker } from './progress';

export function createRoadmapRouter(service: RoadmapService): Router {
  const router = Router();

  const toLegacyFlatArray = (roadmap: any) => {
    return roadmap.phases.flatMap((phase: any) =>
      phase.milestones.map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.expectedOutcome,
        status: m.status,
        duration: `${(m.tasks || []).reduce((sum: number, t: any) => sum + (t.estimatedHours || 0), 0)} hours`,
        skills: (m.tasks || []).flatMap((t: any) => t.requiredSkills || []),
        topics: (m.tasks || []).map((t: any) => t.title),
        progressPercent: m.status === 'completed' ? 100 : m.status === 'in-progress' ? 50 : 0
      }))
    );
  };

  /**
   * POST /api/roadmap/generate
   * Generates or regenerates a personalized adaptive roadmap.
   */
  router.post('/generate', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;

      const profile = await DbService.getUserProfile(uid);
      if (!profile) {
        return res.status(404).json({ error: 'User profile not found. Please complete onboarding details first.' });
      }

      // Enforce roadmap generation constraints
      const completeness = profile.profileCompletion || 0;
      if (!profile.selectedCareer || profile.selectedCareer.trim() === '') {
        return res.status(400).json({ error: 'Roadmap Generation Pre-constraint Failed: Target career not selected. Please select a career goal.' });
      }
      if (!profile.skills || profile.skills.length === 0) {
        return res.status(400).json({ error: 'Roadmap Generation Pre-constraint Failed: Skills extraction not completed. Please chat with the mentor to parse skills.' });
      }
      if (completeness < 50) {
        return res.status(400).json({ error: `Roadmap Generation Pre-constraint Failed: Profile completeness is only ${completeness}%, which is below the 50% threshold.` });
      }

      const assessments = await assessmentService.getAttemptsHistory(uid);
      const roadmap = await service.generateOrRegenerateRoadmap(uid, profile, assessments);

      return res.json(toLegacyFlatArray(roadmap));
    } catch (error: any) {
      if (error instanceof CareerNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('POST /roadmap/generate error:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate learning roadmap' });
    }
  });

  /**
   * GET /api/roadmap
   * Returns current active user roadmap.
   */
  router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const roadmap = await service.getActiveRoadmap(uid);
      return res.json(toLegacyFlatArray(roadmap));
    } catch (error: any) {
      if (error instanceof RoadmapNotFoundError) {
        return res.json([]);
      }
      console.error('GET /roadmap error:', error);
      return res.status(500).json({ error: 'Failed to retrieve learning roadmap' });
    }
  });

  /**
   * PATCH /api/roadmap/task
   * Updates status of a task.
   */
  router.patch('/task', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { taskId, status } = RoadmapValidators.validateTaskStatusUpdate(req.body);
      const result = await service.updateTaskStatus(uid, taskId, status);
      return res.json(result);
    } catch (error: any) {
      console.error('PATCH /roadmap/task error:', error);
      return res.status(400).json({ error: error.message || 'Failed to update task status' });
    }
  });

  /**
   * PATCH /api/roadmap/milestone
   * Updates status of a milestone.
   */
  router.patch('/milestone', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { milestoneId, status } = RoadmapValidators.validateMilestoneStatusUpdate(req.body);
      const result = await service.updateMilestoneStatus(uid, milestoneId, status);
      return res.json(result);
    } catch (error: any) {
      console.error('PATCH /roadmap/milestone error:', error);
      return res.status(400).json({ error: error.message || 'Failed to update milestone status' });
    }
  });

  /**
   * GET /api/roadmap/progress
   * Returns readiness progress statistics.
   */
  router.get('/progress', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const progress = await service.getProgress(uid);
      return res.json(progress);
    } catch (error: any) {
      if (error instanceof RoadmapNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('GET /roadmap/progress error:', error);
      return res.status(500).json({ error: 'Failed to retrieve progress statistics' });
    }
  });

  /**
   * GET /api/roadmap/history
   * Returns history of past roadmaps.
   */
  router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const history = await service.getHistory(uid);
      return res.json(history);
    } catch (error: any) {
      console.error('GET /roadmap/history error:', error);
      return res.status(500).json({ error: 'Failed to retrieve roadmap history' });
    }
  });

  /**
   * POST /api/roadmap/toggle
   * Legacy toggle compatibility support. Expects { id } in body, toggles milestone status, and returns flat array.
   */
  router.post('/toggle', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Roadmap item ID is required' });
      }

      // Load active roadmap
      const roadmap = await service.getActiveRoadmap(uid);
      let isTask = false;
      let currentStatus: any = 'locked';

      // Check if ID is task or milestone
      roadmap.phases.forEach(phase => {
        phase.milestones.forEach(m => {
          if (m.id === id) {
            currentStatus = m.status;
          }
          m.tasks.forEach(t => {
            if (t.id === id) {
              isTask = true;
              currentStatus = t.status;
            }
          });
        });
      });

      const nextStatus = currentStatus === 'completed'
        ? 'in-progress'
        : currentStatus === 'in-progress'
          ? 'completed'
          : 'in-progress'; // default to in-progress when locked

      let updatedRoadmap;
      if (isTask) {
        updatedRoadmap = await service.updateTaskStatus(uid, id, nextStatus);
      } else {
        updatedRoadmap = await service.updateMilestoneStatus(uid, id, nextStatus);
      }

      return res.json(toLegacyFlatArray(updatedRoadmap));
    } catch (error: any) {
      console.error('POST /roadmap/toggle compatibility error:', error);
      return res.status(500).json({ error: error.message || 'Failed to toggle status' });
    }
  });

  return router;
}
export default createRoadmapRouter;
