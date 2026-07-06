import { RoadmapMilestone } from './models';

export const MilestoneTemplates = {
  /**
   * Generates default milestone segments for all six required types.
   */
  getDefaultMilestones(careerId: string, careerTitle: string): RoadmapMilestone[] {
    return [
      {
        id: `mil-found-${careerId}`,
        title: `${careerTitle} Foundations`,
        type: 'Foundation',
        expectedOutcome: 'Demonstrate competency in basic workspace concepts and fundamental coding theories.',
        status: 'in-progress',
        tasks: []
      },
      {
        id: `mil-core-${careerId}`,
        title: `${careerTitle} Core Languages & Frameworks`,
        type: 'Core Skills',
        expectedOutcome: 'Acquire structural engineering fluency in tools required for entry-level tasks.',
        status: 'locked',
        tasks: []
      },
      {
        id: `mil-proj-${careerId}`,
        title: `${careerTitle} Practical Portfolio Projects`,
        type: 'Projects',
        expectedOutcome: 'Build and deploy a functional GitHub capstone project applying best practices.',
        status: 'locked',
        tasks: []
      },
      {
        id: `mil-res-${careerId}`,
        title: `${careerTitle} ATS Resume Optimization`,
        type: 'Resume',
        expectedOutcome: 'Incorporate required keywords and raise overall resume ATS compatibility score to 80+.',
        status: 'locked',
        tasks: []
      },
      {
        id: `mil-inter-${careerId}`,
        title: `${careerTitle} Technical & Behavioral Prep`,
        type: 'Interview Preparation',
        expectedOutcome: 'Successfully clear mockup interview code assessments with constructive grading.',
        status: 'locked',
        tasks: []
      },
      {
        id: `mil-job-${careerId}`,
        title: `${careerTitle} Application Sourcing Pipeline`,
        type: 'Job Applications',
        expectedOutcome: 'Submit qualified applications and establish connection logs with hiring managers.',
        status: 'locked',
        tasks: []
      }
    ];
  }
};
export default MilestoneTemplates;
