import { UserProfile } from '../types';
import { RoadmapRepository } from './repository';
import { CareerRepository } from '../career/repository';
import { AssessmentResult } from '../assessment/models';
import { UserRoadmap, RoadmapHistoryItem, RoadmapProgress } from './models';
import { RoadmapGenerator } from './generator';
import { RoadmapScheduler } from './scheduler';
import { RoadmapProgressTracker } from './progress';
import { RoadmapNotFoundError } from './exceptions';
import { CareerNotFoundError } from '../career/exceptions';
import { DbService } from '../services/db';
import { createHash } from 'crypto';

export class RoadmapService {
  constructor(
    private repository: RoadmapRepository,
    private careerRepository: CareerRepository
  ) {}

  private computeProfileHash(profile: UserProfile, assessments: AssessmentResult[]): string {
    const dataToHash = {
      selectedCareer: profile.selectedCareer,
      skills: (profile.skills || []).sort(),
      timeAvailability: profile.timeAvailability,
      interests: (profile.interests || []).sort(),
      assessments: assessments.map(a => ({ id: a.sessionId, percentage: a.percentage })).sort((a, b) => a.id.localeCompare(b.id))
    };
    return createHash('sha256').update(JSON.stringify(dataToHash)).digest('hex');
  }

  /**
   * Generates or regenerates an adaptive roadmap while preserving completed tasks and milestones.
   */
  async generateOrRegenerateRoadmap(
    uid: string,
    profile: UserProfile,
    assessments: AssessmentResult[]
  ): Promise<UserRoadmap> {
    const careerId = profile.selectedCareer;
    if (!careerId) {
      throw new Error('Target career path has not been selected on your profile.');
    }

    // Resolve robust career lookup (synonyms search)
    let career = await this.careerRepository.getById(careerId);
    if (!career) {
      const normalized = careerId.toLowerCase().trim().replace(/\s+/g, '-');
      career = await this.careerRepository.getById(normalized);
      if (!career && (normalized === 'data-analysis' || normalized === 'data-analytics')) {
        career = await this.careerRepository.getById('data-analyst');
      }
      if (!career) {
        throw new CareerNotFoundError(careerId);
      }
    }

    // Load active roadmap to capture progress
    const active = await this.repository.getActive(uid);
    const currentHash = this.computeProfileHash(profile, assessments);

    if (active && (active as any).profileHash === currentHash) {
      console.log('[RoadmapService] Profile and assessment data are unchanged. Skipping roadmap regeneration.');
      return active;
    }

    const completedTaskTitles: string[] = [];
    const completedMilestoneTitles: string[] = [];

    if (active) {
      active.phases.forEach(phase => {
        phase.milestones.forEach(m => {
          if (m.status === 'completed') {
            completedMilestoneTitles.push(m.title.toLowerCase().trim());
          }
          m.tasks.forEach(t => {
            if (t.status === 'completed') {
              completedTaskTitles.push(t.title.toLowerCase().trim());
            }
          });
        });
      });
    }

    // Generate new baseline roadmap structure
    const roadmap = await RoadmapGenerator.generate(uid, profile, career, assessments);

    // Apply adaptive progress preservation
    if (active) {
      roadmap.phases.forEach(phase => {
        phase.milestones.forEach(m => {
          const milTitle = m.title.toLowerCase().trim();
          if (completedMilestoneTitles.includes(milTitle)) {
            m.status = 'completed';
          }
          m.tasks.forEach(t => {
            const taskTitle = t.title.toLowerCase().trim();
            if (completedTaskTitles.includes(taskTitle)) {
              t.status = 'completed';
            }
          });

          // If all tasks are completed in milestone, mark milestone completed
          const allTasksDone = m.tasks.length > 0 && m.tasks.every(t => t.status === 'completed');
          if (allTasksDone) {
            m.status = 'completed';
          }
        });
      });
    }

    // Schedule pacing dates based on weekly hours availability
    const hoursPerDay = parseInt(profile.timeAvailability?.hoursPerDay || '2');
    const daysPerWeek = parseInt(profile.timeAvailability?.daysPerWeek || '5');
    const hoursPerWeek = hoursPerDay * daysPerWeek || 10;
    RoadmapScheduler.scheduleMilestones(roadmap, hoursPerWeek);

    // Calculate progress percentages
    const progress = RoadmapProgressTracker.calculateProgress(roadmap);
    roadmap.completionPercentage = progress.completionPercentage;
    roadmap.estimatedRemainingTimeHours = progress.estimatedRemainingTimeHours;

    // Save and cache history
    (roadmap as any).profileHash = currentHash;
    await this.repository.save(roadmap);
    await this.repository.saveHistoryItem({
      id: `road-h-${Date.now()}`,
      uid,
      timestamp: new Date().toISOString(),
      roadmap
    });

    // Synchronize backwards compatibility flat array with DbService
    await this.saveLegacyRoadmap(uid, roadmap);

    return roadmap;
  }

  /**
   * Retrieves current active roadmap. Throws RoadmapNotFoundError if none.
   */
  async getActiveRoadmap(uid: string): Promise<UserRoadmap> {
    const roadmap = await this.repository.getActive(uid);
    if (!roadmap) {
      throw new RoadmapNotFoundError(uid);
    }
    return roadmap;
  }

  /**
   * Updates status of a task and recalculates progress.
   */
  async updateTaskStatus(
    uid: string,
    taskId: string,
    status: 'locked' | 'in-progress' | 'completed'
  ): Promise<UserRoadmap> {
    const roadmap = await this.getActiveRoadmap(uid);
    let found = false;

    roadmap.phases.forEach(phase => {
      phase.milestones.forEach(m => {
        m.tasks.forEach(t => {
          if (t.id === taskId) {
            t.status = status;
            found = true;
          }
        });

        // Automatically update milestone status based on task completion
        const allDone = m.tasks.length > 0 && m.tasks.every(t => t.status === 'completed');
        const anyInProgress = m.tasks.some(t => t.status === 'in-progress');
        if (allDone) {
          m.status = 'completed';
        } else if (anyInProgress) {
          m.status = 'in-progress';
        }
      });
    });

    if (!found) {
      throw new Error(`Roadmap task with ID '${taskId}' was not found.`);
    }

    const progress = RoadmapProgressTracker.calculateProgress(roadmap);
    roadmap.completionPercentage = progress.completionPercentage;
    roadmap.estimatedRemainingTimeHours = progress.estimatedRemainingTimeHours;

    await this.repository.save(roadmap);
    await this.saveLegacyRoadmap(uid, roadmap);

    return roadmap;
  }

  /**
   * Updates status of a milestone.
   */
  async updateMilestoneStatus(
    uid: string,
    milestoneId: string,
    status: 'locked' | 'in-progress' | 'completed'
  ): Promise<UserRoadmap> {
    const roadmap = await this.getActiveRoadmap(uid);
    let found = false;

    // Flatten milestones in chronological order
    const allMilestones: any[] = [];
    roadmap.phases.forEach(phase => {
      phase.milestones.forEach(m => allMilestones.push(m));
    });

    const targetIdx = allMilestones.findIndex(m => m.id === milestoneId);
    if (targetIdx !== -1) {
      found = true;
      allMilestones[targetIdx].status = status;

      // Cascade to tasks if status is completed or locked
      if (status === 'completed') {
        allMilestones[targetIdx].tasks.forEach((t: any) => t.status = 'completed');
        // Auto-unlock immediate next milestone if currently locked
        if (targetIdx + 1 < allMilestones.length && allMilestones[targetIdx + 1].status === 'locked') {
          allMilestones[targetIdx + 1].status = 'in-progress';
        }
      } else if (status === 'locked') {
        allMilestones[targetIdx].tasks.forEach((t: any) => t.status = 'locked');
      }
    }

    if (!found) {
      throw new Error(`Roadmap milestone with ID '${milestoneId}' was not found.`);
    }

    const progress = RoadmapProgressTracker.calculateProgress(roadmap);
    roadmap.completionPercentage = progress.completionPercentage;
    roadmap.estimatedRemainingTimeHours = progress.estimatedRemainingTimeHours;

    await this.repository.save(roadmap);
    await this.saveLegacyRoadmap(uid, roadmap);

    return roadmap;
  }

  /**
   * Gets details progress analytics.
   */
  async getProgress(uid: string): Promise<RoadmapProgress> {
    const roadmap = await this.getActiveRoadmap(uid);
    return RoadmapProgressTracker.calculateProgress(roadmap);
  }

  /**
   * Gets full history.
   */
  async getHistory(uid: string): Promise<RoadmapHistoryItem[]> {
    return this.repository.getHistory(uid);
  }

  /**
   * Converts and synchronizes new structured roadmap with legacy flat RoadmapItem[] format.
   */
  private async saveLegacyRoadmap(uid: string, roadmap: UserRoadmap): Promise<void> {
    const legacyItems = roadmap.phases.flatMap(phase =>
      phase.milestones.map(m => ({
        id: m.id,
        title: m.title,
        description: m.expectedOutcome,
        status: m.status,
        duration: `${m.tasks.reduce((sum, t) => sum + t.estimatedHours, 0)} hours`,
        skills: m.tasks.flatMap(t => t.requiredSkills),
        topics: m.tasks.map(t => t.title),
        progressPercent: m.status === 'completed' ? 100 : m.status === 'in-progress' ? 50 : 0
      }))
    );
    await DbService.saveUserRoadmap(uid, legacyItems as any);
  }
}
export default RoadmapService;
