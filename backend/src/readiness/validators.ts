import { UserProfile } from '../types';
import { CareerNormalizer } from '../career/normalizer';
import { CAREER_CATALOG } from '../career/catalog';

export const ReadinessValidators = {
  /**
   * Asserts user profile contains a selected career path, skills, and required fields.
   */
  validateSelectedCareer(profile: UserProfile): void {
    if (!profile) {
      throw new Error('Readiness Calculation Failed: User profile does not exist.');
    }
    
    if (!profile.selectedCareer || profile.selectedCareer.trim() === '') {
      throw new Error('Readiness Calculation Failed: Target career path has not been selected. Please pick a career track.');
    }

    // Verify target career is normalized and exists in catalog
    const normalizedId = CareerNormalizer.normalize(profile.selectedCareer);
    const careerExists = CAREER_CATALOG.some(c => c.id === normalizedId);
    if (!careerExists) {
      throw new Error(`Readiness Calculation Failed: Selected career "${profile.selectedCareer}" is not a valid catalog career.`);
    }

    if (!profile.skills || profile.skills.length === 0) {
      throw new Error('Readiness Calculation Failed: Missing required skills. Please complete skills extraction.');
    }
    
    if (!profile.education || !profile.education.degree || profile.education.degree.trim() === '') {
      throw new Error('Readiness Calculation Failed: Missing required education degree details.');
    }
  }
};
export default ReadinessValidators;
