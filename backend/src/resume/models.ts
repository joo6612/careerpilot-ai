export interface ATSAnalysis {
  atsScore: number;          // 0 to 100
  formattingScore: number;   // 0 to 100
  keywordScore: number;      // 0 to 100
  skillsScore: number;       // 0 to 100
  experienceScore: number;   // 0 to 100
  educationScore: number;    // 0 to 100
  projectsScore: number;     // 0 to 100
  overallRating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
}

export interface SkillGapAnalysis {
  missingSkills: string[];
  weakSkills: string[];
  strongSkills: string[];
  recommendedLearning: string[];
}

export interface ImprovementReport {
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  missingProjects: string[];
  missingCertifications: string[];
  missingTechnologies: string[];
  actionableSuggestions: string[];
}

export interface ResumeVersion {
  id: string;
  uid: string;
  timestamp: string;
  fileName: string;
  textContent: string;
  atsAnalysis: ATSAnalysis | null;
  skillGapAnalysis: SkillGapAnalysis | null;
  improvementReport: ImprovementReport | null;
}

export interface ResumeComparison {
  versionA: {
    id: string;
    timestamp: string;
    fileName: string;
    atsScore: number;
  };
  versionB: {
    id: string;
    timestamp: string;
    fileName: string;
    atsScore: number;
  };
  scoreDifference: number;
  improvedAreas: string[];
  remainingGaps: string[];
}
