export interface ReadinessCategoryScores {
  skillReadiness: number;        // 0 to 100
  resumeReadiness: number;       // 0 to 100
  projectReadiness: number;      // 0 to 100
  certificationReadiness: number; // 0 to 100
  educationReadiness: number;    // 0 to 100
  assessmentReadiness: number;   // 0 to 100
  learningProgress: number;      // 0 to 100
}

export interface ReadinessRecommendation {
  id: string;
  action: string;
  reason: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedTimeHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  expectedImpact: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface ReadinessReport {
  overallReadiness: number;
  status: 'Not Ready' | 'Getting Ready' | 'Almost Ready' | 'Job Ready' | 'Industry Ready';
  categoryScores: ReadinessCategoryScores;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendations: ReadinessRecommendation[];
  estimatedCompletionTimeHours: number;
  confidence: 'Low' | 'Medium' | 'High';
  metadata: {
    timestamp: string;
    careerId: string;
    careerTitle: string;
  };
}

export interface ReadinessHistoryItem {
  id: string;
  uid: string;
  timestamp: string;
  report: ReadinessReport;
}

export interface ReadinessTrend {
  historicalScores: { timestamp: string; score: number }[];
  skillsVerificationsPassed: number;
  overallScoreChange: number;
}
