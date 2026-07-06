import { MentorMessage } from './models';

/** Maximum messages to pass as context window to AI provider. */
const MAX_CONTEXT_MESSAGES = 10;

/**
 * Trims conversation history to the most recent N messages.
 * Preserves the full session for storage; only the trimmed slice is sent to AI.
 */
export function trimHistory(messages: MentorMessage[], maxMessages = MAX_CONTEXT_MESSAGES): MentorMessage[] {
  if (messages.length <= maxMessages) return messages;
  return messages.slice(-maxMessages);
}

/**
 * Formats message array as a human-readable conversation transcript
 * matching the format MENTOR_CHAT_PROMPT expects.
 */
export function buildHistoryText(messages: MentorMessage[]): string {
  if (messages.length === 0) return 'No prior conversation history.';
  return messages
    .map(m => {
      const speaker = m.role === 'user' ? 'Candidate' : 'AI Mentor';
      return `${speaker}: ${m.text}`;
    })
    .join('\n');
}

/**
 * Builds a compact 3-point summary of a long conversation.
 * Used to seed future sessions so the AI has continuity context
 * without exceeding token limits.
 */
export function buildConversationSummary(messages: MentorMessage[]): string {
  if (messages.length < 6) return '';

  const userMessages = messages.filter(m => m.role === 'user').slice(-3);
  const topics = userMessages.map(m => m.text.slice(0, 80)).join(' | ');

  return `Previous conversation summary: The candidate discussed the following topics — ${topics}. Use this to maintain continuity.`;
}

/**
 * Builds the full history text for AI context, optionally prepending
 * a prior session summary for long-running conversations.
 */
export function buildContextHistory(messages: MentorMessage[], summary: string): string {
  const trimmed = trimHistory(messages);
  const historyText = buildHistoryText(trimmed);

  if (summary) {
    return `${summary}\n\nRecent Messages:\n${historyText}`;
  }
  return historyText;
}
