import type { ChatMessage } from '../../types';

export const MentorPrompts = {
  /**
   * Generates prompt text for career mentoring support replies.
   */
  mentorReplyPrompt(profileContext: string, chatHistory: ChatMessage[], messageText: string): string {
    const historyText = chatHistory
      .slice(-10)
      .map(msg => `${msg.sender === 'user' ? 'User' : 'AI Mentor'}: ${msg.text}`)
      .join('\n');

    return `
You are the supportive AI Mentor for a candidate preparing for their target career.

Profile Context Details:
${profileContext}

Recent chat history between you and the user:
${historyText}

User's new message to you: "${messageText}"

Provide a supportive, highly structured, and insightful career mentoring response. Include reasoning and clear next actions where appropriate. Keep it to 2-3 concise paragraphs.
`;
  }
};
