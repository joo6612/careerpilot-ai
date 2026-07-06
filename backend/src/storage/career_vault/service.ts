import { VaultDocument, VaultSearchQuery, VaultSearchResult, VersionEntry } from './models';
import { VaultRepository } from './repository';
import { UploadBody, PatchBody } from './validators';
import { buildInitialHealth, updateLastAccessed } from './metadata';
import { createVersionSnapshot, restoreFromSnapshot, buildRestoreMarker } from './versioning';
import { searchDocuments } from './search';
import {
  VaultDocumentNotFoundError,
  UnauthorizedVaultAccessError,
  VaultVersionNotFoundError
} from './exceptions';
import { isValidCategory } from './categories';

export class VaultService {
  constructor(private repository: VaultRepository) {}

  // ============================================================
  // Core CRUD Operations
  // ============================================================

  /**
   * Uploads a new career document into the vault.
   * Creates the document record, initializes health metadata, and saves
   * the initial version snapshot in history.
   */
  async uploadDocument(uid: string, body: UploadBody): Promise<VaultDocument> {
    const now = new Date().toISOString();
    const id = `vault-${uid.slice(0, 6)}-${Date.now()}`;

    const doc: VaultDocument = {
      id,
      ownerId: uid,
      category: body.category,
      title: body.title,
      description: body.description,
      originalFileName: body.fileName,
      storagePath: body.storagePath || `vault/${uid}/${body.category.toLowerCase()}/${id}/${body.fileName}`,
      fileSize: body.fileSize,
      fileType: body.fileType,
      textContent: body.textContent,
      uploadDate: now,
      lastModified: now,
      version: 1,
      status: 'active',
      tags: body.tags,
      health: buildInitialHealth()
    };

    await this.repository.save(doc);

    // Save initial snapshot so version history starts from v1
    const initialSnapshot = createVersionSnapshot(doc);
    await this.repository.saveVersionEntry(id, initialSnapshot);

    return doc;
  }

  /**
   * Returns all active documents for the authenticated user.
   * Updates the lastAccessed timestamp on each returned document.
   */
  async getDocuments(uid: string): Promise<VaultDocument[]> {
    const docs = await this.repository.getAllByUser(uid);
    const updated = docs.map(d => updateLastAccessed(d));
    // Persist the updated lastAccessed timestamps asynchronously
    updated.forEach(d => this.repository.save(d));
    return updated;
  }

  /**
   * Returns a single document by ID.
   * Validates ownership before returning.
   */
  async getDocumentById(uid: string, id: string): Promise<VaultDocument> {
    const doc = await this.repository.getById(id);
    if (!doc || doc.status === 'deleted') {
      throw new VaultDocumentNotFoundError(id);
    }
    if (doc.ownerId !== uid) {
      throw new UnauthorizedVaultAccessError(id);
    }
    const accessed = updateLastAccessed(doc);
    await this.repository.save(accessed);
    return accessed;
  }

  /**
   * Updates mutable fields on an existing document.
   * Snapshots the current state into version history before applying changes.
   */
  async updateDocument(uid: string, id: string, patch: PatchBody): Promise<VaultDocument> {
    const doc = await this.getDocumentById(uid, id); // ownership verified

    // Snapshot current state before update
    const snapshot = createVersionSnapshot(doc);
    await this.repository.saveVersionEntry(id, snapshot);

    // Apply patch
    const updated: VaultDocument = {
      ...doc,
      title: patch.title ?? doc.title,
      description: patch.description ?? doc.description,
      tags: patch.tags ?? doc.tags,
      status: patch.status ?? doc.status,
      textContent: patch.textContent ?? doc.textContent,
      version: doc.version + 1,
      lastModified: new Date().toISOString()
    };

    await this.repository.save(updated);
    return updated;
  }

  /**
   * Soft-deletes a document by marking it as deleted.
   * Hard-delete is used for privacy compliance.
   */
  async deleteDocument(uid: string, id: string): Promise<void> {
    const doc = await this.repository.getById(id);
    if (!doc || doc.status === 'deleted') {
      throw new VaultDocumentNotFoundError(id);
    }
    if (doc.ownerId !== uid) {
      throw new UnauthorizedVaultAccessError(id);
    }
    // Hard delete from in-memory store
    await this.repository.delete(id);
  }

  // ============================================================
  // Search & Filtering
  // ============================================================

  /**
   * Searches documents for the authenticated user based on query parameters.
   */
  async searchDocuments(uid: string, query: VaultSearchQuery): Promise<VaultSearchResult> {
    const docs = await this.repository.getAllByUser(uid);
    return searchDocuments(docs, query);
  }

  /**
   * Returns all active documents for a user within a specific category.
   */
  async getByCategory(uid: string, category: string): Promise<VaultDocument[]> {
    let cat = category;
    if (cat === 'Other Documents') {
      cat = 'Other';
    }
    if (!isValidCategory(cat)) {
      throw new Error(
        `Invalid category '${cat}'. Valid categories: Resume, Certificate, Project, Academic Document, Transcript, Offer Letter, Achievement, Portfolio File, Other.`
      );
    }
    const docs = await this.repository.getAllByUser(uid);
    return docs.filter(d => d.category === cat && d.status === 'active');
  }

  // ============================================================
  // Version History
  // ============================================================

  /**
   * Returns the full version history for a document (newest first).
   */
  async getVersionHistory(uid: string, id: string): Promise<VersionEntry[]> {
    // Validates document exists and is owned by user
    await this.getDocumentById(uid, id);
    return this.repository.getVersionHistory(id);
  }

  /**
   * Restores a previous version snapshot onto the current document.
   * Saves a restore-marker entry in history so the restore event is auditable.
   */
  async restoreVersion(uid: string, docId: string, versionId: string): Promise<VaultDocument> {
    const doc = await this.getDocumentById(uid, docId); // ownership verified

    const entry = await this.repository.getVersionById(docId, versionId);
    if (!entry) {
      throw new VaultVersionNotFoundError(versionId);
    }

    // Snapshot current state before overwrite
    const preRestoreSnapshot = createVersionSnapshot(doc);
    await this.repository.saveVersionEntry(docId, preRestoreSnapshot);

    // Apply the restored state
    const restored = restoreFromSnapshot(doc, entry);
    await this.repository.save(restored);

    // Record the restore event in history
    const restoreMarker = buildRestoreMarker(restored, versionId);
    await this.repository.saveVersionEntry(docId, restoreMarker);

    return restored;
  }
}

export default VaultService;
