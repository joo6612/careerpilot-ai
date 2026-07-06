export interface CareerMatchScore {
  overallMatch: number;      // 0 to 100
  skillMatch: number;        // 0 to 100
  educationMatch: number;    // 0 to 100
  interestMatch: number;     // 0 to 100
  experienceMatch: number;   // 0 to 100
  confidence: 'Low' | 'Medium' | 'High';
}

export interface RecommendedCareer {
  careerId: string;
  careerName: string;
  matchScore: CareerMatchScore;
  shortDescription: string;
  whyItMatches: string;
  requiredSkills: string[];
  missingSkills: string[];
  estimatedSalary: { min: number; max: number; currency: string };
  growthTrend: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTimeToReadyMonths: number;
}

export interface DiscoveryInsights {
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  careerRisks: string[];
  learningSuggestions: string[];
  improvementPlan: string[];
}

export interface CareerComparison {
  careerA: {
    id: string;
    title: string;
    salaryRange: { min: number; max: number; currency: string };
    difficulty: string;
    estimatedTimeToReadyMonths: number;
    pros: string[];
    cons: string[];
  };
  careerB: {
    id: string;
    title: string;
    salaryRange: { min: number; max: number; currency: string };
    difficulty: string;
    estimatedTimeToReadyMonths: number;
    pros: string[];
    cons: string[];
  };
  skillDifference: {
    common: string[];
    onlyInA: string[];
    onlyInB: string[];
  };
  salaryDifference: string; // descriptive text
  learningTimeDifference: string; // descriptive text
}

export interface DiscoveryHistoryItem {
  id: string;
  uid: string;
  timestamp: string;
  recommendations: RecommendedCareer[];
  insights: DiscoveryInsights;
}
