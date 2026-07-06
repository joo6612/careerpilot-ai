import { DbService } from '../services/db';
import { CareerService } from '../career/service';
import { DiscoveryService } from '../discovery/service';
import { AssessmentService } from '../assessment/service';
import { ResumeService } from '../resume/service';
import { ReadinessService } from '../readiness/service';
import { RoadmapService } from '../roadmap/service';
import { VaultService } from '../storage/career_vault/service';
import { MentorService } from '../mentor/service';

import { UserProfile } from '../types';
import { DiscoveryHistoryItem } from '../discovery/models';
import { AssessmentResult } from '../assessment/models';
import { ResumeVersion } from '../resume/models';
import { ReadinessReport, ReadinessHistoryItem, ReadinessTrend } from '../readiness/models';
import { UserRoadmap, RoadmapHistoryItem } from '../roadmap/models';
import { VaultDocument } from '../storage/career_vault/models';
import { Conversation } from '../mentor/models';
import { Career } from '../career/models';

export interface AggregatedData {
  uid: string;
  profile: UserProfile | null;
  latestDiscovery: DiscoveryHistoryItem | null;
  discoveryHistory: DiscoveryHistoryItem[];
  assessmentAttempts: AssessmentResult[];
  latestResume: ResumeVersion | null;
  resumeHistory: ResumeVersion[];
  latestReadiness: ReadinessReport | null;
  readinessHistory: ReadinessHistoryItem[];
  readinessTrends: ReadinessTrend | null;
  activeRoadmap: UserRoadmap | null;
  roadmapHistory: RoadmapHistoryItem[];
  vaultDocuments: VaultDocument[];
  conversations: Conversation[];
  careerDetails: Career | null;
}

export class DashboardAggregator {
  constructor(
    private careerService: CareerService,
    private discoveryService: DiscoveryService,
    private assessmentService: AssessmentService,
    private resumeService: ResumeService,
    private readinessService: ReadinessService,
    private roadmapService: RoadmapService,
    private vaultService: VaultService,
    private mentorService: MentorService
  ) {}

  async aggregate(uid: string): Promise<AggregatedData> {
    const profile = await DbService.getUserProfile(uid);

    // Fetch all related modules data in parallel using Promise.all
    const [
      latestDiscovery,
      discoveryHistory,
      assessmentAttempts,
      latestResume,
      resumeHistory,
      latestReadiness,
      readinessHistory,
      readinessTrends,
      activeRoadmap,
      roadmapHistory,
      vaultDocuments,
      conversations
    ] = await Promise.all([
      this.discoveryService.getLatestRecommendations(uid).catch(() => null),
      this.discoveryService.getDiscoveryHistory(uid).catch(() => []),
      this.assessmentService.getAttemptsHistory(uid).catch(() => []),
      this.resumeService.getLatestResume(uid).catch(() => null),
      this.resumeService.getResumeHistory(uid).catch(() => []),
      this.readinessService.getLatestReport(uid).catch(() => null),
      this.readinessService.getHistory(uid).catch(() => []),
      this.readinessService.getTrends(uid).catch(() => null),
      this.roadmapService.getActiveRoadmap(uid).catch(() => null),
      this.roadmapService.getHistory(uid).catch(() => []),
      this.vaultService.getDocuments(uid).catch(() => []),
      this.mentorService.getHistory(uid).catch(() => [])
    ]);

    let careerDetails: Career | null = null;
    if (profile?.selectedCareer) {
      careerDetails = await this.careerService.getCareerById(profile.selectedCareer).catch(async () => {
        // Synonym retry mechanism
        const normalized = profile.selectedCareer.toLowerCase().trim().replace(/\s+/g, '-');
        let career = await this.careerService.getCareerById(normalized).catch(() => null);
        if (!career && (normalized === 'data-analysis' || normalized === 'data-analytics')) {
          career = await this.careerService.getCareerById('data-analyst').catch(() => null);
        }
        return career;
      });
    }

    return {
      uid,
      profile,
      latestDiscovery,
      discoveryHistory,
      assessmentAttempts,
      latestResume,
      resumeHistory,
      latestReadiness,
      readinessHistory,
      readinessTrends,
      activeRoadmap,
      roadmapHistory,
      vaultDocuments,
      conversations,
      careerDetails
    };
  }
}
