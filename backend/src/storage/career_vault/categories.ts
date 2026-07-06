import { DocumentCategory } from './models';

export interface CategoryMeta {
  id: DocumentCategory;
  label: string;
  description: string;
  iconHint: string;
  acceptedTypes: string[]; // file extensions without dot
}

/**
 * Centralized registry of all supported document categories in Career Vault.
 * Future Firebase Storage bucket rules can use these categories for folder routing.
 */
export const DOCUMENT_CATEGORIES: CategoryMeta[] = [
  {
    id: 'Resume',
    label: 'Resume',
    description: 'Professional resume and CV documents.',
    iconHint: 'document-text',
    acceptedTypes: ['pdf', 'docx', 'doc', 'txt']
  },
  {
    id: 'Certificate',
    label: 'Certificate',
    description: 'Course completion and professional certification documents.',
    iconHint: 'badge-check',
    acceptedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'webp']
  },
  {
    id: 'Project',
    label: 'Project',
    description: 'Project write-ups, case studies, and portfolio evidence.',
    iconHint: 'code-bracket',
    acceptedTypes: ['pdf', 'docx', 'txt', 'md', 'zip']
  },
  {
    id: 'Academic Document',
    label: 'Academic Document',
    description: 'Degrees, diplomas, and academic achievement records.',
    iconHint: 'academic-cap',
    acceptedTypes: ['pdf', 'jpg', 'jpeg', 'png']
  },
  {
    id: 'Transcript',
    label: 'Transcript',
    description: 'Official academic transcripts and grade records.',
    iconHint: 'clipboard-list',
    acceptedTypes: ['pdf', 'jpg', 'jpeg', 'png']
  },
  {
    id: 'Offer Letter',
    label: 'Offer Letter',
    description: 'Job offer letters and employment contracts.',
    iconHint: 'envelope-open',
    acceptedTypes: ['pdf', 'docx', 'jpg', 'jpeg', 'png']
  },
  {
    id: 'Achievement',
    label: 'Achievement',
    description: 'Awards, recognitions, and hackathon placements.',
    iconHint: 'trophy',
    acceptedTypes: ['pdf', 'jpg', 'jpeg', 'png']
  },
  {
    id: 'Portfolio File',
    label: 'Portfolio File',
    description: 'Design files, demo recordings, and portfolio assets.',
    iconHint: 'photo',
    acceptedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'mp4', 'zip', 'figma']
  },
  {
    id: 'Other',
    label: 'Other',
    description: 'Any other career-relevant documents.',
    iconHint: 'folder',
    acceptedTypes: ['pdf', 'docx', 'txt', 'jpg', 'png', 'zip']
  }
];

/**
 * Returns the CategoryMeta for a given category id, or null if not found.
 */
export function getCategoryMeta(id: string): CategoryMeta | null {
  return DOCUMENT_CATEGORIES.find(c => c.id === id) || null;
}

/**
 * Type guard — returns true only for valid DocumentCategory values.
 */
export function isValidCategory(value: string): value is DocumentCategory {
  return DOCUMENT_CATEGORIES.some(c => c.id === value);
}

export default DOCUMENT_CATEGORIES;
