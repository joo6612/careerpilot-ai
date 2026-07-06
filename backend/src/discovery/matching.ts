import { UserProfile } from '../types';
import { Career } from '../career/models';
import { AssessmentResult } from '../assessment/models';
import { CareerMatchScore } from './models';
import { ConfidenceEngine } from '../ai/models/confidence';

export const CareerMatching = {
  /**
   * Calculates the multi-criteria Career Match Score.
   */
  calculateMatchScore(
    profile: UserProfile,
    career: Career,
    assessments: AssessmentResult[]
  ): CareerMatchScore {
    // 1. Skill Match (30%)
    const requiredSkills = career.requiredSkills.map(s => s.toLowerCase().trim());
    const userSkills = (profile.skills || []).map(s => s.toLowerCase().trim());
    
    let skillPoints = 0;
    requiredSkills.forEach(reqSkill => {
      const isSelfRated = userSkills.includes(reqSkill);
      // Check for verified assessment score for this skill
      const hasVerifiedPass = assessments.some(a => 
        a.skill.toLowerCase() === reqSkill && a.percentage >= 70
      );

      if (hasVerifiedPass) {
        skillPoints += 10;
      } else if (isSelfRated) {
        skillPoints += 7;
      }
    });

    const totalRequiredSkills = requiredSkills.length;
    const skillMatch = totalRequiredSkills > 0 
      ? Math.round((skillPoints / (totalRequiredSkills * 10)) * 100) 
      : 50;

    // 2. Education Match (20%)
    let educationMatch = 50;
    const degreeLower = (profile.education?.degree || '').toLowerCase();
    const requirementsLower = (career.educationRequirement || '').toLowerCase();
    
    if (requirementsLower.includes('equivalent practical portfolio') || requirementsLower.includes('bootcamp')) {
      educationMatch = 90;
    } else if (degreeLower.includes('cs') || degreeLower.includes('computer science') || degreeLower.includes('software') || degreeLower.includes('engineering')) {
      educationMatch = 100;
    } else if (degreeLower.includes('information') || degreeLower.includes('mathematics') || degreeLower.includes('statistics') || degreeLower.includes('physics')) {
      educationMatch = 85;
    } else if (degreeLower.includes('business') || degreeLower.includes('finance') || degreeLower.includes('administration')) {
      educationMatch = 70;
    }

    // 3. Interest Match (20%)
    const userInterests = (profile.interests || []).map(i => i.toLowerCase().trim());
    const careerTags = (career.tags || []).map(t => t.toLowerCase().trim());
    const aboutMeLower = (profile.aboutMe || '').toLowerCase();
    const favSubjectsLower = (profile.favoriteSubjects || '').toLowerCase();
    const industryLower = (profile.professionalDetails?.industry || '').toLowerCase();
    
    let matchedTags = 0;
    careerTags.forEach(tag => {
      if (
        userInterests.includes(tag) ||
        userInterests.some(ui => ui.includes(tag) || tag.includes(ui)) ||
        aboutMeLower.includes(tag) ||
        favSubjectsLower.includes(tag) ||
        industryLower.includes(tag)
      ) {
        matchedTags++;
      }
    });
    
    const gameKeywords = ['game', 'unity', 'blender', '3d modeling', '3d', 'unreal', 'playstation', 'gameplay'];
    const hasGameInterest = gameKeywords.some(kw => 
      userInterests.includes(kw) || 
      aboutMeLower.includes(kw) || 
      favSubjectsLower.includes(kw) ||
      (profile.skills || []).some(s => s.toLowerCase().trim() === kw)
    );

    let interestMatch = careerTags.length > 0
      ? Math.round((matchedTags / careerTags.length) * 100)
      : 60;

    // Apply specific boosts/penalties to ensure high precision recommendations
    if (hasGameInterest) {
      if (career.id === 'GAME_DEVELOPER') {
        interestMatch = 100;
      } else if (
        career.id === 'CLOUD_ENGINEER' || 
        career.id === 'FRONTEND_DEVELOPER' || 
        career.id === 'DEVOPS_ENGINEER' || 
        career.id === 'SYSTEMS_ADMIN' ||
        career.id === 'DATABASE_ADMIN'
      ) {
        interestMatch = Math.max(10, interestMatch - 50);
      }
    } else {
      if (career.id === 'GAME_DEVELOPER') {
        interestMatch = Math.min(30, interestMatch);
      }
    }

    interestMatch = Math.max(0, Math.min(100, interestMatch));

    // 4. Experience Match (15%)
    let experienceMatch = 50;
    const status = profile.status || 'Student';
    const yearsExp = parseInt(profile.professionalDetails?.yearsOfExperience || '0');

    if (career.difficulty === 'Beginner') {
      experienceMatch = (status === 'Student' || status === 'Graduate') ? 100 : 80;
    } else if (career.difficulty === 'Intermediate') {
      if (status === 'Working Professional') {
        experienceMatch = 100;
      } else if (status === 'Graduate') {
        experienceMatch = 80;
      } else {
        experienceMatch = 60;
      }
    } else { // Advanced
      if (status === 'Working Professional') {
        experienceMatch = yearsExp >= 3 ? 100 : 80;
      } else if (status === 'Graduate') {
        experienceMatch = 60;
      } else {
        experienceMatch = 40;
      }
    }

    // 5. Work Preference Match (15%)
    let workPreferenceMatch = 100;
    const workPref = (profile.workPreference || '').toLowerCase().trim();
    if (workPref === 'remote') {
      workPreferenceMatch = career.remoteAvailability || 80;
    } else if (workPref === 'hybrid') {
      workPreferenceMatch = 90;
    } else if (workPref === 'office' || workPref === 'on-site') {
      workPreferenceMatch = Math.round(100 - (career.remoteAvailability || 0) / 2);
    }

    // Calculate Overall Weighted Score
    const overallMatch = Math.round(
      (skillMatch * 0.30) + 
      (educationMatch * 0.20) + 
      (interestMatch * 0.20) + 
      (experienceMatch * 0.15) + 
      (workPreferenceMatch * 0.15)
    );

    // Compute Confidence rating using the AI completeness engine
    const confidence = ConfidenceEngine.calculate(profile, career, assessments);

    return {
      overallMatch,
      skillMatch,
      educationMatch,
      interestMatch,
      experienceMatch,
      confidence
    };
  }
};
export default CareerMatching;
