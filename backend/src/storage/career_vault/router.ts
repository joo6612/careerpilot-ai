import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { VaultService } from './service';
import { validateUploadBody, validatePatchBody, validateSearchQuery } from './validators';
import {
  VaultDocumentNotFoundError,
  UnauthorizedVaultAccessError,
  VaultVersionNotFoundError
} from './exceptions';
import { DOCUMENT_CATEGORIES } from './categories';
import { EventBus } from '../../integration/event_bus';
import { EventCatalog } from '../../integration/event_catalog';

export function createVaultRouter(service: VaultService): Router {
  const router = Router();

  // ============================================================
  // IMPORTANT: Static routes MUST be registered before /:id
  // to prevent Express path collision.
  // ============================================================

  /**
   * POST /api/vault/upload
   * Uploads a new career document into the vault.
   * Body: { category, title, description, fileName, fileType, fileSize, textContent, tags?, storagePath? }
   */
  router.post('/upload', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const body = validateUploadBody(req.body);
      const doc = await service.uploadDocument(uid, body);
      
      // Trigger integration workflow asynchronously
      EventBus.publish(EventCatalog.DOCUMENT_UPLOADED, { uid, document: doc });
      
      return res.status(201).json({
        success: true,
        document: doc,
        message: `Document '${doc.title}' uploaded to Career Vault successfully.`
      });
    } catch (error: any) {
      console.error('POST /vault/upload error:', error);
      return res.status(400).json({ error: error.message || 'Failed to upload document' });
    }
  });

  /**
   * GET /api/vault/search
   * Searches the user's vault.
   * Query params: q, category, fileType, sortBy (date|name), sortOrder (asc|desc)
   */
  router.get('/search', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const query = validateSearchQuery(req.query);
      const result = await service.searchDocuments(uid, query);
      return res.json(result);
    } catch (error: any) {
      console.error('GET /vault/search error:', error);
      return res.status(400).json({ error: error.message || 'Search failed' });
    }
  });

  /**
   * GET /api/vault/categories
   * Returns the list of all supported document categories.
   */
  router.get('/categories', async (_req: AuthenticatedRequest, res: Response) => {
    return res.json(DOCUMENT_CATEGORIES);
  });

  /**
   * GET /api/vault/category/:name
   * Returns all documents in a specific category for the authenticated user.
   */
  router.get('/category/:name', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const category = decodeURIComponent(req.params.name);
      const docs = await service.getByCategory(uid, category);
      return res.json({ category, total: docs.length, documents: docs });
    } catch (error: any) {
      console.error('GET /vault/category/:name error:', error);
      return res.status(400).json({ error: error.message || 'Failed to retrieve category documents' });
    }
  });

  /**
   * GET /api/vault/history/:id
   * Returns the full version history for a specific document.
   */
  router.get('/history/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { id } = req.params;
      const history = await service.getVersionHistory(uid, id);
      return res.json({ documentId: id, total: history.length, history });
    } catch (error: any) {
      if (error instanceof VaultDocumentNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      if (error instanceof UnauthorizedVaultAccessError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('GET /vault/history/:id error:', error);
      return res.status(500).json({ error: 'Failed to retrieve version history' });
    }
  });

  /**
   * POST /api/vault/history/:id/restore
   * Restores a specific version snapshot. Body: { versionId }
   */
  router.post('/history/:id/restore', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { id } = req.params;
      const versionId = String(req.body.versionId || '').trim();
      if (!versionId) {
        return res.status(400).json({ error: 'versionId is required in request body.' });
      }
      const restored = await service.restoreVersion(uid, id, versionId);
      return res.json({
        success: true,
        document: restored,
        message: `Document restored to version snapshot '${versionId}'.`
      });
    } catch (error: any) {
      if (
        error instanceof VaultDocumentNotFoundError ||
        error instanceof VaultVersionNotFoundError
      ) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      if (error instanceof UnauthorizedVaultAccessError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('POST /vault/history/:id/restore error:', error);
      return res.status(500).json({ error: 'Failed to restore version' });
    }
  });

  /**
   * GET /api/vault
   * Returns all active vault documents for the authenticated user.
   */
  router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const docs = await service.getDocuments(uid);
      return res.json({ total: docs.length, documents: docs });
    } catch (error: any) {
      console.error('GET /vault error:', error);
      return res.status(500).json({ error: 'Failed to retrieve vault documents' });
    }
  });

  /**
   * GET /api/vault/:id
   * Returns a single document by ID. Validates ownership.
   */
  router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { id } = req.params;
      const doc = await service.getDocumentById(uid, id);
      return res.json(doc);
    } catch (error: any) {
      if (error instanceof VaultDocumentNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      if (error instanceof UnauthorizedVaultAccessError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('GET /vault/:id error:', error);
      return res.status(500).json({ error: 'Failed to retrieve document' });
    }
  });

  /**
   * PATCH /api/vault/:id
   * Updates mutable fields of a document. Snapshots previous state in version history.
   * Body: { title?, description?, tags?, status?, textContent? }
   */
  router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { id } = req.params;
      const patch = validatePatchBody(req.body);
      const updated = await service.updateDocument(uid, id, patch);
      return res.json({
        success: true,
        document: updated,
        message: `Document updated to version ${updated.version}.`
      });
    } catch (error: any) {
      if (error instanceof VaultDocumentNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      if (error instanceof UnauthorizedVaultAccessError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('PATCH /vault/:id error:', error);
      return res.status(400).json({ error: error.message || 'Failed to update document' });
    }
  });

  /**
   * DELETE /api/vault/:id
   * Permanently removes a document from the vault. Validates ownership.
   */
  router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const { id } = req.params;
      await service.deleteDocument(uid, id);
      return res.json({
        success: true,
        message: `Document '${id}' has been permanently deleted from Career Vault.`
      });
    } catch (error: any) {
      if (error instanceof VaultDocumentNotFoundError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      if (error instanceof UnauthorizedVaultAccessError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('DELETE /vault/:id error:', error);
      return res.status(500).json({ error: 'Failed to delete document' });
    }
  });

  return router;
}

export default createVaultRouter;
