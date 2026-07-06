import { UserProfile } from '../types';
import { Career } from '../career/models';
import { RoadmapPhase, RoadmapMilestone, RoadmapTask, UserRoadmap } from './models';
import { AIService } from '../ai/services/ai_service';
import { MilestoneTemplates } from './milestones';

export const RoadmapGenerator = {
  /**
   * Generates a fully structured UserRoadmap by combining AI catalog layouts
   * with programmatic tasks and outcomes.
   */
  async generate(
    uid: string,
    profile: UserProfile,
    career: Career,
    assessments: any[]
  ): Promise<UserRoadmap> {
    const careerTitle = career.title;
    
    // 1. Load the 6 milestone segments
    const milestones = MilestoneTemplates.getDefaultMilestones(career.id, careerTitle);

    // 2. Fetch AI roadmap milestones using AI Foundation Layer
    let aiItems: any[] = [];
    try {
      const response = await AIService.generateRoadmap(profile);
      if (response.success && response.data) {
        aiItems = response.data;
      }
    } catch (e) {
      console.warn('AI Roadmap generation failed. Falling back to programmatic items:', e);
    }

    // 3. For each milestone, compile realistic tasks
    milestones.forEach((milestone, idx) => {
      const aiMatch = aiItems[idx];
      const topics = aiMatch ? aiMatch.topics || [] : ['Fundamental Concepts', 'Industry Standards'];
      const skills = aiMatch ? aiMatch.skills || [] : career.requiredSkills.slice(0, 3);

      if (milestone.type === 'Foundation') {
        milestone.tasks = [
          {
            id: `task-found-1-${career.id}`,
            title: `Learn ${careerTitle} Foundations`,
            description: `Understand general engineering paradigms and workspace basics.`,
            difficulty: 'Beginner',
            estimatedHours: 10,
            priority: 'High',
            requiredSkills: skills,
            status: 'in-progress',
            recommendedResource: 'https://www.coursera.org/'
          },
          {
            id: `task-found-2-${career.id}`,
            title: `Review ${careerTitle} Math & Theory`,
            description: `Brush up on computational models and core architecture.`,
            difficulty: 'Beginner',
            estimatedHours: 8,
            priority: 'Medium',
            requiredSkills: skills,
            status: 'locked',
            recommendedResource: 'https://khanacademy.org/'
          }
        ];
      } else if (milestone.type === 'Core Skills') {
        milestone.tasks = topics.map((topic: string, tIdx: number) => ({
          id: `task-core-${tIdx}-${career.id}`,
          title: `Master ${topic}`,
          description: `Deep dive into core domain skills and execute coding practice patterns.`,
          difficulty: 'Intermediate',
          estimatedHours: 12,
          priority: 'High',
          requiredSkills: skills,
          status: 'locked',
          recommendedResource: 'https://freecodecamp.org/'
        }));
      } else if (milestone.type === 'Projects') {
        milestone.tasks = [
          {
            id: `task-proj-1-${career.id}`,
            title: `Design Capstone Architecture`,
            description: `Draft system design schemas and repository structures on Git.`,
            difficulty: 'Intermediate',
            estimatedHours: 8,
            priority: 'High',
            requiredSkills: skills,
            status: 'locked',
            recommendedResource: 'https://github.com/'
          },
          {
            id: `task-proj-2-${career.id}`,
            title: `Build & Deploy Capstone MVP`,
            description: `Implement core logic, configure Docker containers, and deploy to host environment.`,
            difficulty: 'Advanced',
            estimatedHours: 25,
            priority: 'High',
            requiredSkills: skills,
            status: 'locked',
            recommendedResource: 'https://railway.app/'
          }
        ];
      } else if (milestone.type === 'Resume') {
        milestone.tasks = [
          {
            id: `task-res-1-${career.id}`,
            title: `Update Resume Keywords`,
            description: `Integrate core catalog technical skills directly inside your achievements section.`,
            difficulty: 'Beginner',
            estimatedHours: 3,
            priority: 'High',
            requiredSkills: [],
            status: 'locked',
            recommendedResource: 'https://careerpilot.ai/'
          }
        ];
      } else if (milestone.type === 'Interview Preparation') {
        milestone.tasks = [
          {
            id: `task-inter-1-${career.id}`,
            title: `Mock Coding Challenges`,
            description: `Solve algorithm interview questions and practice technical communications.`,
            difficulty: 'Intermediate',
            estimatedHours: 12,
            priority: 'High',
            requiredSkills: [],
            status: 'locked',
            recommendedResource: 'https://leetcode.com/'
          }
        ];
      } else { // Job Applications
        milestone.tasks = [
          {
            id: `task-job-1-${career.id}`,
            title: `Job Sourcing and Networking`,
            description: `Identify 10 matching active openings and connect with relevant hiring managers.`,
            difficulty: 'Beginner',
            estimatedHours: 10,
            priority: 'Medium',
            requiredSkills: [],
            status: 'locked',
            recommendedResource: 'https://linkedin.com/'
          }
        ];
      }
    });

    const phases: RoadmapPhase[] = [
      {
        id: `phase-1-${career.id}`,
        title: 'Phase 1: Foundation & Core Competency',
        description: 'Establish programming foundations and language specific skill sets.',
        milestones: milestones.slice(0, 2)
      },
      {
        id: `phase-2-${career.id}`,
        title: 'Phase 2: Portfolio & Optimization',
        description: 'Develop technical project portfolios and prepare professional materials.',
        milestones: milestones.slice(2, 4)
      },
      {
        id: `phase-3-${career.id}`,
        title: 'Phase 3: Readiness & Placement',
        description: 'Pass coding mocks and apply to active positions.',
        milestones: milestones.slice(4, 6)
      }
    ];

    return {
      id: `road-${Date.now()}`,
      uid: uid,
      careerId: career.id,
      careerTitle: career.title,
      timestamp: new Date().toISOString(),
      phases,
      completionPercentage: 0,
      estimatedRemainingTimeHours: 80
    };
  }
};
export default RoadmapGenerator;
