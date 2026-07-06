import { ReadinessRecommendation, ReadinessCategoryScores } from './models';

export const ReadinessRecommendations = {
  /**
   * Generates prioritized list of improvement actions based on sub-category scores.
   */
  generate(
    scores: ReadinessCategoryScores,
    missingSkills: string[]
  ): ReadinessRecommendation[] {
    const list: ReadinessRecommendation[] = [];

    // 1. Skill Verification Gap
    if (scores.assessmentReadiness < 60) {
      list.push({
        id: 'rec-assess',
        action: `Take technical challenges to verify: ${missingSkills.slice(0, 2).join(', ') || 'required skills'}`,
        reason: 'Verified skill ratings carry higher weight and show proof of core competence to technical recruiters.',
        priority: 'Critical',
        estimatedTimeHours: 1,
        difficulty: 'Intermediate',
        expectedImpact: 'Critical'
      });
    }

    // 2. Resume ATS Score Gap
    if (scores.resumeReadiness < 70) {
      list.push({
        id: 'rec-resume',
        action: 'Revise resume to integrate missing keyword technologies and metrics.',
        reason: 'Increasing ATS score to 80+ avoids early stage screening rejections.',
        priority: 'High',
        estimatedTimeHours: 2,
        difficulty: 'Intermediate',
        expectedImpact: 'High'
      });
    }

    // 3. Technical Projects Portfolio Gap
    if (scores.projectReadiness < 70) {
      list.push({
        id: 'rec-projects',
        action: 'Add GitHub links and describe project architectures.',
        reason: 'Well-documented project repositories serve as functional portfolios for recruiters.',
        priority: 'High',
        estimatedTimeHours: 6,
        difficulty: 'Intermediate',
        expectedImpact: 'High'
      });
    }

    // 4. Missing Certifications
    if (scores.certificationReadiness < 80) {
      list.push({
        id: 'rec-certs',
        action: 'Earn foundational professional certs (e.g. AWS, Google Cloud, TensorFlow).',
        reason: 'Certificates validate your dedication to keeping skills current.',
        priority: 'Medium',
        estimatedTimeHours: 15,
        difficulty: 'Advanced',
        expectedImpact: 'Medium'
      });
    }

    return list;
  }
};
export default ReadinessRecommendations;
