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
 * Intelligent AI / Heuristic classifier for Vault documents
 */
export function autoDetectCategory(fileName: string, title: string, textContent: string): DocumentCategory {
  const combined = `${fileName} ${title} ${textContent}`.toLowerCase();
  if (/resume|cv|curriculum\s*vitae|bio\s*data/.test(combined)) return 'Resume';
  if (/certif|completion|diploma|badge|award|coursera|udemy|edx|licensed/.test(combined)) return 'Certificate';
  if (/project|portfolio|github|case\s*study|codebase|repository/.test(combined)) return 'Project';
  if (/transcript|marksheet|semester|grade\s*card|gpa/.test(combined)) return 'Transcript';
  if (/degree|graduation|academic|bonafide|matriculation|university|college|school/.test(combined)) return 'Academic Document';
  if (/offer\s*letter|appointment|employment\s*contract|salary\s*slip|joining\s*letter/.test(combined)) return 'Offer Letter';
  if (/achievement|hackathon|trophy|honors|winner|placement/.test(combined)) return 'Achievement';
  return 'Other';
}

/**
 * Validates required fields for a vault document upload.
 * Returns a normalized UploadBody with auto-categorization fallback.
 */
export function validateUploadBody(body: any): UploadBody {
  let category = String(body.category || '').trim();
  const title = String(body.title || '').trim();
  const fileName = String(body.fileName || '').trim();
  const fileType = String(body.fileType || '').trim().toLowerCase();
  const textContent = String(body.textContent || '').trim();

  // Handle auto-categorization or folder alias mapping
  if (category === 'auto' || !category || category === 'Other' || category === 'Other Documents') {
    category = autoDetectCategory(fileName, title, textContent);
  }

  if (category === 'Certificates') category = 'Certificate';
  if (category === 'Projects') category = 'Project';
  if (category === 'Academic Documents') category = 'Academic Document';
  if (category === 'Offer Letters') category = 'Offer Letter';

  if (!isValidCategory(category)) {
    category = autoDetectCategory(fileName, title, textContent);
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
    storagePath: body.storagePath ? String(body.storagePath).trim() : undefined
  };
}

export function validatePatchBody(body: any): PatchBody {
  const patch: PatchBody = {};
  if (body.title !== undefined) patch.title = String(body.title).trim();
  if (body.description !== undefined) patch.description = String(body.description).trim();
  if (body.textContent !== undefined) patch.textContent = String(body.textContent).trim();
  if (body.status !== undefined) {
    if (body.status !== 'active' && body.status !== 'archived') {
      throw new Error(`Invalid status '${body.status}'. Valid values: active, archived.`);
    }
    patch.status = body.status;
  }
  if (body.tags !== undefined) {
    patch.tags = Array.isArray(body.tags)
      ? body.tags.map((t: any) => String(t).trim()).filter(Boolean)
      : [];
  }
  return patch;
}

export function validateSearchQuery(query: any): VaultSearchQuery {
  return {
    q: query.q || query.query ? String(query.q || query.query).trim() : undefined,
    category: query.category ? String(query.category).trim() : undefined,
    fileType: query.fileType ? String(query.fileType).trim() : undefined,
    sortBy: query.sortBy === 'name' ? 'name' : 'date',
    sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc'
  };
}
