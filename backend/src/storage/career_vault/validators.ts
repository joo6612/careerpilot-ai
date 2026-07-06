import { DocumentCategory, VaultSearchQuery } from './models';
import { isValidCategory } from './categories';

export interface UploadBody {
  category: DocumentCategory;
  title: string;
  description: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  textContent: string;
  tags: string[];
  storagePath?: string;
}

export interface PatchBody {
  title?: string;
  description?: string;
  tags?: string[];
  status?: 'active' | 'archived';
  textContent?: string;
}

/**
 * Validates required fields for a vault document upload.
 * Returns a normalized UploadBody.
 */
export function validateUploadBody(body: any): UploadBody {
  let category = String(body.category || '').trim();
  if (category === 'Other Documents') {
    category = 'Other';
  }
  const title = String(body.title || '').trim();
  const fileName = String(body.fileName || '').trim();
  const fileType = String(body.fileType || '').trim().toLowerCase();
  const textContent = String(body.textContent || '').trim();

  if (!category) {
    throw new Error('Document category is required.');
  }
  if (!isValidCategory(category)) {
    throw new Error(
      `Invalid document category '${category}'. Valid categories: Resume, Certificate, Project, Academic Document, Transcript, Offer Letter, Achievement, Portfolio File, Other.`
    );
  }
  if (!title) {
    throw new Error('Document title is required.');
  }
  if (!fileName) {
    throw new Error('Original file name is required.');
  }
  if (!fileType) {
    throw new Error('File type (extension) is required, e.g. pdf, txt, docx.');
  }

  const fileSize = Number(body.fileSize) || 0;
  const tags: string[] = Array.isArray(body.tags)
    ? body.tags.map((t: any) => String(t).trim()).filter(Boolean)
    : [];

  return {
    category: category as DocumentCategory,
    title,
    description: String(body.description || '').trim(),
    fileName,
    fileType,
    fileSize,
    textContent,
    tags,
    storagePath: String(body.storagePath || '').trim() || undefined
  };
}

/**
 * Validates a PATCH body for updating an existing document.
 * Only allows whitelisted mutable fields.
 */
export function validatePatchBody(body: any): PatchBody {
  const patch: PatchBody = {};

  if (body.title !== undefined) {
    patch.title = String(body.title).trim();
  }
  if (body.description !== undefined) {
    patch.description = String(body.description).trim();
  }
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      throw new Error('Tags must be an array of strings.');
    }
    patch.tags = body.tags.map((t: any) => String(t).trim()).filter(Boolean);
  }
  if (body.status !== undefined) {
    const s = String(body.status).trim();
    if (!['active', 'archived'].includes(s)) {
      throw new Error("Status must be either 'active' or 'archived'.");
    }
    patch.status = s as 'active' | 'archived';
  }
  if (body.textContent !== undefined) {
    patch.textContent = String(body.textContent).trim();
  }

  if (Object.keys(patch).length === 0) {
    throw new Error('No valid fields provided for update. Allowed: title, description, tags, status, textContent.');
  }

  return patch;
}

/**
 * Validates and normalizes search query parameters from req.query.
 */
export function validateSearchQuery(query: any): VaultSearchQuery {
  const result: VaultSearchQuery = {};

  if (query.q) result.q = String(query.q).trim();
  if (query.category) result.category = String(query.category).trim();
  if (query.fileType) result.fileType = String(query.fileType).trim().toLowerCase();

  const sortBy = String(query.sortBy || '').trim();
  if (sortBy === 'name' || sortBy === 'date') result.sortBy = sortBy;

  const sortOrder = String(query.sortOrder || '').trim();
  if (sortOrder === 'asc' || sortOrder === 'desc') result.sortOrder = sortOrder;

  return result;
}
