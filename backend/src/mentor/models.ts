// ============================================================
// AI Mentor Engine — Core Domain Interfaces
// ============================================================

export type MentorPersonaId =
  | 'career-mentor'
  | 'resume-mentor'
  | 'interview-coach'
  | 'learning-coach'
  | 'roadmap-planner';

export type MessageRole = 'user' | 'mentor';

/**
 * A single message in a mentor conversation.
 * Keeps backward compatibility with the legacy ChatMessage shape.
 */
export interface MentorMessage {
  id: string;
  role: MessageRole;
  /** Alias: 'user' | 'mentor' — matches legacy `sender` field shape. */
  sender: MessageRole;
  text: string;
  timestamp: string;
  personaId?: MentorPersonaId;
}

/**
 * A full mentor conversation session.
 * Future sessions resume from the previous context using `summary`.
 */
export interface Conversation {
  id: string;
  uid: string;
  personaId: MentorPersonaId;
  messages: MentorMessage[];
  /** Short summary of the conversation so far — updated after 10+ messages. */
  summary: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Structured recommendation attached to every mentor reply.
 */
export interface MentorRecommendation {
  reason: string;
  confidence: 'Low' | 'Medium' | 'High';
  recommendedAction: string;
  relatedResources: string[];
  nextSuggestedQuestion: string;
}

/**
 * Full response object returned by POST /mentor/chat.
 */
export interface MentorResponse {
  reply: string;
  recommendation: MentorRecommendation;
  conversationId: string;
  personaId: MentorPersonaId;
  /** Legacy-compatible flat chat array for frontend compatibility. */
  chat: MentorMessage[];
  /** Legacy-compatible reply message. */
  replyMessage: MentorMessage;
}
