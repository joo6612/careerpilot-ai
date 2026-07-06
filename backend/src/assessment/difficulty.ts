import { SkillDifficulty } from './models';

export const AssessmentDifficulty = {
  /**
   * Translates 1-5 star ratings to SkillDifficulty strings.
   */
  resolveDifficulty(selfRating: number): SkillDifficulty {
    if (selfRating <= 2) {
      return 'Beginner';
    }
    if (selfRating <= 4) {
      return 'Intermediate';
    }
    return 'Advanced';
  },

  /**
   * Retrieves the score scaling multiplier for each difficulty grade.
   */
  getMultiplier(difficulty: SkillDifficulty): number {
    switch (difficulty) {
      case 'Beginner':
        return 1.0;
      case 'Intermediate':
        return 1.2;
      case 'Advanced':
        return 1.5;
      default:
        return 1.0;
    }
  }
};
