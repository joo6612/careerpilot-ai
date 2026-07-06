// ============================================================
// Career Vault — Core Domain Interfaces
// ============================================================

export type DocumentCategory =
  | 'Resume'
  | 'Certificate'
  | 'Project'
  | 'Academic Document'
  | 'Transcript'
  | 'Offer Letter'
  | 'Achievement'
  | 'Portfolio File'
  | 'Other';

export type DocumentStatus = 'active' | 'archived' | 'deleted';

export type AIAnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type UploadStatus = 'uploading' | 'complete' | 'failed';
export type IntegrityStatus = 'ok' | 'corrupted' | 'missing';

/**
 * Document health metadata — tracks lifecycle state of each document.
 */
export interface DocumentHealth {
  uploadStatus: UploadStatus;
  verificationStatus: VerificationStatus;
  aiAnalysisStatus: AIAnalysisStatus;
  integrityStatus: IntegrityStatus;
  lastAccessed: string | null;
  aiProcessed: boolean;
  verified: boolean;
}

/**
 * A single version snapshot stored in the version history log.
 */
export interface VersionEntry {
  versionId: string;
  version: number;
  title: string;
  description: string;
  textContent: string;
  tags: string[];
  fileName: string;
  fileSize: number;
  snapshotDate: string;
  restoredFrom: string | null; // versionId this was restored from, if applicable
}

/**
 * The primary vault document record.
 * Every career-related document stored in CareerPilot lives here.
 */
export interface VaultDocument {
  id: string;
  ownerId: string;
  category: DocumentCategory;
  title: string;
  description: string;
  originalFileName: string;
  storagePath: string;          // Reserved for Firebase Storage path
  fileSize: number;             // in bytes
  fileType: string;             // e.g. 'pdf', 'docx', 'txt', 'png'
  textContent: string;          // Extracted or provided text content
  uploadDate: string;           // ISO timestamp
  lastModified: string;         // ISO timestamp
  version: number;              // Current version number (starts at 1)
  status: DocumentStatus;
  tags: string[];
  health: DocumentHealth;
}

/**
 * Search query parameters.
 */
export interface VaultSearchQuery {
  q?: string;           // Free text — matches title or tags
  category?: string;
  fileType?: string;
  sortBy?: 'date' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated search result wrapper.
 */
export interface VaultSearchResult {
  total: number;
  documents: VaultDocument[];
  query: VaultSearchQuery;
}
