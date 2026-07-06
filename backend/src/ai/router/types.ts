export type TaskType =
  | 'ONBOARDING'
  | 'CAREER_DISCOVERY'
  | 'MENTOR'
  | 'RESUME_BUILDER'
  | 'RESUME_ANALYSIS_TEXT'
  | 'RESUME_ANALYSIS_IMAGE'
  | 'CERTIFICATE_ANALYSIS'
  | 'PORTFOLIO_IMAGE_ANALYSIS'
  | 'ROADMAP'
  | 'DOCUMENT_RETRIEVAL'
  | 'SEARCH_RANKING'
  | 'CODING'
  | 'PROMPT_MODERATION';

export interface RouteResolution {
  task: TaskType;
  model: string;
  fallbackModel?: string;
}
