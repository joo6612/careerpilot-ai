import { Question, AssessmentSession, UserAnswers, AssessmentResult, SkillDifficulty } from './models';
import { AssessmentDifficulty } from './difficulty';

export const AssessmentScoring = {
  /**
   * Computes the result statistics for a completed assessment session.
   */
  calculateResult(
    session: AssessmentSession,
    userAnswers: UserAnswers,
    attemptCount: number
  ): AssessmentResult {
    const questions = session.fullQuestions;
    let correctAnswers = 0;

    questions.forEach(q => {
      const userAnswer = (userAnswers[q.id] || '').trim().toLowerCase();
      const correctAnswer = q.answer.trim().toLowerCase();
      if (userAnswer === correctAnswer) {
        correctAnswers++;
      }
    });

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const difficultyMultiplier = AssessmentDifficulty.getMultiplier(session.difficulty);
    
    // Calculate raw score weighted by multiplier
    let verifiedScore = Math.round(percentage * difficultyMultiplier);
    if (verifiedScore > 100) verifiedScore = 100; // Cap at 100%

    // Determine verified skill level based on scoring thresholds
    let skillLevel: SkillDifficulty = 'Beginner';
    if (session.difficulty === 'Advanced') {
      if (percentage >= 75) {
        skillLevel = 'Advanced';
      } else if (percentage >= 40) {
        skillLevel = 'Intermediate';
      } else {
        skillLevel = 'Beginner';
      }
    } else if (session.difficulty === 'Intermediate') {
      if (percentage >= 70) {
        skillLevel = 'Intermediate';
      } else {
        skillLevel = 'Beginner';
      }
    } else {
      skillLevel = 'Beginner';
    }

    // Determine confidence score in this rating
    let confidence: 'Low' | 'Medium' | 'High' = 'Low';
    if (percentage >= 80) {
      confidence = 'High';
    } else if (percentage >= 50) {
      confidence = 'Medium';
    }

    // Formulate actionable improvement suggestions based on score
    const improvementSuggestions: string[] = [];
    if (percentage === 100) {
      improvementSuggestions.push(`Excellent mastery of ${session.skill}! You scored 100%. Ready for higher challenges.`);
    } else if (percentage >= 70) {
      improvementSuggestions.push(`Solid understanding of ${session.skill}. Review the questions you missed to polish your stack.`);
      improvementSuggestions.push('Try building a minor personal project utilizing these tools to cement your knowledge.');
    } else {
      improvementSuggestions.push(`Focus on foundational syntax and core architecture rules of ${session.skill}.`);
      improvementSuggestions.push('Spend 3-4 hours reading reference documentation and practicing simple code implementations.');
      improvementSuggestions.push('Rerun the assessment challenge after reviewing missed topics.');
    }

    return {
      sessionId: session.sessionId,
      skill: session.skill,
      selfRating: session.selfRating,
      difficulty: session.difficulty,
      correctAnswers,
      totalQuestions,
      percentage,
      difficultyMultiplier,
      confidence,
      verifiedScore,
      skillLevel,
      completedDate: new Date().toISOString(),
      attemptCount,
      improvementSuggestions
    };
  }
};
