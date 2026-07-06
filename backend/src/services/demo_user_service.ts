import type { UserProfile, RoadmapItem, ChatMessage } from '../types';
import type { UserRoadmap } from '../roadmap/models';

export interface DemoSession {
  uid: string;
  email: string;
  profile: UserProfile | null;
  roadmap: RoadmapItem[] | null;
  chat: ChatMessage[] | null;
  activeRoadmap: any | null;
  roadmapHistory: any[];
  vaultDocuments: Map<string, any>;
  vaultVersions: Map<string, any[]>;
  conversations: Map<string, any>;
  assessments: any[];
  assessmentSessions: Map<string, any>;
  lastActivity: number;
}

export class DemoUserService {
  private static demoEmails = new Set<string>(['test.demo@gmail.com']);
  private static demoUids = new Set<string>();
  private static sessions = new Map<string, DemoSession>();
  private static SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  static isDemoUser(user: { email?: string } | null | undefined): boolean {
    if (!user || !user.email) return false;
    return this.demoEmails.has(user.email.toLowerCase().trim());
  }

  static registerDemoUid(uid: string, email: string): void {
    this.demoUids.add(uid);
    this.getOrCreateSession(uid, email);
  }

  static isDemoUid(uid: string): boolean {
    return this.demoUids.has(uid) || this.sessions.has(uid) || uid.startsWith('demo-');
  }

  static getOrCreateSession(uid: string, email: string): DemoSession {
    let session = this.sessions.get(uid);
    if (!session) {
      const defaultDemoProfile: UserProfile = {
        userId: uid,
        name: 'Alex Johnson',
        email: 'demo.user@careerpilot.demo',
        photoURL: '',
        aboutMe: 'Enthusiastic and results-driven computer science student with a strong passion for artificial intelligence, machine learning, and scalable systems. Experienced in software design and database querying.',
        interests: ['Artificial Intelligence', 'Game Development', 'Software Architecture'],
        favoriteSubjects: 'Machine Learning, Algorithms, Databases',
        country: 'India',
        expectedSalary: '₹12 LPA',
        workPreference: 'Remote' as const,
        selectedCareer: 'AI Engineer',
        status: 'Student' as const,
        professionalDetails: {
          jobTitle: '',
          yearsOfExperience: '',
          currentSkills: '',
          industry: 'Software Engineering'
        },
        education: {
          degree: 'B.Tech Computer Science',
          collegeName: 'Demo University',
          cgpa: '9.2',
          graduationYear: '2027',
          internshipExperience: 'Summer Intern at TechCorp',
          languagesKnown: 'English, Hindi'
        },
        skills: ['Python', 'SQL', 'Git', 'Machine Learning', 'React', 'C#', 'Unity', 'Blender'],
        certifications: [
          { courseName: 'Google Crash Course on Python', provider: 'Coursera' },
          { courseName: 'Introduction to Machine Learning', provider: 'Kaggle' }
        ],
        projects: {
          githubUrl: 'https://github.com/alexjohnson',
          projectLinks: 'https://alexjohnson.dev/projects',
          portfolioUrl: 'https://alexjohnson.dev',
          description: 'Built a neural network model to classify images and developed a personal dashboard portfolio using React.'
        },
        resume: {
          method: 'generate',
          fileName: 'alex_johnson_resume.txt',
          atsScore: 78,
          strengths: ['Strong programming foundation', 'Practical machine learning experience'],
          weaknesses: ['Needs more cloud deployment experience'],
          missingSkills: ['Docker', 'AWS']
        },
        timeAvailability: {
          hoursPerDay: '3',
          daysPerWeek: '5',
          targetMonths: '6',
          preferredStudyTime: 'Evening' as const
        },
        profileCompletion: 100,
        careerMatch: 95,
        careerReadiness: 85,
        skillStrength: 90,
        onboardingCompleted: true,
        currentOnboardingStep: 4
      };

      const defaultDemoChat: ChatMessage[] = [
        {
          id: 'msg-m-welcome',
          sender: 'mentor' as const,
          text: 'Hello Alex! Welcome to CareerPilot. I have loaded your demo profile as an AI Engineer aspirant. Feel free to ask me anything about your roadmap, skill gaps, or how to prepare for interviews!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];

      const defaultDemoRoadmap: UserRoadmap = {
        id: `rm-${Date.now()}`,
        uid: uid,
        careerId: 'ai-engineer',
        careerTitle: 'AI Engineer',
        timestamp: new Date().toISOString(),
        completionPercentage: 45,
        estimatedRemainingTimeHours: 40,
        phases: [
          {
            id: 'phase-1',
            title: 'Foundations of AI Engineering',
            description: 'Get started with coding, math, and tools.',
            milestones: [
              {
                id: 'm1',
                title: 'Python & Git Basics',
                type: 'Foundation',
                expectedOutcome: 'Be comfortable writing basic algorithms and performing version control operations.',
                status: 'completed',
                tasks: [
                  {
                    id: 't1',
                    title: 'Learn Git & Github workflows',
                    description: 'Learn branching, staging, merging, and PRs.',
                    difficulty: 'Beginner',
                    estimatedHours: 5,
                    priority: 'High',
                    requiredSkills: ['Git'],
                    status: 'completed',
                    recommendedResource: 'https://github.com/learn'
                  },
                  {
                    id: 't2',
                    title: 'Practice Python Data Structures',
                    description: 'Practice working with lists, dicts, tuples, and sets.',
                    difficulty: 'Beginner',
                    estimatedHours: 10,
                    priority: 'High',
                    requiredSkills: ['Python'],
                    status: 'completed',
                    recommendedResource: 'https://docs.python.org/3/'
                  }
                ]
              },
              {
                id: 'm2',
                title: 'Mathematical Prerequisites',
                type: 'Foundation',
                expectedOutcome: 'Understand core linear algebra and calculus concepts used in neural network training.',
                status: 'in-progress',
                tasks: [
                  {
                    id: 't3',
                    title: 'Linear Algebra fundamentals',
                    description: 'Study matrices, vectors, eigenvalues, and dot products.',
                    difficulty: 'Intermediate',
                    estimatedHours: 12,
                    priority: 'Medium',
                    requiredSkills: ['Mathematics'],
                    status: 'in-progress',
                    recommendedResource: 'Khan Academy Linear Algebra'
                  }
                ]
              }
            ]
          },
          {
            id: 'phase-2',
            title: 'Core AI Models & Frameworks',
            description: 'Implement machine learning and deep learning models.',
            milestones: [
              {
                id: 'm3',
                title: 'Introduction to Machine Learning',
                type: 'Core Skills',
                expectedOutcome: 'Train models using scikit-learn and evaluate performance metrics.',
                status: 'locked',
                tasks: [
                  {
                    id: 't4',
                    title: 'Supervised Learning Algorithms',
                    description: 'Implement regression, decision trees, and SVMs.',
                    difficulty: 'Intermediate',
                    estimatedHours: 15,
                    priority: 'High',
                    requiredSkills: ['Machine Learning'],
                    status: 'locked',
                    recommendedResource: 'Scikit-learn documentation'
                  }
                ]
              }
            ]
          }
        ]
      };

      const legacyFlat: RoadmapItem[] = defaultDemoRoadmap.phases.flatMap((phase: any) =>
        phase.milestones.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.expectedOutcome,
          status: m.status,
          duration: `${(m.tasks || []).reduce((sum: number, t: any) => sum + (t.estimatedHours || 0), 0)} hours`,
          skills: (m.tasks || []).flatMap((t: any) => t.requiredSkills || []),
          topics: (m.tasks || []).map((t: any) => t.title),
          progressPercent: m.status === 'completed' ? 100 : m.status === 'in-progress' ? 50 : 0
        }))
      );

      session = {
        uid,
        email,
        profile: defaultDemoProfile,
        roadmap: legacyFlat,
        chat: defaultDemoChat,
        activeRoadmap: defaultDemoRoadmap,
        roadmapHistory: [],
        vaultDocuments: new Map(),
        vaultVersions: new Map(),
        conversations: new Map(),
        assessments: [],
        assessmentSessions: new Map(),
        lastActivity: Date.now()
      };
      this.sessions.set(uid, session);
      console.log(`[DEMO MODE] Session created for UID ${uid}`);
    } else {
      session.lastActivity = Date.now();
    }
    return session;
  }

  static getSessionByUid(uid: string): DemoSession | null {
    const session = this.sessions.get(uid);
    if (session) {
      session.lastActivity = Date.now();
      return session;
    }
    return null;
  }

  static getSessions(): DemoSession[] {
    return Array.from(this.sessions.values());
  }

  static destroySession(uid: string): void {
    if (this.sessions.has(uid)) {
      this.sessions.delete(uid);
      this.demoUids.delete(uid);
      console.log(`[DEMO MODE] Session destroyed for UID ${uid}`);
    }
  }

  static cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [uid, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT_MS) {
        console.log(`[DEMO MODE] Session expired for UID ${uid}`);
        this.destroySession(uid);
      }
    }
  }
}

// Start periodic cleanup (every 5 minutes)
setInterval(() => {
  DemoUserService.cleanupExpiredSessions();
}, 5 * 60 * 1000).unref();
