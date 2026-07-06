import { UserAnswers } from './models';

export const AssessmentValidators = {
  /**
   * Validates parameters for initiating a skill challenge session.
   */
  validateStartParams(body: any): { skill: string; selfRating: number } {
    const skill = String(body.skill || '').trim();
    if (!skill) {
      throw new Error('Skill name is required to start assessment');
    }

    const selfRating = parseInt(body.selfRating);
    if (isNaN(selfRating) || selfRating < 1 || selfRating > 5) {
      throw new Error('Self rating must be a valid integer between 1 and 5');
    }

    return { skill, selfRating };
  },

  /**
   * Validates parameters for submitting answers.
   */
  validateSubmitParams(body: any): { sessionId: string; answers: UserAnswers } {
    const sessionId = String(body.sessionId || '').trim();
    if (!sessionId) {
      throw new Error('Session ID is required to submit assessment answers');
    }

    const answers = body.answers as UserAnswers;
    if (typeof answers !== 'object' || answers === null) {
      throw new Error('Answers payload must be a valid key-value JSON object');
    }

    return { sessionId, answers };
  }
};
