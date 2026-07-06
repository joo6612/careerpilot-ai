export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  priority: 'Low' | 'Medium' | 'High';
  requiredSkills: string[];
  status: 'locked' | 'in-progress' | 'completed';
  recommendedResource: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  type: 'Foundation' | 'Core Skills' | 'Projects' | 'Resume' | 'Interview Preparation' | 'Job Applications';
  expectedOutcome: string;
  status: 'locked' | 'in-progress' | 'completed';
  tasks: RoadmapTask[];
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  milestones: RoadmapMilestone[];
}

export interface UserRoadmap {
  id: string;
  uid: string;
  careerId: string;
  careerTitle: string;
  timestamp: string;
  phases: RoadmapPhase[];
  completionPercentage: number;
  estimatedRemainingTimeHours: number;
}

export interface RoadmapProgress {
  completedTasks: number;
  totalTasks: number;
  completedMilestones: number;
  totalMilestones: number;
  completionPercentage: number;
  estimatedRemainingTimeHours: number;
  weeklyProgress: { week: string; tasksCompleted: number }[];
  monthlyProgress: { month: string; milestonesCompleted: number }[];
}

export interface RoadmapHistoryItem {
  id: string;
  uid: string;
  timestamp: string;
  roadmap: UserRoadmap;
}
