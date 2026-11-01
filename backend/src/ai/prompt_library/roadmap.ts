export const GENERATE_ROADMAP_PROMPT = (userProfileContext: string, careerContext: string) => `
Using the candidate profile and target career details, construct a comprehensive, personalized 4-stage learning roadmap with actionable milestone projects.

Candidate Profile & Schedule Settings:
${userProfileContext}

Target Career Catalog Profile:
${careerContext}

Generate exactly 4 chronological milestones in order. The first milestone status must be "in-progress", and milestones 2-4 must be "locked".
Each milestone must include:
1. Detailed technical topics and practical sub-topics.
2. An actionable, hands-on milestone project to build upon stage completion, with title, clear description, and key deliverables.

Return response ONLY as a raw JSON array of objects conforming to this structure:
[
  {
    "id": "rm-1",
    "title": "Milestone Title",
    "description": "Concise summary of milestone objectives and core competencies.",
    "status": "in-progress",
    "duration": "4 weeks",
    "skills": ["Skill 1", "Skill 2", "Skill 3"],
    "topics": ["Subtopic 1", "Subtopic 2", "Subtopic 3", "Subtopic 4"],
    "project": {
      "title": "Hands-On Capstone Project Name",
      "description": "Specific project brief detailing what the candidate will build and deploy.",
      "deliverables": ["Deliverable 1", "Deliverable 2", "Deliverable 3"]
    }
  }
]
`;
