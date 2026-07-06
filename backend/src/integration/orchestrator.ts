import { EventBus } from './event_bus';
import { EventCatalog } from './event_catalog';
import { WorkflowExecutors } from './workflow';
import { DbService } from '../services/db';

export interface WorkflowStats {
  startedCount: number;
  successCount: number;
  failureCount: number;
  lastExecutionTimeMs: number;
  lastStatus: 'success' | 'failed' | 'idle';
}

export class IntegrationOrchestrator {
  private cache = new Map<string, string>(); // User Uid -> JSON string of cached states
  private runningLocks = new Map<string, boolean>(); // User Uid -> Lock state
  private logs: any[] = [];
  
  private stats: Record<string, WorkflowStats> = {
    'Workflow 1': { startedCount: 0, successCount: 0, failureCount: 0, lastExecutionTimeMs: 0, lastStatus: 'idle' },
    'Workflow 2': { startedCount: 0, successCount: 0, failureCount: 0, lastExecutionTimeMs: 0, lastStatus: 'idle' },
    'Workflow 3': { startedCount: 0, successCount: 0, failureCount: 0, lastExecutionTimeMs: 0, lastStatus: 'idle' },
    'Workflow 4': { startedCount: 0, successCount: 0, failureCount: 0, lastExecutionTimeMs: 0, lastStatus: 'idle' },
    'Workflow 5': { startedCount: 0, successCount: 0, failureCount: 0, lastExecutionTimeMs: 0, lastStatus: 'idle' }
  };

  constructor(private executors: WorkflowExecutors) {}

  /**
   * Initializes subscriptions to system events on the centralized Event Bus.
   */
  initialize(): void {
    console.log('[ORCHESTRATOR] Initializing Event Subscriptions on Event Bus...');

    // 1. Profile Updated Hook -> Workflow 1 or 5
    EventBus.subscribe(EventCatalog.PROFILE_UPDATED, async (payload: { uid: string; profile: any }) => {
      await this.runOrchestrated(payload.uid, EventCatalog.PROFILE_UPDATED, async () => {
        const cached = this.getUserCache(payload.uid);
        const careerId = payload.profile?.selectedCareer || '';
        
        // If career selection changed, run Workflow 5. Otherwise, run Workflow 1.
        if (cached && cached.careerId !== careerId) {
          console.log(`[ORCHESTRATOR] Target career track changed from '${cached.careerId}' to '${careerId}' for User: ${payload.uid}`);
          this.stats['Workflow 5'].startedCount++;
          const start = Date.now();
          try {
            await this.executors.runCareerChangedWorkflow(payload.uid, careerId);
            this.stats['Workflow 5'].successCount++;
            this.stats['Workflow 5'].lastStatus = 'success';
          } catch (e) {
            this.stats['Workflow 5'].failureCount++;
            this.stats['Workflow 5'].lastStatus = 'failed';
            throw e;
          } finally {
            this.stats['Workflow 5'].lastExecutionTimeMs = Date.now() - start;
          }
        } else {
          this.stats['Workflow 1'].startedCount++;
          const start = Date.now();
          try {
            await this.executors.runProfileUpdatedWorkflow(payload.uid);
            this.stats['Workflow 1'].successCount++;
            this.stats['Workflow 1'].lastStatus = 'success';
          } catch (e) {
            this.stats['Workflow 1'].failureCount++;
            this.stats['Workflow 1'].lastStatus = 'failed';
            throw e;
          } finally {
            this.stats['Workflow 1'].lastExecutionTimeMs = Date.now() - start;
          }
        }
      });
    });

    // 2. Assessment Completed Hook -> Workflow 2
    EventBus.subscribe(EventCatalog.ASSESSMENT_COMPLETED, async (payload: { uid: string }) => {
      await this.runOrchestrated(payload.uid, EventCatalog.ASSESSMENT_COMPLETED, async () => {
        this.stats['Workflow 2'].startedCount++;
        const start = Date.now();
        try {
          await this.executors.runAssessmentCompletedWorkflow(payload.uid);
          this.stats['Workflow 2'].successCount++;
          this.stats['Workflow 2'].lastStatus = 'success';
        } catch (e) {
          this.stats['Workflow 2'].failureCount++;
          this.stats['Workflow 2'].lastStatus = 'failed';
          throw e;
        } finally {
          this.stats['Workflow 2'].lastExecutionTimeMs = Date.now() - start;
        }
      });
    });

    // 3. Resume Analyzed Hook -> Workflow 3
    EventBus.subscribe(EventCatalog.RESUME_ANALYZED, async (payload: { uid: string; resumeVersion: any }) => {
      await this.runOrchestrated(payload.uid, EventCatalog.RESUME_ANALYZED, async () => {
        this.stats['Workflow 3'].startedCount++;
        const start = Date.now();
        try {
          await this.executors.runResumeAnalyzedWorkflow(payload.uid, payload.resumeVersion);
          this.stats['Workflow 3'].successCount++;
          this.stats['Workflow 3'].lastStatus = 'success';
        } catch (e) {
          this.stats['Workflow 3'].failureCount++;
          this.stats['Workflow 3'].lastStatus = 'failed';
          throw e;
        } finally {
          this.stats['Workflow 3'].lastExecutionTimeMs = Date.now() - start;
        }
      });
    });

    // 4. Document Uploaded Hook -> Workflow 4 (if category is Certificate)
    EventBus.subscribe(EventCatalog.DOCUMENT_UPLOADED, async (payload: { uid: string; document: any }) => {
      if (payload.document?.category === 'Certificate') {
        await this.runOrchestrated(payload.uid, 'DOCUMENT_UPLOADED_CERTIFICATE', async () => {
          this.stats['Workflow 4'].startedCount++;
          const start = Date.now();
          try {
            await this.executors.runCertificateUploadedWorkflow(payload.uid, payload.document);
            this.stats['Workflow 4'].successCount++;
            this.stats['Workflow 4'].lastStatus = 'success';
          } catch (e) {
            this.stats['Workflow 4'].failureCount++;
            this.stats['Workflow 4'].lastStatus = 'failed';
            throw e;
          } finally {
            this.stats['Workflow 4'].lastExecutionTimeMs = Date.now() - start;
          }
        });
      }
    });
  }

  private eventQueues = new Map<string, Array<{ eventName: string; workflowFn: () => Promise<void>; force: boolean }>>();

  /**
   * Orchestrates execution using change-detection caching and concurrency locks.
   */
  private async runOrchestrated(
    uid: string,
    eventName: string,
    workflowFn: () => Promise<void>,
    force = false
  ): Promise<void> {
    // 1. Prevent concurrent runs by queueing and merging incoming events
    if (this.runningLocks.get(uid)) {
      console.log(`[ORCHESTRATOR] [QUEUED] User ${uid} has a running workflow. Queueing event: ${eventName}.`);
      
      let queue = this.eventQueues.get(uid);
      if (!queue) {
        queue = [];
        this.eventQueues.set(uid, queue);
      }
      
      const existingIdx = queue.findIndex(item => item.eventName === eventName);
      if (existingIdx !== -1) {
        console.log(`[ORCHESTRATOR] [MERGE] Duplicate event ${eventName} found in queue for user ${uid}. Merging...`);
        queue[existingIdx] = { eventName, workflowFn, force: force || queue[existingIdx].force };
      } else {
        queue.push({ eventName, workflowFn, force });
      }
      return;
    }

    this.runningLocks.set(uid, true);

    const logEntry = {
      timestamp: new Date().toISOString(),
      uid,
      event: eventName,
      status: 'started',
      elapsedMs: 0,
      error: null as string | null
    };
    this.logs.push(logEntry);

    const start = Date.now();

    try {
      // 2. Perform Input State Change Detection to avoid redundant processing
      const currentInputs = await this.fetchUserInputsState(uid);
      if (!force) {
        const cachedStr = this.cache.get(uid);
        if (cachedStr) {
          const cachedInputs = JSON.parse(cachedStr);
          const hasChanges = this.detectStateChanges(cachedInputs, currentInputs);
          if (!hasChanges) {
            console.log(`[ORCHESTRATOR] [SKIP] No meaningful input changes detected for User ${uid}. Skipping event: ${eventName}.`);
            logEntry.status = 'skipped';
            this.runningLocks.set(uid, false);
            await this.processNextQueueItem(uid);
            return;
          }
        }
      }
      
      // Update cache
      this.cache.set(uid, JSON.stringify(currentInputs));

      // Execute Workflow
      await workflowFn();
      logEntry.status = 'completed';
    } catch (err: any) {
      console.error(`[ORCHESTRATOR] [FAILED] Workflow for user ${uid} under event ${eventName} failed:`, err.message);
      logEntry.status = 'failed';
      logEntry.error = err.message;
    } finally {
      this.runningLocks.set(uid, false);
      logEntry.elapsedMs = Date.now() - start;
      await this.processNextQueueItem(uid);
    }
  }

  private async processNextQueueItem(uid: string): Promise<void> {
    const queue = this.eventQueues.get(uid);
    if (queue && queue.length > 0) {
      const nextItem = queue.shift()!;
      console.log(`[ORCHESTRATOR] [DEQUEUE] Processing next queued event: ${nextItem.eventName} for user ${uid}`);
      setImmediate(() => {
        this.runOrchestrated(uid, nextItem.eventName, nextItem.workflowFn, nextItem.force);
      });
    }
  }

  /**
   * Triggers manual recalculation (bypassing caching checks).
   */
  async forceRecalculate(uid: string): Promise<void> {
    await this.runOrchestrated(uid, 'MANUAL_FORCE_RECALCULATE', async () => {
      // Execute profile update as full recalculation pipeline baseline
      await this.executors.runProfileUpdatedWorkflow(uid);
    }, true);
  }

  /**
   * Helper to verify if any critical inputs have changed since last calculation.
   */
  private detectStateChanges(cached: any, current: any): boolean {
    return (
      cached.skillsHash !== current.skillsHash ||
      cached.careerId !== current.careerId ||
      cached.resumeTimestamp !== current.resumeTimestamp ||
      cached.assessmentsCount !== current.assessmentsCount ||
      cached.vaultDocsCount !== current.vaultDocsCount ||
      cached.profileDetailsHash !== current.profileDetailsHash
    );
  }

  /**
   * Gathers footprint of inputs to hash for comparison.
   */
  private async fetchUserInputsState(uid: string): Promise<any> {
    const profile = await DbService.getUserProfile(uid);
    const assessments = await this.executors.assessmentService.getAttemptsHistory(uid).catch(() => []);
    const vaultDocs = await this.executors.vaultService.getDocuments(uid).catch(() => []);
    const latestResume = await this.executors.resumeService.getLatestResume(uid).catch(() => null);

    return {
      skillsHash: (profile?.skills || []).sort().join(','),
      careerId: profile?.selectedCareer || '',
      resumeTimestamp: latestResume?.timestamp || '',
      assessmentsCount: assessments.length,
      vaultDocsCount: vaultDocs.length,
      profileDetailsHash: profile ? JSON.stringify({
        name: profile.name,
        aboutMe: profile.aboutMe,
        interests: profile.interests,
        favoriteSubjects: profile.favoriteSubjects,
        country: profile.country,
        expectedSalary: profile.expectedSalary,
        workPreference: profile.workPreference,
        education: profile.education,
        professionalDetails: profile.professionalDetails,
        projects: profile.projects
      }) : ''
    };
  }

  private getUserCache(uid: string): any | null {
    const cachedStr = this.cache.get(uid);
    return cachedStr ? JSON.parse(cachedStr) : null;
  }

  getLogs(): any[] {
    return this.logs;
  }

  getStats(): Record<string, WorkflowStats> {
    return this.stats;
  }
}
export default IntegrationOrchestrator;
