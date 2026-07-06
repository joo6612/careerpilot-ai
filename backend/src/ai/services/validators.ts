import { UserProfile } from '../../types';
import { Career } from '../../career/models';
import { AssessmentResult } from '../../assessment/models';
import { ContextError } from '../exceptions';

export const AIValidators = {
  /**
   * Compiles descriptive warnings for missing data categories.
   */
  auditContext(
    profile: UserProfile,
    career: Career | null,
    assessments: AssessmentResult[]
  ): string[] {
    const warnings: string[] = [];

    if (!profile.aboutMe || profile.aboutMe.trim().length < 10) {
      warnings.push('Profile biography is empty or too short. Provide details about your goals.');
    }
    if (!profile.skills || profile.skills.length === 0) {
      warnings.push('No self-rated skills found on your profile. Please add your skills.');
    }
    if (!career) {
      warnings.push('No target career selected. Choose a career path to get tailored suggestions.');
    }
    if (!assessments || assessments.length === 0) {
      warnings.push('No verified skill assessments completed yet. Take challenges to verify skills.');
    }
    if (!profile.resume || !profile.resume.method) {
      warnings.push('No resume uploaded or generated yet.');
    }

    return warnings;
  },

  /**
   * Asserts resume content is present. Throws ContextError if missing.
   */
  requireResume(profile: UserProfile): void {
    if (!profile.resume || !profile.resume.method) {
      throw new ContextError('Resume details are missing. Please upload or generate a resume.');
    }
  },

  /**
   * Asserts career details exist. Throws ContextError if missing.
   */
  requireCareer(career: Career | null): void {
    if (!career) {
      throw new ContextError('Target career details are missing. Please select a valid target career from the catalog.');
    }
  }
};
