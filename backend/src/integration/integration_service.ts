import { IntegrationOrchestrator } from './orchestrator';
import { EventBus } from './event_bus';
import { EventCatalog } from './event_catalog';

export class IntegrationService {
  constructor(private orchestrator: IntegrationOrchestrator) {}

  /**
   * Returns system orchestration status, logs, and stats.
   */
  async getStatus(): Promise<any> {
    const logs = this.orchestrator.getLogs();
    const stats = this.orchestrator.getStats();

    return {
      status: 'active',
      timestamp: new Date().toISOString(),
      orchestratorActive: true,
      eventBusSubscribersCount: 4, // PROFILE_UPDATED, ASSESSMENT_COMPLETED, RESUME_ANALYZED, DOCUMENT_UPLOADED
      totalWorkflowsRun: Object.values(stats).reduce((sum, s) => sum + s.startedCount, 0),
      stats,
      recentLogs: logs.slice(-20) // Retain last 20 execution logs
    };
  }

  /**
   * Manually triggers a dashboard refresh event.
   */
  async refreshDashboard(uid: string): Promise<void> {
    console.log(`[INTEGRATION-SERVICE] Manually triggering dashboard refresh for User: ${uid}`);
    EventBus.publish(EventCatalog.DASHBOARD_REFRESHED, { uid });
  }

  /**
   * Manually triggers recalculation of user workflows.
   */
  async recalculateWorkflows(uid: string, force = false): Promise<any> {
    console.log(`[INTEGRATION-SERVICE] Manually triggering recalculation for User: ${uid} | Force: ${force}`);
    if (force) {
      await this.orchestrator.forceRecalculate(uid);
    } else {
      // Trigger profile update flow as baseline check which checks for changes
      EventBus.publish(EventCatalog.PROFILE_UPDATED, { uid, profile: null });
    }
    return { success: true, message: `Recalculation request queued for User: ${uid}` };
  }

  /**
   * Returns registered workflows and their descriptors.
   */
  async getWorkflows(): Promise<any[]> {
    const stats = this.orchestrator.getStats();
    return [
      {
        id: 'wf-1',
        name: 'Workflow 1: Profile Updated Pipeline',
        description: 'Updates Career Discovery recommendations, recalculates Readiness scores, regenerates Roadmap pacing, and refreshes the Dashboard when a user saves profile updates.',
        triggeredBy: 'PROFILE_UPDATED',
        steps: [
          'Career Discovery refresh',
          'Readiness score recalculation',
          'Roadmap tasks adapt and pace dates',
          'Dashboard refresh event'
        ],
        stats: stats['Workflow 1']
      },
      {
        id: 'wf-2',
        name: 'Workflow 2: Assessment Completed Pipeline',
        description: 'Appends new assessment results, marks verified skills, recalculates Readiness scores, and regenerates roadmap milestones.',
        triggeredBy: 'ASSESSMENT_COMPLETED',
        steps: [
          'Verify skills in database',
          'Readiness score updates',
          'Roadmap milestone tasks unlock',
          'Dashboard refresh event'
        ],
        stats: stats['Workflow 2']
      },
      {
        id: 'wf-3',
        name: 'Workflow 3: Resume Upload Pipeline',
        description: 'Grades resume keywords/structure, archives copy in Career Vault, updates overall Readiness, and refreshes the Dashboard.',
        triggeredBy: 'RESUME_ANALYZED',
        steps: [
          'Resume analysis and grading',
          'Store txt draft in Vault',
          'Readiness score updates',
          'Dashboard refresh event'
        ],
        stats: stats['Workflow 3']
      },
      {
        id: 'wf-4',
        name: 'Workflow 4: Certificate Upload Pipeline',
        description: 'Registers certificate document in Vault, syncs details to profile lists, updates overall Readiness, regenerates Roadmap milestone, and refreshes the Dashboard.',
        triggeredBy: 'DOCUMENT_UPLOADED (Certificate)',
        steps: [
          'Vault document validation',
          'Profile certifications sync',
          'Readiness score updates',
          'Roadmap milestone tasks unlock',
          'Dashboard refresh event'
        ],
        stats: stats['Workflow 4']
      },
      {
        id: 'wf-5',
        name: 'Workflow 5: Career Changed Pipeline',
        description: 'Triggers when a career change is detected on profile. Reruns Career Discovery, updates Resume ATS analysis, updates Readiness scores, regenerates Roadmap milestones, and refreshes the Dashboard.',
        triggeredBy: 'CAREER_SELECTED',
        steps: [
          'Rerun career matching discovery',
          'Update Resume ATS matching against new track',
          'Readiness score recalculation',
          'Regenerate roadmap milestones',
          'Dashboard refresh event'
        ],
        stats: stats['Workflow 5']
      }
    ];
  }
}
export default IntegrationService;
