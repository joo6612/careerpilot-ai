export const SUGGEST_CAREER_PROMPT = (bio: string, interests: string) => `
You are an expert career advisory AI. Analyze the candidate's exact background, detected tech skills, and explicit interests to suggest exactly 3 high-affinity career titles.

Biography / Skills: "${bio}"
Interests: "${interests}"

CRITICAL RELEVANCE RULES:
1. Match the suggested careers DIRECTLY to the candidate's actual stated skills. For example:
   - If candidate knows Python, Git, ML/Data, or Web tools, recommend tracks such as "AI Engineer", "Software Engineer", "Full Stack Developer", or "Data Scientist".
   - Do NOT suggest irrelevant paths like Game Development, Game Designer, 3D Animator, or Hardware Technician unless the candidate explicitly expressed those interests.
2. Ensure recommendations are realistic, market-relevant, and aligned with industry demand.
3. Keep response strictly concise.

Return response ONLY as a raw JSON array of 3 string titles, for example:
["Software Engineer", "AI / Machine Learning Engineer", "Full Stack Developer"]
`;

export const ANALYZE_CAREER_SKILLS_PROMPT = (careerTitle: string) => `
Analyze the technical skills required for the career: "${careerTitle}".
List the top 8 essential skills needed for entry-level and mid-level roles in this domain.
Focus on modern industry standards. Be concise.

Return response as a raw JSON array of strings containing only the skill names, for example:
["Python", "Git", "SQL", "Docker", "REST APIs", "CI/CD", "TypeScript", "System Design"]
`;

export const GENERATE_DISCOVERY_INSIGHTS_PROMPT = (profileSummary: string, recommendedCareersSummary: string) => `
Analyze the candidate's profile against the top recommended careers below.

Candidate Summary:
${profileSummary}

Recommended Careers:
${recommendedCareersSummary}

Identify candidate strengths, weaknesses, technical skill gaps, potential career transition risks, specific learning suggestions, and a step-by-step career improvement plan.
Be direct, actionable, and token-efficient.

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
Be concise and avoid filler sentences.

Return response as a raw JSON object with the following structure:
{
  "strengths": string[],
  "weaknesses": string[],
  "missingSkills": string[],
  "estimatedCompletionTimeHours": number,
  "confidence": "Low" | "Medium" | "High"
}
`;
