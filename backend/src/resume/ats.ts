import { Career } from '../career/models';
import { UserProfile } from '../types';
import { ATSAnalysis } from './models';

export const ATSScoring = {
  /**
   * Evaluates resume text content against career qualifications and user profiles.
   */
  calculate(
    textContent: string,
    career: Career,
    profile: UserProfile
  ): ATSAnalysis {
    const textLower = textContent.toLowerCase();

    // 1. Formatting Score (5% weight)
    const sections = ['experience', 'education', 'skills', 'projects', 'summary'];
    let sectionsFound = 0;
    sections.forEach(sec => {
      if (textLower.includes(sec)) sectionsFound++;
    });
    const formattingScore = Math.round((sectionsFound / sections.length) * 100);

    // 2. Keyword Score (25% weight)
    const requiredSkills = career.requiredSkills.map(s => s.toLowerCase().trim());
    let matchedKeywords = 0;
    requiredSkills.forEach(skill => {
      if (textLower.includes(skill)) matchedKeywords++;
    });
    const keywordScore = requiredSkills.length > 0
      ? Math.round((matchedKeywords / requiredSkills.length) * 100)
      : 70;

    // 3. Skills Score (25% weight)
    const userSkills = (profile.skills || []).map(s => s.toLowerCase().trim());
    let matchedSkills = 0;
    userSkills.forEach(skill => {
      if (textLower.includes(skill)) matchedSkills++;
    });
    const skillsScore = userSkills.length > 0
      ? Math.round((matchedSkills / userSkills.length) * 100)
      : 75;

    // 4. Experience Score (20% weight)
    let experienceScore = 75;
    const isAdvanced = career.difficulty === 'Advanced';
    const isIntermediate = career.difficulty === 'Intermediate';
    const yearsExp = parseInt(profile.professionalDetails?.yearsOfExperience || '0');

    if (isAdvanced) {
      if (textLower.includes('senior') || textLower.includes('lead') || textLower.includes('architect') || yearsExp >= 3) {
        experienceScore = 95;
      } else {
        experienceScore = 60;
      }
    } else if (isIntermediate) {
      if (textLower.includes('engineer') || textLower.includes('developer') || yearsExp >= 1) {
        experienceScore = 90;
      } else {
        experienceScore = 70;
      }
    } else { // Beginner
      if (textLower.includes('junior') || textLower.includes('intern') || textLower.includes('entry') || textLower.includes('student')) {
        experienceScore = 95;
      }
    }

    // 5. Education Score (15% weight)
    let educationScore = 70;
    const reqEducation = (career.educationRequirement || '').toLowerCase();
    if (reqEducation.includes('degree') || reqEducation.includes('bachelor')) {
      if (textLower.includes('bachelor') || textLower.includes('bs') || textLower.includes('computer science') || textLower.includes('degree')) {
        educationScore = 95;
      }
    } else {
      educationScore = 90; // less strict
    }

    // 6. Projects Score (10% weight)
    let projectsScore = 50;
    const projectKeywords = ['project', 'app', 'system', 'build', 'github', 'deploy', 'design'];
    let projHits = 0;
    projectKeywords.forEach(kw => {
      if (textLower.includes(kw)) projHits++;
    });
    projectsScore = Math.round((projHits / projectKeywords.length) * 100);

    // Compute overall weighted ATS score
    const atsScore = Math.round(
      (keywordScore * 0.25) +
      (skillsScore * 0.25) +
      (experienceScore * 0.20) +
      (educationScore * 0.15) +
      (projectsScore * 0.10) +
      (formattingScore * 0.05)
    );

    let overallRating: ATSAnalysis['overallRating'] = 'Poor';
    if (atsScore >= 80) overallRating = 'Excellent';
    else if (atsScore >= 60) overallRating = 'Good';
    else if (atsScore >= 40) overallRating = 'Fair';

    return {
      atsScore,
      formattingScore,
      keywordScore,
      skillsScore,
      experienceScore,
      educationScore,
      projectsScore,
      overallRating
    };
  }
};
export default ATSScoring;
