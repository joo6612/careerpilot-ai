import { UserRoadmap } from './models';

export const RoadmapScheduler = {
  /**
   * Paces milestones based on daily study availability inputs.
   */
  scheduleMilestones(roadmap: UserRoadmap, hoursPerWeek: number): UserRoadmap {
    let weekOffset = 1;
    roadmap.phases.forEach(phase => {
      phase.milestones.forEach(milestone => {
        const milestoneHours = milestone.tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
        const weeksNeeded = Math.max(1, Math.round(milestoneHours / (hoursPerWeek || 10)));
        milestone.expectedOutcome += ` [Estimated Target: Week ${weekOffset} to Week ${weekOffset + weeksNeeded - 1}]`;
        weekOffset += weeksNeeded;
      });
    });
    return roadmap;
  }
};
export default RoadmapScheduler;
