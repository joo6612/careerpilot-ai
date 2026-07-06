import { UserProfile, RoadmapItem } from '../types';
import { AssessmentResult } from '../assessment/models';
import { ResumeVersion } from '../resume/models';
import { ReadinessReport } from '../readiness/models';
import { UserRoadmap } from '../roadmap/models';
import { VaultDocument } from '../storage/career_vault/models';
import { Conversation } from '../mentor/models';

export interface CareerSnapshot {
  currentCareer: string;
  careerMatchPercentage: number;
  careerReadiness: number;
  resumeAtsScore: number;
  verifiedSkills: string[];
  completedAssessments: number;
  roadmapProgress: number;
  certificatesCount: number;
  projectsCount: number;
  documentsCount: number;
  currentGoal: string;
  estimatedTimeToBecomeJobReady: string;
  lastUpdated: string;
}

export type WidgetType =
  | 'career-snapshot'
  | 'career-readiness'
  | 'resume-summary'
  | 'roadmap-progress'
  | 'todays-tasks'
  | 'ai-recommendations'
  | 'recent-activity'
  | 'career-vault-summary'
  | 'assessment-summary'
  | 'learning-progress';

export interface DashboardWidget<T = any> {
  id: string;
  type: WidgetType;
  title: string;
  gridArea: string;
  data: T;
}

export type ActivityType =
  | 'Profile Updated'
  | 'Resume Uploaded'
  | 'Assessment Completed'
  | 'Certificate Uploaded'
  | 'Roadmap Generated'
  | 'Career Changed'
  | 'Mentor Conversation';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  meta?: any;
}

export interface DashboardInsights {
  topPriority: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  nextRecommendation: string;
  upcomingMilestone: string;
}

export interface ScoreHistoryPoint {
  timestamp: string;
  score: number;
}

export interface DashboardAnalytics {
  weeklyProgress: { week: string; tasksCompleted: number }[];
  monthlyProgress: { month: string; milestonesCompleted: number }[];
  careerTrend: { timestamp: string; selectedCareer: string }[];
  readinessTrend: ScoreHistoryPoint[];
  resumeImprovementTrend: ScoreHistoryPoint[];
  roadmapCompletionTrend: { timestamp: string; completionPercentage: number }[];
}

export interface DashboardResponse {
  uid: string;
  snapshot: CareerSnapshot;
  widgets: DashboardWidget[];
  activities: RecentActivity[];
  analytics: DashboardAnalytics;
  insights: DashboardInsights;
  timestamp: string;
}
