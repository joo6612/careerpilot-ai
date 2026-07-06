export const GENERATE_DASHBOARD_INSIGHTS_PROMPT = (
  profileSummary: string,
  careerTitle: string,
  aggregateSummary: string
) => `
Analyze the candidate's career progress dashboard details for the target career: "${careerTitle}".

Candidate Summary:
${profileSummary}

Dashboard Aggregated Metrics and Progress:
${aggregateSummary}

Synthesize highly actionable dashboard insights. Identify the top priority task the candidate must do next, their overall strengths, weaknesses, missing skills required for this career, a next concrete recommendation to advance, and what their upcoming milestone should be.

Return response as a raw JSON object with the following structure:
{
  "topPriority": "string representing the absolute next thing they should focus on",
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "missingSkills": ["string", "string"],
  "nextRecommendation": "string representing a concrete recommendation",
  "upcomingMilestone": "string representing their next roadmap milestone to complete"
}
`;
