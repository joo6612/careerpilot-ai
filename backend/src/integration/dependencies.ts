import { WorkflowExecutors } from './workflow';
import { IntegrationOrchestrator } from './orchestrator';
import { IntegrationService } from './integration_service';
import { createIntegrationRouter } from './router';

// Import public services from other modules
import { discoveryService } from '../discovery/dependencies';
import { assessmentService } from '../assessment/dependencies';
import { resumeService } from '../resume/dependencies';
import { readinessService } from '../readiness/dependencies';
import { roadmapService } from '../roadmap/dependencies';
import { vaultService } from '../storage/career_vault/dependencies';

const executors = new WorkflowExecutors(
  discoveryService,
  assessmentService,
  resumeService,
  readinessService,
  roadmapService,
  vaultService
);

const orchestrator = new IntegrationOrchestrator(executors);
// Auto-initialize event subscribers on startup
orchestrator.initialize();

const service = new IntegrationService(orchestrator);
const integrationRouter = createIntegrationRouter(service);

export { executors, orchestrator, service as integrationService, integrationRouter };
export default integrationRouter;
