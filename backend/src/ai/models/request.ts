import { ChatMessage } from '../../types';

export interface SuggestCareersRequest {
  bio: string;
  interests: string;
}

export interface AnalyzeSkillsRequest {
  careerTitle: string;
}

export interface AnalyzeResumeRequest {
  resumeText: string;
  targetCareerId?: string;
}

export interface GenerateRoadmapRequest {
  targetCareerId: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}
