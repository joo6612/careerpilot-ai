import { MentorPersonaId } from './models';
import { isValidPersonaId } from './personas';

export interface ChatBody {
  text: string;
  personaId: MentorPersonaId;
  conversationId?: string;
}

export interface PersonaBody {
  personaId: MentorPersonaId;
}

/**
 * Validates the POST /mentor/chat request body.
 * `personaId` defaults to 'career-mentor' if not supplied.
 */
export function validateChatBody(body: any): ChatBody {
  const text = String(body.text || '').trim();
  if (!text) {
    throw new Error('Message text is required.');
  }
  if (text.length > 2000) {
    throw new Error('Message text must be 2000 characters or fewer.');
  }

  const rawPersona = String(body.personaId || 'career-mentor').trim();
  if (!isValidPersonaId(rawPersona)) {
    throw new Error(
      `Invalid personaId '${rawPersona}'. Valid options: career-mentor, resume-mentor, interview-coach, learning-coach, roadmap-planner.`
    );
  }

  return {
    text,
    personaId: rawPersona as MentorPersonaId,
    conversationId: body.conversationId ? String(body.conversationId).trim() : undefined
  };
}

/**
 * Validates the POST /mentor/persona request body.
 */
export function validatePersonaBody(body: any): PersonaBody {
  const rawPersona = String(body.personaId || '').trim();
  if (!rawPersona) {
    throw new Error('personaId is required.');
  }
  if (!isValidPersonaId(rawPersona)) {
    throw new Error(
      `Invalid personaId '${rawPersona}'. Valid options: career-mentor, resume-mentor, interview-coach, learning-coach, roadmap-planner.`
    );
  }
  return { personaId: rawPersona as MentorPersonaId };
}
