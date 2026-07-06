import { UserProfile } from '../../types';
import { Career } from '../../career/models';
import { AssessmentResult } from '../../assessment/models';

export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export const ConfidenceEngine = {
  /**
   * Calculates AI response confidence based on user context data completeness.
   */
  calculate(
    profile: UserProfile,
    career: Career | null,
    assessments: AssessmentResult[]
  ): ConfidenceLevel {
    let score = 0;

    // 1. Profile Bio exists
    if (profile.aboutMe && profile.aboutMe.trim().length > 10) {
      score += 20;
    }

    // 2. Profile self-rated skills defined
    if (profile.skills && profile.skills.length > 0) {
      score += 20;
    }

    // 3. Target Career catalog profile match
    if (career) {
      score += 20;
    }

    // 4. Resume uploaded/generated
    if (profile.resume && profile.resume.method) {
      score += 20;
    }

    // 5. Verified assessments history exists
    if (assessments && assessments.length > 0) {
      score += 20;
    }

    if (score >= 80) {
      return 'High';
    }
    if (score >= 40) {
      return 'Medium';
    }
    return 'Low';
  }
};
