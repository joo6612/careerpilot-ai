export const AssessmentPrompts = {
  /**
   * Generates prompt text for evaluating a candidate's answer to a skill assessment question.
   */
  assessmentEvaluationPrompt(question: string, answer: string): string {
    return `
Evaluate the candidate's answer to the technical skill verification question below.

Question: "${question}"
Candidate Answer: "${answer}"

Judge:
1. Score (0 to 100 percentage based on correctness, depth, and clarity)
2. Comment: Constructive, detailed critique explaining what they got right, what was missing, and how to improve.

Return a JSON object matching this structure:
{
  "score": "85",
  "comment": "..."
}
`;
  }
};
