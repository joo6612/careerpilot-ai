export type AppPage = 'landing' | 'login' | 'onboarding' | 'dashboard';

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type WorkPreference = 'Remote' | 'Hybrid' | 'Office';
export type CurrentStatus = 'Student' | 'Graduate' | 'Working Professional';
export type StudyTimePreference = 'Morning' | 'Afternoon' | 'Evening';

export interface WorkingProfessionalDetails {
  jobTitle: string;
  yearsOfExperience: string;
  currentSkills: string;
  industry: string;
}

export interface EducationDetails {
  degree: string;
  collegeName: string;
  cgpa: string;
  graduationYear: string;
  internshipExperience: string;
  languagesKnown: string;
}

export interface Certification {
  courseName: string;
  provider: string;
  fileName?: string;
}

export interface ProjectDetails {
  githubUrl: string;
  projectLinks: string;
  portfolioUrl: string;
  description: string;
}

export interface ResumeDetails {
  method: 'upload' | 'generate' | null;
  fileName?: string;
  atsScore?: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
}

export interface TimeAvailabilityDetails {
  hoursPerDay: string;
  daysPerWeek: string;
  targetMonths: string;
  preferredStudyTime: StudyTimePreference;
}

export interface UserProfile {
  name: string;
  aboutMe: string;
  // Page 3: Career Discovery
  interests: string[];
  favoriteSubjects: string;
  country: string;
  expectedSalary: string;
  workPreference: WorkPreference;
  selectedCareer: string;

  // Page 4: Current Status
  status: CurrentStatus | null;
  professionalDetails: WorkingProfessionalDetails;

  // Page 5: Education
  education: EducationDetails;

  // Page 6: Skills
  skills: string[];

  // Page 7: Certifications
  certifications: Certification[];

  // Page 8: Projects
  projects: ProjectDetails;

  // Page 9: Resume
  resume: ResumeDetails;

  // Page 10: Time Availability
  timeAvailability: TimeAvailabilityDetails;

  // Provisioning Metadata
  userId?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
  createdAt?: string;
  updatedAt?: string;
  profileVersion?: number;
  onboardingCompleted?: boolean;
  currentOnboardingStep?: number;
  profileCompletion?: number;
  careerMatch?: number;
  careerReadiness?: number;
  skillStrength?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked';
  duration: string;
  skills: string[];
  topics: string[];
}
