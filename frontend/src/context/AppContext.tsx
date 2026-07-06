import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  AppPage,
  OnboardingStep,
  UserProfile,
  ChatMessage,
  RoadmapItem
} from '../types';
import { authService } from '../auth/auth.service';
import { useAuth } from '../auth/useAuth';
import { ApiClient } from '../api/client';

interface AppContextProps {
  page: AppPage;
  setPage: (page: AppPage) => void;
  onboardingStep: OnboardingStep;
  setOnboardingStep: (step: OnboardingStep) => void;
  profile: UserProfile;
  updateProfile: (fields: Partial<UserProfile>) => void;
  updateNestedProfile: <K extends 'professionalDetails' | 'education' | 'projects' | 'resume' | 'timeAvailability'>(key: K, fields: Partial<UserProfile[K]>) => void;
  dashboardTab: string;
  setDashboardTab: (tab: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  roadmap: RoadmapItem[];
  toggleRoadmapItemStatus: (id: string) => void;
  streak: number;
  skillsLearnedCount: number;
  coursesCompletedCount: number;
  projectsBuiltCount: number;
  interviewPracticeCount: number;
  incrementInterviewPractice: () => void;
  resetApp: () => void;

  // API Backed intelligence methods
  generateCareerSuggestions: (aboutMe: string) => Promise<string[]>;
  generateSkillsForCareer: (career: string) => Promise<string[]>;
  runResumeAnalysis: (method: 'upload' | 'generate', fileName?: string) => Promise<UserProfile['resume']>;
  generateRoadmap: () => Promise<RoadmapItem[]>;
  evaluateInterviewAnswer: (question: string, answer: string) => Promise<{ score: string; comment: string }>;
}

const initialProfile: UserProfile = {
  name: 'Alex Pioneer',
  aboutMe: '',
  interests: [],
  favoriteSubjects: '',
  country: 'United States',
  expectedSalary: '95,000',
  workPreference: 'Remote',
  selectedCareer: '',
  status: null,
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
  }
};

const defaultRoadmap: RoadmapItem[] = [
  {
    id: 'rm-1',
    title: 'Foundations & Core Principles',
    description: 'Learn the foundational concepts and mathematics required for your career choice.',
    status: 'in-progress',
    duration: '4 weeks',
    skills: ['Core Concepts', 'Basic Tools'],
    topics: ['Industry Overview', 'Syntax & Scripting', 'Basic Problem Solving', 'Version Control with Git']
  },
  {
    id: 'rm-2',
    title: 'Intermediate Concepts & Architecture',
    description: 'Dive deep into specific framework models, algorithms, and application designs.',
    status: 'locked',
    duration: '6 weeks',
    skills: ['Architecture', 'Advanced Frameworks'],
    topics: ['Database Design (SQL/NoSQL)', 'API Integration', 'Data Validation & Processing', 'Testing & Debugging']
  },
  {
    id: 'rm-3',
    title: 'Advanced System & Cloud Deployments',
    description: 'Learn how to build scalable systems, deploy them to production, and monitor performance.',
    status: 'locked',
    duration: '6 weeks',
    skills: ['Cloud Computing', 'System Architecture'],
    topics: ['Docker & Containerization', 'CI/CD Pipelines', 'Cloud Platforms (AWS/GCP)', 'Monitoring & Scaling']
  },
  {
    id: 'rm-4',
    title: 'Capstone Project & Interview Prep',
    description: 'Develop a production-ready application and prepare for behavioral and technical interviews.',
    status: 'locked',
    duration: '4 weeks',
    skills: ['System Design', 'Technical Interviewing'],
    topics: ['Full-Scale Deployment', 'Mock Interviews', 'Algorithm Practicing', 'System Design Whiteboarding']
  }
];

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState<AppPage>('landing');
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(1);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [dashboardTab, setDashboardTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [streak] = useState<number>(5);
  const [skillsLearnedCount, setSkillsLearnedCount] = useState<number>(0);
  const [coursesCompletedCount, setCoursesCompletedCount] = useState<number>(0);
  const [projectsBuiltCount, setProjectsBuiltCount] = useState<number>(0);
  const [interviewPracticeCount, setInterviewPracticeCount] = useState<number>(2);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(defaultRoadmap);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Load Initial Data from Backend when user is authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfile(initialProfile);
      setRoadmap(defaultRoadmap);
      setChatMessages([]);
      return;
    }

    const fetchInitialData = async () => {
      try {
        // Fetch Profile (which auto-provisions if first login)
        const profileData = await ApiClient.get<UserProfile>('/profile');
        setProfile(profileData);

        // Route user automatically based on onboarding Completed metadata flag
        if (profileData.onboardingCompleted) {
          setPage('dashboard');
        } else {
          setPage('onboarding');
        }

        // Fetch Roadmap
        try {
          const roadmapData = await ApiClient.get<RoadmapItem[]>('/roadmap');
          setRoadmap(roadmapData);
        } catch (error: any) {
          // New users won't have a roadmap yet.
          // This is an expected state, not an application error.
          if (
            error?.message?.includes('404') ||
            error?.message?.includes('No active learning roadmap')
          ) {
            console.log('No roadmap found for this user yet.');
            setRoadmap([]);
          } else {
            console.error('Failed to load roadmap:', error);
          }
        }

        // Fetch Chat History
        try {
          const chatData = await ApiClient.get<ChatMessage[]>('/mentor/chat');
          setChatMessages(chatData);
        } catch (e) {
          console.warn('Chat history failed to load:', e);
        }
      } catch (err) {
        console.error('Error fetching initial data from backend:', err);
      }
    };

    fetchInitialData();
  }, [user, authLoading]);

  // Update light/dark mode class on body
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.backgroundColor = '#0B1020';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
    }
  }, [darkMode]);

  // Dynamically update skills & courses metrics when profile changes
  useEffect(() => {
    setSkillsLearnedCount(profile.skills.length);
    setCoursesCompletedCount(profile.certifications.length);

    // Count projects built
    let count = 0;
    if (profile.projects.githubUrl) count++;
    if (profile.projects.projectLinks) count++;
    if (profile.projects.portfolioUrl) count++;
    setProjectsBuiltCount(count);
  }, [profile.skills, profile.certifications, profile.projects]);

  const updateProfile = (fields: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...fields };
      // Async update in DB via ApiClient
      ApiClient.post('/profile', updated).catch(err => console.error('Error updating profile in backend:', err));
      return updated;
    });
  };

  const updateNestedProfile = <K extends 'professionalDetails' | 'education' | 'projects' | 'resume' | 'timeAvailability'>(key: K, fields: Partial<UserProfile[K]>) => {
    setProfile(prev => {
      const updated = {
        ...prev,
        [key]: {
          ...(prev[key] as any),
          ...(fields as any)
        } as any
      };
      // Async update in DB via ApiClient
      ApiClient.post('/profile', updated).catch(err => console.error('Error updating profile in backend:', err));
      return updated;
    });
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const incrementInterviewPractice = () => {
    setInterviewPracticeCount(prev => prev + 1);
  };

  // --- API BACKED SERVICE METHODS ---

  const generateCareerSuggestions = async (aboutMe: string): Promise<string[]> => {
    try {
      const data = await ApiClient.post<{ suggestions: string[] }>('/career/suggest', { aboutMe });
      return data.suggestions;
    } catch (error) {
      console.error('Error generating career suggestions:', error);
    }
    return ['AI Engineer', 'Machine Learning Engineer', 'Software Developer'];
  };

  const generateSkillsForCareer = async (career: string): Promise<string[]> => {
    if (!career || career.trim() === '') {
      alert('Warning: Career title is required to generate skills.');
      return [];
    }
    try {
      const data = await ApiClient.post<{ skills: string[] }>('/career/skills', { career });
      return data.skills;
    } catch (error) {
      console.error('Error generating skills for career:', error);
    }
    return ['Python', 'SQL', 'Git', 'Machine Learning'];
  };

  const runResumeAnalysis = async (method: 'upload' | 'generate', fileName?: string): Promise<UserProfile['resume']> => {
    try {
      const data = await ApiClient.post<UserProfile['resume']>('/resume/analyze', { method, fileName });
      setProfile(prev => ({ ...prev, resume: data }));
      return data;
    } catch (error) {
      console.error('Error analyzing resume:', error);
    }
    return profile.resume;
  };

  const generateRoadmap = async (): Promise<RoadmapItem[]> => {
    try {
      const data = await ApiClient.post<RoadmapItem[]>('/roadmap/generate', {});
      setRoadmap(data);
      return data;
    } catch (error) {
      console.error('Error generating roadmap:', error);
    }
    return roadmap;
  };

  const evaluateInterviewAnswer = async (question: string, answer: string): Promise<{ score: string; comment: string }> => {
    try {
      const data = await ApiClient.post<{ score: string; comment: string }>('/interview/evaluate', { question, answer });
      incrementInterviewPractice();
      return data;
    } catch (error) {
      console.error('Error evaluating interview answer:', error);
    }
    return { score: '7.5/10', comment: 'Thank you for your response! (Simulation evaluation)' };
  };

  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `chat-u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);

    ApiClient.post<{ chat: ChatMessage[] }>('/mentor/chat', { text })
      .then(data => {
        if (data.chat) {
          setChatMessages(data.chat);
        }
      })
      .catch(err => console.error('Error posting chat to backend:', err));
  };

  const toggleRoadmapItemStatus = (id: string) => {
    ApiClient.post<RoadmapItem[]>('/roadmap/toggle', { id })
      .then(data => {
        setRoadmap(data);
      })
      .catch(err => console.error('Error toggling roadmap item status:', err));
  };

  const resetApp = () => {
    setProfile(initialProfile);
    setOnboardingStep(1);
    setPage('login');
    setDashboardTab('dashboard');
    setRoadmap(defaultRoadmap);

    // Clear Firebase session
    authService.signOut().catch(err => console.error('Error signing out on reset:', err));

    // Clear in backend database as well
    ApiClient.post('/profile', initialProfile).catch(err => console.error('Error resetting profile in backend:', err));
    ApiClient.post('/roadmap/generate', {}).catch(err => console.error('Error resetting roadmap in backend:', err));
    ApiClient.post('/mentor/chat', { text: 'reset' }).catch(err => console.error('Error resetting chat in backend:', err));
  };

  return (
    <AppContext.Provider value={{
      page,
      setPage,
      onboardingStep,
      setOnboardingStep,
      profile,
      updateProfile,
      updateNestedProfile,
      dashboardTab,
      setDashboardTab,
      darkMode,
      toggleDarkMode,
      chatMessages,
      sendChatMessage,
      roadmap,
      toggleRoadmapItemStatus,
      streak,
      skillsLearnedCount,
      coursesCompletedCount,
      projectsBuiltCount,
      interviewPracticeCount,
      incrementInterviewPractice,
      resetApp,
      generateCareerSuggestions,
      generateSkillsForCareer,
      runResumeAnalysis,
      generateRoadmap,
      evaluateInterviewAnswer
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
