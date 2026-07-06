import { Career } from '../career/models';
import { AssessmentResult } from '../assessment/models';
import { SkillGapAnalysis } from './models';

export const ResumeSkillGap = {
  /**
   * Performs granular checks on required, present, and verified skills.
   */
  analyze(
    textContent: string,
    career: Career,
    assessments: AssessmentResult[]
  ): SkillGapAnalysis {
    const textLower = textContent.toLowerCase();
    const required = career.requiredSkills;

    const presentInResume = required.filter(skill => 
      textLower.includes(skill.toLowerCase().trim())
    );

    const missingSkills = required.filter(skill => 
      !textLower.includes(skill.toLowerCase().trim())
    );

    const verifiedSkills = assessments
      .filter(a => a.percentage >= 70)
      .map(a => a.skill.toLowerCase().trim());

    const strongSkills = presentInResume.filter(skill => 
      verifiedSkills.includes(skill.toLowerCase().trim())
    );

    const weakSkills = presentInResume.filter(skill => 
      !verifiedSkills.includes(skill.toLowerCase().trim())
    );

    const recommendedLearning = missingSkills.map(skill => 
      `Enroll in foundational tutorials and complete the verified '${skill}' skill assessment challenge.`
    );

    return {
      missingSkills,
      weakSkills,
      strongSkills,
      recommendedLearning
    };
  }
};
export default ResumeSkillGap;
