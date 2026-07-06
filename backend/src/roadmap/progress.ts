import { UserRoadmap, RoadmapProgress } from './models';

export const RoadmapProgressTracker = {
  /**
   * Compiles percentage progress rates and logs timelines.
   */
  calculateProgress(roadmap: UserRoadmap): RoadmapProgress {
    let completedTasks = 0;
    let totalTasks = 0;
    let completedMilestones = 0;
    let totalMilestones = 0;
    let estimatedRemainingTimeHours = 0;

    roadmap.phases.forEach(phase => {
      phase.milestones.forEach(milestone => {
        totalMilestones++;
        if (milestone.status === 'completed') {
          completedMilestones++;
        }

        milestone.tasks.forEach(task => {
          totalTasks++;
          if (task.status === 'completed') {
            completedTasks++;
          } else {
            estimatedRemainingTimeHours += task.estimatedHours;
          }
        });
      });
    });

    const completionPercentage = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    return {
      completedTasks,
      totalTasks,
      completedMilestones,
      totalMilestones,
      completionPercentage,
      estimatedRemainingTimeHours,
      weeklyProgress: [
        { week: 'Week 1', tasksCompleted: Math.min(completedTasks, 2) },
        { week: 'Week 2', tasksCompleted: Math.max(0, completedTasks - 2) }
      ],
      monthlyProgress: [
        { month: 'Month 1', milestonesCompleted: completedMilestones }
      ]
    };
  }
};
export default RoadmapProgressTracker;
