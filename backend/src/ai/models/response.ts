export interface StandardAIResponse<T = any> {
  success: boolean;
  reason: string;
  confidence: 'Low' | 'Medium' | 'High';
  recommendation: string;
  nextSteps: string[];
  warnings: string[];
  metadata: {
    provider: string;
    executionTimeMs: number;
    tokenUsage?: number;
  };
  data?: T;
}
