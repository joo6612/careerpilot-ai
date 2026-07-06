import { UserRoadmap } from './models';

export const RoadmapPlanner = {
  /**
   * Estimates and updates remaining study hours based on tasks completion statuses.
   */
  planTimeline(roadmap: UserRoadmap): UserRoadmap {
    let totalHours = 0;
    roadmap.phases.forEach(phase => {
      phase.milestones.forEach(milestone => {
        milestone.tasks.forEach(task => {
          if (task.status !== 'completed') {
            totalHours += task.estimatedHours;
          }
        });
      });
    });
    roadmap.estimatedRemainingTimeHours = totalHours;
    return roadmap;
  }
};
export default RoadmapPlanner;
