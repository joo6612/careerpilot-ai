import { Request, Response, NextFunction } from 'express';
import { WidgetType } from './models';

const VALID_WIDGETS: WidgetType[] = [
  'career-snapshot',
  'career-readiness',
  'resume-summary',
  'roadmap-progress',
  'todays-tasks',
  'ai-recommendations',
  'recent-activity',
  'career-vault-summary',
  'assessment-summary',
  'learning-progress'
];

export const validateDashboardQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { widgets } = req.query;
    if (widgets && typeof widgets === 'string') {
      const parts = widgets.split(',').map(w => w.trim());
      for (const part of parts) {
        if (!VALID_WIDGETS.includes(part as WidgetType)) {
          return res.status(400).json({
            error: `Invalid widget type request: '${part}'. Valid widget types: ${VALID_WIDGETS.join(', ')}`
          });
        }
      }
    }
    next();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
