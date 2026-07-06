import { Conversation } from './models';
import { DemoUserService } from '../services/demo_user_service';

// ============================================================
// Repository Interface
// Designed to be swapped for Firestore when moving to production.
// ============================================================

export interface MentorRepository {
  /** Upserts a conversation by id. */
  save(conversation: Conversation): Promise<void>;

  /** Returns a single conversation by id. */
  getById(id: string): Promise<Conversation | null>;

  /** Returns all conversations for a user, sorted by updatedAt descending. */
  getByUser(uid: string): Promise<Conversation[]>;

  /** Permanently removes a conversation. */
  delete(id: string): Promise<void>;
}

// ============================================================
// Local In-Memory Implementation
// ============================================================

export class LocalMentorRepository implements MentorRepository {
  private store = new Map<string, Conversation>();

  async save(conversation: Conversation): Promise<void> {
    if (DemoUserService.isDemoUid(conversation.uid)) {
      const session = DemoUserService.getSessionByUid(conversation.uid);
      if (session) {
        session.conversations.set(conversation.id, conversation);
      }
      return;
    }
    this.store.set(conversation.id, conversation);
  }

  async getById(id: string): Promise<Conversation | null> {
    for (const session of DemoUserService.getSessions()) {
      const conv = session.conversations.get(id);
      if (conv) return conv;
    }
    return this.store.get(id) || null;
  }

  async getByUser(uid: string): Promise<Conversation[]> {
    if (DemoUserService.isDemoUid(uid)) {
      const session = DemoUserService.getSessionByUid(uid);
      if (!session) return [];
      const results = Array.from(session.conversations.values());
      return results.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }
    const results: Conversation[] = [];
    this.store.forEach(conv => {
      if (conv.uid === uid) results.push(conv);
    });
    return results.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async delete(id: string): Promise<void> {
    for (const session of DemoUserService.getSessions()) {
      if (session.conversations.has(id)) {
        session.conversations.delete(id);
        return;
      }
    }
    this.store.delete(id);
  }
}

export default LocalMentorRepository;
