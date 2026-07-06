export const SUGGEST_CAREER_PROMPT = (bio: string, interests: string) => `
Based on the following biography and interests, suggest exactly 3 suitable target career titles for the user.

Biography: "${bio}"
Interests: "${interests}"

Return response as a raw JSON array of strings containing only the job titles, for example:
["AI Engineer", "Data Scientist", "Software Developer"]
`;

export const ANALYZE_CAREER_SKILLS_PROMPT = (careerTitle: string) => `
Analyze the technical skills required for the career: "${careerTitle}".
List the top 8 essential skills needed for entry-level and mid-level roles in this domain.

Return response as a raw JSON array of strings containing only the skill names, for example:
["Python", "Git", "SQL", "Docker"]
`;

export const GENERATE_DISCOVERY_INSIGHTS_PROMPT = (profileSummary: string, recommendedCareersSummary: string) => `
Analyze the candidate's profile against the top recommended careers below.

Candidate Summary:
${profileSummary}

Recommended Careers:
${recommendedCareersSummary}

Identify candidate strengths, weaknesses, technical skill gaps, potential career transition risks, specific learning suggestions, and a step-by-step career improvement plan.

Return response as a raw JSON object with the following structure:
{
  "strengths": string[],
  "weaknesses": string[],
  "skillGaps": string[],
  "careerRisks": string[],
  "learningSuggestions": string[],
  "improvementPlan": string[]
}
`;

export const GENERATE_READINESS_INSIGHTS_PROMPT = (profileSummary: string, careerTitle: string, categoryScores: string) => `
Analyze the candidate's profile readiness for the target career: "${careerTitle}".

Candidate Summary:
${profileSummary}

Category Scores:
${categoryScores}

Identify candidate strengths, weaknesses, missing skills, estimated learning completion hours, and confidence.

Return response as a raw JSON object with the following structure:
{
  "strengths": string[],
  "weaknesses": string[],
  "missingSkills": string[],
  "estimatedCompletionTimeHours": number,
  "confidence": "Low" | "Medium" | "High"
}
`;
