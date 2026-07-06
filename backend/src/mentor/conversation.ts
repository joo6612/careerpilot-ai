import { Conversation, MentorMessage, MentorPersonaId } from './models';
import { MentorRepository } from './repository';
import { buildConversationSummary } from './memory';

/**
 * Creates a fresh Conversation record for a user and persona.
 */
export function createConversation(uid: string, personaId: MentorPersonaId): Conversation {
  const now = new Date().toISOString();
  return {
    id: `conv-${uid.slice(0, 6)}-${Date.now()}`,
    uid,
    personaId,
    messages: [],
    summary: '',
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Appends a new message to a conversation and updates the timestamp.
 * If the conversation has 10+ messages, refreshes the summary.
 */
export function appendMessage(conv: Conversation, message: MentorMessage): Conversation {
  const messages = [...conv.messages, message];
  const summary = messages.length >= 10
    ? buildConversationSummary(messages)
    : conv.summary;

  return {
    ...conv,
    messages,
    summary,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Returns the most recent conversation for a given user+persona pair,
 * or creates and saves a new one if none exists.
 */
export async function getOrCreateActiveConversation(
  repo: MentorRepository,
  uid: string,
  personaId: MentorPersonaId
): Promise<Conversation> {
  const all = await repo.getByUser(uid);
  // Find the most recently updated conversation for this persona
  const existing = all
    .filter(c => c.personaId === personaId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  if (existing) return existing;

  const fresh = createConversation(uid, personaId);
  await repo.save(fresh);
  return fresh;
}
