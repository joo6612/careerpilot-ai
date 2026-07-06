export const EVALUATE_ASSESSMENT_RESPONSE_PROMPT = (
  question: string,
  candidateAnswer: string
) => `
You are a technical interviewer. Evaluate the candidate's answer for the following question.

Technical Question:
"${question}"

Candidate Answer:
"${candidateAnswer}"

Provide a score out of 10 (e.g. "8.5/10") based on technical accuracy, clarity, and depth. Provide constructive, brief comments explaining the rating and what was missing or could be improved.

Return response as a raw JSON object containing exactly the score and comment fields:
{
  "score": "X/10",
  "comment": "Constructive feedback text."
}
`;
