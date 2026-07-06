import { VaultDocument, DocumentHealth } from './models';

/**
 * Builds the initial DocumentHealth state for a newly uploaded document.
 */
export function buildInitialHealth(): DocumentHealth {
  return {
    uploadStatus: 'complete',
    verificationStatus: 'unverified',
    aiAnalysisStatus: 'pending',
    integrityStatus: 'ok',
    lastAccessed: null,
    aiProcessed: false,
    verified: false
  };
}

/**
 * Marks the document as AI-processed and updates the AI analysis status.
 */
export function markAIProcessed(doc: VaultDocument): VaultDocument {
  return {
    ...doc,
    health: {
      ...doc.health,
      aiAnalysisStatus: 'completed',
      aiProcessed: true
    },
    lastModified: new Date().toISOString()
  };
}

/**
 * Marks the document as verified by an external authority.
 */
export function markVerified(doc: VaultDocument): VaultDocument {
  return {
    ...doc,
    health: {
      ...doc.health,
      verificationStatus: 'verified',
      verified: true
    },
    lastModified: new Date().toISOString()
  };
}

/**
 * Refreshes the lastAccessed timestamp on a document health record.
 */
export function updateLastAccessed(doc: VaultDocument): VaultDocument {
  return {
    ...doc,
    health: {
      ...doc.health,
      lastAccessed: new Date().toISOString()
    }
  };
}

/**
 * Marks the document's integrity as corrupted (e.g. after a failed storage check).
 */
export function markIntegrityFailed(doc: VaultDocument): VaultDocument {
  return {
    ...doc,
    health: {
      ...doc.health,
      integrityStatus: 'corrupted'
    },
    lastModified: new Date().toISOString()
  };
}
