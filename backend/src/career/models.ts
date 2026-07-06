export type CareerDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface Career {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  requiredSkills: string[];
  beginnerSkills: string[];
  intermediateSkills: string[];
  advancedSkills: string[];
  salaryRange: SalaryRange;
  growthTrend: string;
  remoteAvailability: number; // 0 to 100
  educationRequirement: string;
  certifications: string[];
  tools: string[];
  technologies: string[];
  roadmapTemplate: string; // JSON string format of Milestone template
  difficulty: CareerDifficulty;
  tags: string[];
}
