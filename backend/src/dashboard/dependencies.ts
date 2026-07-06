import { LocalDashboardRepository } from './repository';
import { DashboardAggregator } from './aggregator';
import { DashboardService } from './service';
import { createDashboardRouter } from './router';

// Import core services from other modules
import { careerService } from '../career/dependencies';
import { discoveryService } from '../discovery/dependencies';
import { assessmentService } from '../assessment/dependencies';
import { resumeService } from '../resume/dependencies';
import { readinessService } from '../readiness/dependencies';
import { roadmapService } from '../roadmap/dependencies';
import { vaultService } from '../storage/career_vault/dependencies';
import { mentorService } from '../mentor/dependencies';

const repository = new LocalDashboardRepository();
const aggregator = new DashboardAggregator(
  careerService,
  discoveryService,
  assessmentService,
  resumeService,
  readinessService,
  roadmapService,
  vaultService,
  mentorService
);

const service = new DashboardService(repository, aggregator);
const dashboardRouter = createDashboardRouter(service);

export { repository as dashboardRepository, service as dashboardService, dashboardRouter };
export default dashboardRouter;
