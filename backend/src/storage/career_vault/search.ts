import { VaultDocument, VaultSearchQuery, VaultSearchResult } from './models';

/**
 * Filters and sorts a list of VaultDocuments based on the provided search query.
 *
 * Supported filters:
 *   - q         : free text match against title and tags (case-insensitive)
 *   - category  : exact DocumentCategory match
 *   - fileType  : exact file extension match (e.g. 'pdf')
 *
 * Supported sorts:
 *   - sortBy    : 'date' (uploadDate) | 'name' (title)
 *   - sortOrder : 'asc' | 'desc' (default: 'desc' for date, 'asc' for name)
 */
export function searchDocuments(
  docs: VaultDocument[],
  query: VaultSearchQuery
): VaultSearchResult {
  let results = docs.filter(d => d.status === 'active');

  // --- Filter: free text ---
  if (query.q && query.q.trim()) {
    const q = query.q.toLowerCase().trim();
    results = results.filter(
      d =>
        d.title.toLowerCase().includes(q) ||
        d.tags.some(tag => tag.toLowerCase().includes(q)) ||
        d.description.toLowerCase().includes(q)
    );
  }

  // --- Filter: category ---
  if (query.category && query.category.trim()) {
    const cat = query.category.trim();
    results = results.filter(d => d.category === cat);
  }

  // --- Filter: fileType ---
  if (query.fileType && query.fileType.trim()) {
    const ft = query.fileType.toLowerCase().trim();
    results = results.filter(d => d.fileType.toLowerCase() === ft);
  }

  // --- Sort ---
  const sortBy = query.sortBy || 'date';
  const sortOrder = query.sortOrder || (sortBy === 'date' ? 'desc' : 'asc');

  results.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'date') {
      cmp = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
    } else {
      cmp = a.title.localeCompare(b.title);
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  return {
    total: results.length,
    documents: results,
    query
  };
}
