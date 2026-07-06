export const RoadmapPrompts = {
  /**
   * Generates prompt text for personalized study roadmap generation.
   */
  roadmapGenerationPrompt(profileContext: string): string {
    return `
Generate a personalized learning roadmap with exactly 4 sequentially structured milestones for a user preparing to land their target career.

Profile Context Details:
${profileContext}

For each milestone, provide:
- id: Unique string, e.g., "rm-1", "rm-2"
- title: Short title
- description: Explanation of what this milestone covers
- status: "in-progress" for the first milestone, "locked" for the others
- duration: Expected duration in weeks or months (e.g. "4 weeks")
- skills: Array of 2-3 target technical skills taught in this milestone
- topics: Array of 3-4 specific study topics/milestones

Return a JSON array of 4 objects matching this structure:
[
  {
    "id": "rm-1",
    "title": "...",
    "description": "...",
    "status": "in-progress",
    "duration": "4 weeks",
    "skills": ["...", "..."],
    "topics": ["...", "...", "..."]
  },
  ...
]
`;
  }
};
