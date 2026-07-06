export const GENERATE_ROADMAP_PROMPT = (userProfileContext: string, careerContext: string) => `
Using the candidate profile and target career details, construct a personalized 4-stage learning roadmap.

Candidate Profile & Schedule Settings:
${userProfileContext}

Target Career Catalog Profile:
${careerContext}

Generate exactly 4 chronological milestones in order. The first milestone status should be set to "in-progress", and the other 3 should be set to "locked".

Return response as a raw JSON array of objects conforming to this structure:
[
  {
    "id": "rm-1",
    "title": "Milestone Title",
    "description": "Short explanation of milestone goals.",
    "status": "in-progress" | "locked",
    "duration": "Duration in weeks (e.g. 4 weeks)",
    "skills": ["Skill 1", "Skill 2"],
    "topics": ["Subtopic A", "Subtopic B"]
  },
  ...
]
`;
