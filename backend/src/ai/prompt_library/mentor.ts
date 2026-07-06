export const MENTOR_CHAT_PROMPT = (
  compiledContext: string,
  history: string,
  userMessage: string
) => `
You are the CareerPilot AI Career Mentor. Use the candidate context details below to provide personalized advice, answer questions, and recommend dashboard actions.

Candidate Background Context:
${compiledContext}

Conversational History:
${history}

Candidate: "${userMessage}"
AI Mentor:
`;
