export const RoadmapValidators = {
  /**
   * Asserts task status parameters are non-empty strings.
   */
  validateTaskStatusUpdate(body: any): { taskId: string; status: 'locked' | 'in-progress' | 'completed' } {
    const taskId = String(body.taskId || '').trim();
    const status = String(body.status || '').trim();

    if (!taskId) {
      throw new Error('Roadmap taskId parameter is required for status updates');
    }

    const valid = ['locked', 'in-progress', 'completed'];
    if (!valid.includes(status)) {
      throw new Error("Roadmap status parameter must be one of: 'locked', 'in-progress', 'completed'");
    }

    return { taskId, status: status as any };
  },

  /**
   * Asserts milestone status parameters are non-empty strings.
   */
  validateMilestoneStatusUpdate(body: any): { milestoneId: string; status: 'locked' | 'in-progress' | 'completed' } {
    const milestoneId = String(body.milestoneId || '').trim();
    const status = String(body.status || '').trim();

    if (!milestoneId) {
      throw new Error('Roadmap milestoneId parameter is required for status updates');
    }

    const valid = ['locked', 'in-progress', 'completed'];
    if (!valid.includes(status)) {
      throw new Error("Roadmap status parameter must be one of: 'locked', 'in-progress', 'completed'");
    }

    return { milestoneId, status: status as any };
  }
};
export default RoadmapValidators;
