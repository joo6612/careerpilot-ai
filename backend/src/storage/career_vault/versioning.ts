import { VaultDocument, VersionEntry } from './models';

/**
 * Creates an immutable version snapshot of the current document state.
 * Called before any update so the previous state can be restored.
 */
export function createVersionSnapshot(doc: VaultDocument): VersionEntry {
  return {
    versionId: `ver-${doc.id}-v${doc.version}-${Date.now()}`,
    version: doc.version,
    title: doc.title,
    description: doc.description,
    textContent: doc.textContent,
    tags: [...doc.tags],
    fileName: doc.originalFileName,
    fileSize: doc.fileSize,
    snapshotDate: new Date().toISOString(),
    restoredFrom: null
  };
}

/**
 * Applies a previous version snapshot onto the document.
 * Increments version counter. Does NOT restore health metadata — only content fields.
 *
 * @param doc    - The current live document to restore into.
 * @param entry  - The version snapshot to restore from.
 * @returns      A new VaultDocument with restored content and incremented version.
 */
export function restoreFromSnapshot(doc: VaultDocument, entry: VersionEntry): VaultDocument {
  return {
    ...doc,
    title: entry.title,
    description: entry.description,
    textContent: entry.textContent,
    tags: [...entry.tags],
    originalFileName: entry.fileName,
    fileSize: entry.fileSize,
    version: doc.version + 1,
    lastModified: new Date().toISOString()
  };
}

/**
 * Builds a restore-marker VersionEntry that records which version was restored.
 * This is appended to the history log when a restore operation occurs.
 */
export function buildRestoreMarker(
  doc: VaultDocument,
  restoredFromVersionId: string
): VersionEntry {
  return {
    versionId: `ver-${doc.id}-restore-${Date.now()}`,
    version: doc.version,
    title: doc.title,
    description: doc.description,
    textContent: doc.textContent,
    tags: [...doc.tags],
    fileName: doc.originalFileName,
    fileSize: doc.fileSize,
    snapshotDate: new Date().toISOString(),
    restoredFrom: restoredFromVersionId
  };
}
