import { Career } from '../career/models';
import { UserProfile } from '../types';
import { AssessmentResult } from '../assessment/models';
import { ReadinessCategoryScores } from './models';

export const ReadinessCalculator = {
  /**
   * Calculates readiness scores across all target vectors.
   */
  calculate(
    profile: UserProfile,
    career: Career,
    assessments: AssessmentResult[],
    roadmapItems: any[]
  ): { overallReadiness: number; status: 'Not Ready' | 'Getting Ready' | 'Almost Ready' | 'Job Ready' | 'Industry Ready'; categoryScores: ReadinessCategoryScores } {
    const requiredSkills = career.requiredSkills.map(s => s.toLowerCase().trim());
    const userSkills = (profile.skills || []).map(s => s.toLowerCase().trim());

    // 1. Skill Readiness (30% weight)
    let matchedSkills = 0;
    requiredSkills.forEach(req => {
      if (userSkills.includes(req)) matchedSkills++;
    });
    const skillReadiness = requiredSkills.length > 0
      ? Math.round((matchedSkills / requiredSkills.length) * 100)
      : 60;

    // 2. Resume Readiness (20% weight)
    const resumeReadiness = profile.resume?.atsScore || 45;

    // 3. Project Readiness (15% weight)
    let projectReadiness = 30;
    const proj = profile.projects;
    if (proj) {
      if (proj.githubUrl && proj.githubUrl.trim().length > 10) projectReadiness += 30;
      if (proj.projectLinks && proj.projectLinks.trim().length > 10) projectReadiness += 20;
      if (proj.description && proj.description.trim().length > 15) projectReadiness += 20;
    }
    projectReadiness = Math.min(100, projectReadiness);

    // 4. Certification Readiness (15% weight)
    const certsCount = (profile.certifications || []).length;
    const certificationReadiness = certsCount === 0 ? 40 : certsCount === 1 ? 80 : 100;

    // 5. Education Readiness (10% weight)
    let educationReadiness = 50;
    const degreeLower = (profile.education?.degree || '').toLowerCase();
    if (degreeLower.includes('cs') || degreeLower.includes('computer science') || degreeLower.includes('software') || degreeLower.includes('engineering')) {
      educationReadiness = 100;
    } else if (degreeLower.includes('information') || degreeLower.includes('mathematics') || degreeLower.includes('statistics')) {
      educationReadiness = 85;
    } else if (degreeLower.includes('business') || degreeLower.includes('finance')) {
      educationReadiness = 70;
    }

    // 6. Assessment Readiness (10% weight)
    const passedSkills = assessments
      .filter(a => a.percentage >= 70)
      .map(a => a.skill.toLowerCase().trim());

    let passedRequired = 0;
    requiredSkills.forEach(req => {
      if (passedSkills.includes(req)) passedRequired++;
    });
    const assessmentReadiness = requiredSkills.length > 0
      ? Math.round((passedRequired / requiredSkills.length) * 100)
      : 50;

    // 7. Learning Progress
    let learningProgress = 50;
    if (roadmapItems && roadmapItems.length > 0) {
      const completed = roadmapItems.filter(item => item.status === 'completed').length;
      learningProgress = Math.round((completed / roadmapItems.length) * 100);
    }

    // Overall Weighted Score
    const overallReadiness = Math.round(
      (skillReadiness * 0.30) +
      (resumeReadiness * 0.20) +
      (projectReadiness * 0.15) +
      (certificationReadiness * 0.15) +
      (educationReadiness * 0.10) +
      (assessmentReadiness * 0.10)
    );

    let status: 'Not Ready' | 'Getting Ready' | 'Almost Ready' | 'Job Ready' | 'Industry Ready' = 'Not Ready';
    if (overallReadiness >= 90) status = 'Industry Ready';
    else if (overallReadiness >= 80) status = 'Job Ready';
    else if (overallReadiness >= 60) status = 'Almost Ready';
    else if (overallReadiness >= 40) status = 'Getting Ready';

    return {
      overallReadiness,
      status,
      categoryScores: {
        skillReadiness,
        resumeReadiness,
        projectReadiness,
        certificationReadiness,
        educationReadiness,
        assessmentReadiness,
        learningProgress
      }
    };
  }
};
export default ReadinessCalculator;
