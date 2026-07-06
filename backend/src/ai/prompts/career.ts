export const CareerPrompts = {
  /**
   * Generates prompt text for career suggestions based on user biography text.
   */
  careerDiscoveryPrompt(aboutMe: string): string {
    return `
Based on the candidate's career interests and background description below, suggest exactly 3 suitable target career titles.

Candidate description: "${aboutMe}"

Return a JSON array of strings, for example:
["AI Engineer", "Clinical Research Scientist", "UI/UX Product Designer"]
`;
  },

  /**
   * Generates prompt text for listing technical skills required for a selected career.
   */
  careerSkillsPrompt(career: string): string {
    return `
List exactly 8 key technical skills required for the career: "${career}".
Return a JSON array of strings, e.g., ["Python", "TensorFlow", "SQL", "Git"]
`;
  }
};
