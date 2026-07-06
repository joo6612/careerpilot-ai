import { EventBus } from './event_bus';
import { EventCatalog } from './event_catalog';
import { DbService } from '../services/db';
import { DiscoveryService } from '../discovery/service';
import { AssessmentService } from '../assessment/service';
import { ResumeService } from '../resume/service';
import { ReadinessService } from '../readiness/service';
import { RoadmapService } from '../roadmap/service';
import { VaultService } from '../storage/career_vault/service';

export class WorkflowExecutors {
  constructor(
    public discoveryService: DiscoveryService,
    public assessmentService: AssessmentService,
    public resumeService: ResumeService,
    public readinessService: ReadinessService,
    public roadmapService: RoadmapService,
    public vaultService: VaultService
  ) {}

  /**
   * Workflow 1: User completes Profile
   * Profile Saved -> Discovery refreshes -> Readiness recalculates -> Roadmap regenerates -> Dashboard refreshes
   */
  async runProfileUpdatedWorkflow(uid: string): Promise<void> {
    const startTime = Date.now();
    console.log(`[WORKFLOW-LOG] [START] Workflow 1: Profile Updated | Triggered Modules: Profile | User: ${uid}`);
    try {
      const profile = await DbService.getUserProfile(uid);
      if (!profile) throw new Error(`Profile not found for User ${uid}`);

      const assessments = await this.assessmentService.getAttemptsHistory(uid).catch(() => []);

      // 1. Refresh discovery recommendations
      console.log(`[WORKFLOW-LOG] Running Career Discovery for User: ${uid}`);
      await this.discoveryService.runDiscovery(uid, profile, assessments);

      // 2. Recalculate Career Readiness scores
      console.log(`[WORKFLOW-LOG] Recalculating Career Readiness for User: ${uid}`);
      await this.readinessService.calculateReadiness(uid, profile, assessments);

      // 3. Regenerate learning roadmaps
      console.log(`[WORKFLOW-LOG] Regenerating learning roadmap for User: ${uid}`);
      await this.roadmapService.generateOrRegenerateRoadmap(uid, profile, assessments);

      // 4. Trigger dashboard updates
      console.log(`[WORKFLOW-LOG] Refreshing Dashboard for User: ${uid}`);
      EventBus.publish(EventCatalog.DASHBOARD_REFRESHED, { uid });

      const elapsed = Date.now() - startTime;
      console.log(`[WORKFLOW-LOG] [SUCCESS] Workflow 1: Profile Updated completed in ${elapsed}ms | Triggered: Profile, Discovery, Readiness, Roadmap, Dashboard`);
    } catch (err: any) {
      console.error(`[WORKFLOW-LOG] [FAILED] Workflow 1: Profile Updated failed: ${err.message}`);
    }
  }

  /**
   * Workflow 2: Assessment completed
   * Assessment Submit -> Verified Skills updated -> Readiness updated -> Roadmap updated -> Dashboard updated
   */
  async runAssessmentCompletedWorkflow(uid: string): Promise<void> {
    const startTime = Date.now();
    console.log(`[WORKFLOW-LOG] [START] Workflow 2: Assessment Completed | Triggered Modules: Assessment | User: ${uid}`);
    try {
      const profile = await DbService.getUserProfile(uid);
      if (!profile) throw new Error(`Profile not found for User ${uid}`);

      const assessments = await this.assessmentService.getAttemptsHistory(uid).catch(() => []);

      // 1. Recalculate Career Readiness (incorporates new assessment scores into verified scores)
      console.log(`[WORKFLOW-LOG] Recalculating Career Readiness for User: ${uid}`);
      await this.readinessService.calculateReadiness(uid, profile, assessments);

      // 2. Regenerate adaptive roadmap (milestone tasks adjust based on new verified skills)
      console.log(`[WORKFLOW-LOG] Regenerating learning roadmap for User: ${uid}`);
      await this.roadmapService.generateOrRegenerateRoadmap(uid, profile, assessments);

      // 3. Trigger dashboard updates
      console.log(`[WORKFLOW-LOG] Refreshing Dashboard for User: ${uid}`);
      EventBus.publish(EventCatalog.DASHBOARD_REFRESHED, { uid });

      const elapsed = Date.now() - startTime;
      console.log(`[WORKFLOW-LOG] [SUCCESS] Workflow 2: Assessment Completed completed in ${elapsed}ms | Triggered: Assessment, Readiness, Roadmap, Dashboard`);
    } catch (err: any) {
      console.error(`[WORKFLOW-LOG] [FAILED] Workflow 2: Assessment Completed failed: ${err.message}`);
    }
  }

  /**
   * Workflow 3: Resume uploaded
   * Resume Uploaded -> Analyze -> Save to Vault -> Readiness Recalculate -> Dashboard updates
   */
  async runResumeAnalyzedWorkflow(uid: string, resumeVersion: any): Promise<void> {
    const startTime = Date.now();
    console.log(`[WORKFLOW-LOG] [START] Workflow 3: Resume Analyzed | Triggered Modules: Resume | User: ${uid}`);
    try {
      const profile = await DbService.getUserProfile(uid);
      if (!profile) throw new Error(`Profile not found for User ${uid}`);

      const assessments = await this.assessmentService.getAttemptsHistory(uid).catch(() => []);

      // 1. Save Resume Document in Career Vault
      console.log(`[WORKFLOW-LOG] Storing Resume document in Career Vault for User: ${uid}`);
      const fileName = resumeVersion.fileName || 'resume.txt';
      const textContent = resumeVersion.textContent || '';
      
      const existingDocs = await this.vaultService.getDocuments(uid).catch(() => []);
      const duplicate = existingDocs.find(d => 
        d.category === 'Resume' && 
        d.originalFileName === fileName && 
        d.status === 'active'
      );
      
      if (duplicate) {
        await this.vaultService.updateDocument(uid, duplicate.id, {
          title: `Resume: ${fileName}`,
          description: 'Auto-updated analyzed resume document.',
          textContent: textContent
        });
      } else {
        await this.vaultService.uploadDocument(uid, {
          category: 'Resume',
          title: `Resume: ${fileName}`,
          description: 'Auto-saved analyzed resume document.',
          fileName: fileName,
          fileType: 'txt',
          fileSize: textContent.length,
          textContent: textContent,
          tags: []
        });
      }

      // 2. Recalculate Career Readiness (incorporates new ATS scores)
      console.log(`[WORKFLOW-LOG] Recalculating Career Readiness for User: ${uid}`);
      await this.readinessService.calculateReadiness(uid, profile, assessments);

      // 3. Trigger dashboard updates
      console.log(`[WORKFLOW-LOG] Refreshing Dashboard for User: ${uid}`);
      EventBus.publish(EventCatalog.DASHBOARD_REFRESHED, { uid });

      const elapsed = Date.now() - startTime;
      console.log(`[WORKFLOW-LOG] [SUCCESS] Workflow 3: Resume Analyzed completed in ${elapsed}ms | Triggered: Resume, Vault, Readiness, Dashboard`);
    } catch (err: any) {
      console.error(`[WORKFLOW-LOG] [FAILED] Workflow 3: Resume Analyzed failed: ${err.message}`);
    }
  }

  /**
   * Workflow 4: Certificate uploaded
   * Certificate Document Uploaded -> Sync to Profile -> Readiness Recalculate -> Roadmap Regenerate -> Dashboard refreshes
   */
  async runCertificateUploadedWorkflow(uid: string, document: any): Promise<void> {
    const startTime = Date.now();
    console.log(`[WORKFLOW-LOG] [START] Workflow 4: Certificate Uploaded | Triggered Modules: Vault | User: ${uid}`);
    try {
      const profile = await DbService.getUserProfile(uid);
      if (!profile) throw new Error(`Profile not found for User ${uid}`);

      const assessments = await this.assessmentService.getAttemptsHistory(uid).catch(() => []);

      // 1. Sync certificate to Profile certifications list
      console.log(`[WORKFLOW-LOG] Synchronizing certificate to profile for User: ${uid}`);
      const currentCerts = profile.certifications || [];
      const hasCert = currentCerts.some(c => c.courseName === document.title);
      if (!hasCert) {
        currentCerts.push({
          courseName: document.title,
          provider: document.description || 'Uploaded Document',
          fileName: document.originalFileName
        });
        profile.certifications = currentCerts;
        await DbService.saveUserProfile(uid, profile);
      }

      // 2. Recalculate Career Readiness (updates certification readiness metrics)
      console.log(`[WORKFLOW-LOG] Recalculating Career Readiness for User: ${uid}`);
      await this.readinessService.calculateReadiness(uid, profile, assessments);

      // 3. Regenerate Roadmap (potential updates to milestones based on cert additions)
      console.log(`[WORKFLOW-LOG] Regenerating learning roadmap for User: ${uid}`);
      await this.roadmapService.generateOrRegenerateRoadmap(uid, profile, assessments);

      // 4. Trigger dashboard updates
      console.log(`[WORKFLOW-LOG] Refreshing Dashboard for User: ${uid}`);
      EventBus.publish(EventCatalog.DASHBOARD_REFRESHED, { uid });

      const elapsed = Date.now() - startTime;
      console.log(`[WORKFLOW-LOG] [SUCCESS] Workflow 4: Certificate Uploaded completed in ${elapsed}ms | Triggered: Vault, Profile, Readiness, Roadmap, Dashboard`);
    } catch (err: any) {
      console.error(`[WORKFLOW-LOG] [FAILED] Workflow 4: Certificate Uploaded failed: ${err.message}`);
    }
  }

  /**
   * Workflow 5: Career changed
   * Career selection updated -> Discovery Rerun -> Resume Update -> Readiness Recalculate -> Roadmap Regenerate -> Dashboard refreshes
   */
  async runCareerChangedWorkflow(uid: string, newCareerId: string): Promise<void> {
    const startTime = Date.now();
    console.log(`[WORKFLOW-LOG] [START] Workflow 5: Career Changed | Triggered Modules: Profile | User: ${uid} | New Career: ${newCareerId}`);
    try {
      const profile = await DbService.getUserProfile(uid);
      if (!profile) throw new Error(`Profile not found for User ${uid}`);

      const assessments = await this.assessmentService.getAttemptsHistory(uid).catch(() => []);

      // 1. Rerun Career Discovery recommendations
      console.log(`[WORKFLOW-LOG] Rerunning Career Discovery for User: ${uid}`);
      await this.discoveryService.runDiscovery(uid, profile, assessments);

      // 2. Update Resume Intelligence analysis for new career path (if a resume was uploaded)
      const latestResume = await this.resumeService.getLatestResume(uid).catch(() => null);
      if (latestResume) {
        console.log(`[WORKFLOW-LOG] Updating ATS analysis against new career track for User: ${uid}`);
        await this.resumeService.analyzeLatestResume(uid, profile, assessments);
      }

      // 3. Recalculate Career Readiness scores for the new career path
      console.log(`[WORKFLOW-LOG] Recalculating Career Readiness for User: ${uid}`);
      await this.readinessService.calculateReadiness(uid, profile, assessments);

      // 4. Regenerate learning roadmaps for the new career path
      console.log(`[WORKFLOW-LOG] Regenerating learning roadmap for User: ${uid}`);
      await this.roadmapService.generateOrRegenerateRoadmap(uid, profile, assessments);

      // 5. Trigger dashboard updates
      console.log(`[WORKFLOW-LOG] Refreshing Dashboard for User: ${uid}`);
      EventBus.publish(EventCatalog.DASHBOARD_REFRESHED, { uid });

      const elapsed = Date.now() - startTime;
      console.log(`[WORKFLOW-LOG] [SUCCESS] Workflow 5: Career Changed completed in ${elapsed}ms | Triggered: Profile, Discovery, Resume, Readiness, Roadmap, Dashboard`);
    } catch (err: any) {
      console.error(`[WORKFLOW-LOG] [FAILED] Workflow 5: Career Changed failed: ${err.message}`);
    }
  }
}
