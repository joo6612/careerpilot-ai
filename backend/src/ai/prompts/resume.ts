export const ResumePrompts = {
  /**
   * Generates prompt text for ATS resume analysis.
   */
  resumeAnalysisPrompt(profileContext: string, method: 'upload' | 'generate'): string {
    return `
Analyze the resume for a candidate aiming to get into their target career.
Profile Context Details:
${profileContext}

Resume Method: ${method}

Evaluate:
1. ATS Score (0 to 100 percentage based on skills alignment with career)
2. Exactly 3 Strengths
3. Exactly 3 Weaknesses/Improvement Areas
4. Exactly 3 Missing Key Skills required for this role

Return a JSON object matching this structure:
{
  "atsScore": 82,
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "missingSkills": ["...", "...", "..."]
}
`;
  }
};
