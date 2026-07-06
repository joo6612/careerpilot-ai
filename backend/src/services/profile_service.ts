import { ProfileRepository } from './profile_repository';
import type { UserProfile } from '../types';

export class ProfileService {
  constructor(private repo: ProfileRepository) {}

  /**
   * Loads the existing profile from the repository.
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    return this.repo.getProfile(uid);
  }

  /**
   * Bootstraps a minimal user profile with default metadata for newly authenticated users.
   */
  async createProfile(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const defaultProfile: UserProfile = {
      name: data.name || 'Alex Pioneer',
      aboutMe: '',
      interests: [],
      favoriteSubjects: '',
      country: 'United States',
      expectedSalary: '95,000',
      workPreference: 'Remote',
      selectedCareer: '',
      status: 'ACTIVE' as any, // Provisioning status is ACTIVE as requested
      professionalDetails: {
        jobTitle: '',
        yearsOfExperience: '',
        currentSkills: '',
        industry: ''
      },
      education: {
        degree: '',
        collegeName: '',
        cgpa: '',
        graduationYear: '',
        internshipExperience: 'No',
        languagesKnown: ''
      },
      skills: [],
      certifications: [],
      projects: {
        githubUrl: '',
        projectLinks: '',
        portfolioUrl: '',
        description: ''
      },
      resume: {
        method: null,
        fileName: '',
        atsScore: 0,
        strengths: [],
        weaknesses: [],
        missingSkills: []
      },
      timeAvailability: {
        hoursPerDay: '3',
        daysPerWeek: '5',
        targetMonths: '6',
        preferredStudyTime: 'Evening'
      },
      // Apply user session parameters
      ...data,
      userId: uid,
      profileVersion: 1,
      onboardingCompleted: false,
      currentOnboardingStep: 1,
      profileCompletion: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any;

    await this.repo.saveProfile(uid, defaultProfile);
    return defaultProfile;
  }

  private calculateCompleteness(profile: UserProfile): number {
    if (profile.onboardingCompleted) {
      return 100;
    }
    let fields = [
      profile.aboutMe,
      profile.selectedCareer,
      profile.education?.degree,
      profile.professionalDetails?.industry,
    ];
    let filled = fields.filter(f => f && f.trim() !== '').length;
    if (profile.skills && profile.skills.length > 0) filled++;
    if (profile.interests && profile.interests.length > 0) filled++;
    
    const pct = Math.round((filled / 6) * 100);
    return Math.max(pct, profile.profileCompletion || 0);
  }

  /**
   * Persists profile updates to database.
   */
  async saveProfile(uid: string, profile: UserProfile): Promise<void> {
    const completeness = this.calculateCompleteness(profile);
    profile.profileCompletion = completeness;
    await this.repo.saveProfile(uid, {
      ...profile,
      profileCompletion: completeness,
      updatedAt: new Date().toISOString()
    });
  }
}
export default ProfileService;
