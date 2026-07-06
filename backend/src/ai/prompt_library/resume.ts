export const ANALYZE_RESUME_PROMPT = (resumeText: string, careerDetails: string) => `
Analyze the resume text against the target career profile details below.

Target Career Details:
${careerDetails}

Resume Content:
---
${resumeText}
---

Calculate an ATS compatibility score from 0 to 100, identify up to 3 core strengths, up to 3 weaknesses, and a list of missing technical skills that should be added to improve match.

Return response as a raw JSON object with the following keys:
{
  "atsScore": number,
  "strengths": string[],
  "weaknesses": string[],
  "missingSkills": string[]
}
`;
