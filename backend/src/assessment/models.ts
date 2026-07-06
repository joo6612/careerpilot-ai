export type QuestionType = 'MCQ' | 'Code Output' | 'Code Completion' | 'Real-world Scenario';
export type SkillDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Question {
  id: string;
  skill: string;
  difficulty: SkillDifficulty;
  type: QuestionType;
  question: string;
  options?: string[]; // MCQs have choices, others may not
  answer: string; // The correct answer text or choice index
  explanation: string;
  tags: string[];
}

export interface AssessmentSession {
  sessionId: string;
  uid: string;
  skill: string;
  selfRating: number;
  difficulty: SkillDifficulty;
  questions: Omit<Question, 'answer' | 'explanation'>[]; // Client-facing questions (no answers exposed!)
  fullQuestions: Question[]; // Server-side questions (holds answers)
  createdAt: number;
}

export interface UserAnswers {
  [questionId: string]: string; // Maps question ID to user response string
}

export interface AssessmentResult {
  sessionId: string;
  skill: string;
  selfRating: number;
  difficulty: SkillDifficulty;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  difficultyMultiplier: number;
  confidence: 'Low' | 'Medium' | 'High';
  verifiedScore: number;
  skillLevel: SkillDifficulty;
  completedDate: string;
  attemptCount: number;
  improvementSuggestions: string[];
}

export interface SkillScore {
  skill: string;
  selfRating: number;
  verifiedScore: number;
  confidence: 'Low' | 'Medium' | 'High';
  completedDate: string;
  attemptCount: number;
  improvementSuggestions: string[];
}
