import { VaultDocument, VersionEntry } from './models';
import { DemoUserService } from '../../services/demo_user_service';

// ============================================================
// Repository Interface
// Designed to be swapped for Firebase Storage / Firestore
// when the backend moves to production persistence.
// ============================================================

export interface VaultRepository {
  /**
   * Persists or updates a vault document. Upserts by id.
   */
  save(doc: VaultDocument): Promise<void>;

  /**
   * Returns a document by ID, regardless of owner.
   * Ownership check is performed at the service layer.
   */
  getById(id: string): Promise<VaultDocument | null>;

  /**
   * Returns all active documents belonging to a user.
   */
  getAllByUser(uid: string): Promise<VaultDocument[]>;

  /**
   * Hard-deletes a document record from the store.
   */
  delete(id: string): Promise<void>;

  /**
   * Appends a version snapshot to the history log for a document.
   */
  saveVersionEntry(docId: string, entry: VersionEntry): Promise<void>;

  /**
   * Returns the full ordered version history for a document (newest first).
   */
  getVersionHistory(docId: string): Promise<VersionEntry[]>;

  /**
   * Returns a single version entry by versionId.
   */
  getVersionById(docId: string, versionId: string): Promise<VersionEntry | null>;
}

// ============================================================
// Local In-Memory Implementation
// Replace with FirebaseVaultRepository in production.
// ============================================================

export class LocalVaultRepository implements VaultRepository {
  /**
   * Primary document store: documentId → VaultDocument
   */
  private documents = new Map<string, VaultDocument>();

  /**
   * Version history store: documentId → VersionEntry[]
   */
  private versionHistory = new Map<string, VersionEntry[]>();

  async save(doc: VaultDocument): Promise<void> {
    if (DemoUserService.isDemoUid(doc.ownerId)) {
      const session = DemoUserService.getSessionByUid(doc.ownerId);
      if (session) {
        session.vaultDocuments.set(doc.id, doc);
      }
      return;
    }
    this.documents.set(doc.id, doc);
  }

  async getById(id: string): Promise<VaultDocument | null> {
    for (const session of DemoUserService.getSessions()) {
      const doc = session.vaultDocuments.get(id);
      if (doc) return doc;
    }
    return this.documents.get(id) || null;
  }

  async getAllByUser(uid: string): Promise<VaultDocument[]> {
    if (DemoUserService.isDemoUid(uid)) {
      const session = DemoUserService.getSessionByUid(uid);
      if (!session) return [];
      const results: VaultDocument[] = Array.from(session.vaultDocuments.values())
        .filter(doc => doc.status !== 'deleted');
      return results.sort(
        (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
    }
    const results: VaultDocument[] = [];
    this.documents.forEach(doc => {
      if (doc.ownerId === uid && doc.status !== 'deleted') {
        results.push(doc);
      }
    });
    // Return sorted by uploadDate descending (newest first)
    return results.sort(
      (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  }

  async delete(id: string): Promise<void> {
    for (const session of DemoUserService.getSessions()) {
      if (session.vaultDocuments.has(id)) {
        session.vaultDocuments.delete(id);
        return;
      }
    }
    this.documents.delete(id);
  }

  async saveVersionEntry(docId: string, entry: VersionEntry): Promise<void> {
    for (const session of DemoUserService.getSessions()) {
      if (session.vaultDocuments.has(docId)) {
        const history = session.vaultVersions.get(docId) || [];
        history.push(entry);
        session.vaultVersions.set(docId, history);
        return;
      }
    }
    const history = this.versionHistory.get(docId) || [];
    history.push(entry);
    this.versionHistory.set(docId, history);
  }

  async getVersionHistory(docId: string): Promise<VersionEntry[]> {
    for (const session of DemoUserService.getSessions()) {
      if (session.vaultDocuments.has(docId)) {
        const history = session.vaultVersions.get(docId) || [];
        return [...history].sort(
          (a, b) => new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime()
        );
      }
    }
    const history = this.versionHistory.get(docId) || [];
    // Return newest snapshot first
    return [...history].sort(
      (a, b) => new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime()
    );
  }

  async getVersionById(docId: string, versionId: string): Promise<VersionEntry | null> {
    for (const session of DemoUserService.getSessions()) {
      if (session.vaultDocuments.has(docId)) {
        const history = session.vaultVersions.get(docId) || [];
        return history.find(e => e.versionId === versionId) || null;
      }
    }
    const history = this.versionHistory.get(docId) || [];
    return history.find(e => e.versionId === versionId) || null;
  }
}

export default LocalVaultRepository;
