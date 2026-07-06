import { StandardAIResponse } from '../models/response';

export const AIResponseFormatter = {
  /**
   * Builds a structured StandardAIResponse object for successful operations.
   */
  createSuccess<T = any>(
    data: T,
    providerName: string,
    executionTimeMs: number,
    confidence: 'Low' | 'Medium' | 'High',
    warnings: string[],
    recommendation = 'Proceed with matching milestones and skill tests.',
    nextSteps: string[] = []
  ): StandardAIResponse<T> {
    if (nextSteps.length === 0) {
      if (warnings.length > 0) {
        nextSteps.push('Update missing biography/skills details on your profile to refine suggestions.');
      } else {
        nextSteps.push('Take related skill assessments to prove your qualifications.');
      }
    }

    return {
      success: true,
      reason: 'AI execution completed successfully.',
      confidence,
      recommendation,
      nextSteps,
      warnings,
      metadata: {
        provider: providerName,
        executionTimeMs,
        tokenUsage: 150 // Standard token usage counter placeholder
      },
      data
    };
  },

  /**
   * Builds a structured StandardAIResponse object for failed operations.
   */
  createError(
    reason: string,
    providerName: string,
    executionTimeMs: number,
    warnings: string[] = []
  ): StandardAIResponse<null> {
    return {
      success: false,
      reason,
      confidence: 'Low',
      recommendation: 'Verify input data fields and try again.',
      nextSteps: ['Check backend provider credentials', 'Provide detailed profile inputs'],
      warnings,
      metadata: {
        provider: providerName,
        executionTimeMs
      },
      data: null
    };
  }
};
export default AIResponseFormatter;
