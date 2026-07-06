# Career Vault — Architecture Reference

Career Vault is the centralized secure document storage for CareerPilot AI.
Every career-related document must flow through `VaultService` — no module should manage document storage independently.

---

## 1. Folder Tree

```
src/storage/career_vault/
├── README.md           ← This file
├── models.ts           ← VaultDocument, DocumentHealth, VersionEntry, search interfaces
├── categories.ts       ← DOCUMENT_CATEGORIES registry + isValidCategory guard
├── metadata.ts         ← Health builders: buildInitialHealth, markAIProcessed, markVerified, updateLastAccessed
├── versioning.ts       ← createVersionSnapshot, restoreFromSnapshot, buildRestoreMarker
├── search.ts           ← searchDocuments filter + sort engine
├── exceptions.ts       ← VaultDocumentNotFoundError, UnauthorizedVaultAccessError, VaultVersionNotFoundError
├── validators.ts       ← validateUploadBody, validatePatchBody, validateSearchQuery
├── repository.ts       ← VaultRepository interface + LocalVaultRepository (in-memory)
├── service.ts          ← VaultService orchestration layer (only approved consumer entrypoint)
├── router.ts           ← Express route controllers
└── dependencies.ts     ← Dependency injection wiring
```

---

## 2. Career Vault Architecture

```
Client Request
    ↓
Express Router (router.ts)
    ↓
VaultService (service.ts)  ← Only approved interface for other modules
    ├── validators.ts       — Input validation
    ├── metadata.ts         — Health state management
    ├── versioning.ts       — Snapshot / restore logic
    ├── search.ts           — Filter + sort engine
    └── VaultRepository     — Storage abstraction
            ↓
    LocalVaultRepository    — In-memory store (dev)
            ↓
    [Future] FirebaseVaultRepository — Firebase Storage + Firestore (prod)
```

---

## 3. Document Lifecycle

```
Upload (POST /vault/upload)
  → validateUploadBody
  → buildInitialHealth (status: pending/unverified/pending AI)
  → Save document (version 1)
  → Save initial version snapshot in history
  → Return VaultDocument

Read (GET /vault/:id)
  → Validate ownership
  → updateLastAccessed
  → Return VaultDocument

Update (PATCH /vault/:id)
  → validatePatchBody
  → Snapshot current state into version history
  → Apply patch fields
  → Increment version counter
  → Return updated VaultDocument

Delete (DELETE /vault/:id)
  → Validate ownership
  → Hard-delete from repository

Restore (POST /vault/history/:id/restore)
  → Validate ownership
  → Snapshot current state (pre-restore)
  → Apply version snapshot content
  → Append restore marker to history log
  → Return restored VaultDocument
```

---

## 4. Metadata Structure

Every `VaultDocument` carries a `health` field of type `DocumentHealth`:

| Field                | Type                                          | Description                              |
|----------------------|-----------------------------------------------|------------------------------------------|
| `uploadStatus`       | `'uploading' \| 'complete' \| 'failed'`        | Upload pipeline state                    |
| `verificationStatus` | `'unverified' \| 'pending' \| 'verified' \| 'rejected'` | External verification state   |
| `aiAnalysisStatus`   | `'pending' \| 'processing' \| 'completed' \| 'failed' \| 'skipped'` | AI processing state |
| `integrityStatus`    | `'ok' \| 'corrupted' \| 'missing'`             | Storage integrity check result           |
| `lastAccessed`       | `string \| null`                               | ISO timestamp of last GET request        |
| `aiProcessed`        | `boolean`                                     | True after AI analysis completes         |
| `verified`           | `boolean`                                     | True after external verification         |

---

## 5. Versioning Strategy

- Every upload creates **version 1** with an initial snapshot in the history log.
- Every `PATCH` operation **snapshots the current state before applying changes** and increments the version counter.
- Every `restore` operation:
  1. Snapshots current state (pre-restore) into history.
  2. Applies the target snapshot content fields (title, description, textContent, tags, fileName, fileSize).
  3. Increments the version counter.
  4. Appends a restore-marker entry recording which `versionId` was restored.
- `health` metadata is **never restored** — it always reflects the live document state.

---

## 6. Search Strategy

`GET /vault/search` supports:

| Parameter    | Description                                      |
|--------------|--------------------------------------------------|
| `q`          | Free text — matches title, description, and tags |
| `category`   | Exact `DocumentCategory` match                   |
| `fileType`   | Exact file extension match (e.g. `pdf`)          |
| `sortBy`     | `date` (default) or `name`                       |
| `sortOrder`  | `asc` or `desc` (default: `desc` for date)       |

---

## 7. API Endpoints (Mounted at `/api/vault`)

| Method   | Path                            | Description                                    |
|----------|---------------------------------|------------------------------------------------|
| `POST`   | `/vault/upload`                 | Upload a new career document                   |
| `GET`    | `/vault`                        | List all active vault documents                |
| `GET`    | `/vault/search`                 | Search with filters and sorting                |
| `GET`    | `/vault/categories`             | List all supported document categories         |
| `GET`    | `/vault/category/:name`         | Filter documents by category                   |
| `GET`    | `/vault/history/:id`            | Get version history for a document             |
| `POST`   | `/vault/history/:id/restore`    | Restore a previous version                     |
| `GET`    | `/vault/:id`                    | Get a single document by ID                    |
| `PATCH`  | `/vault/:id`                    | Update mutable fields (snapshots previous)     |
| `DELETE` | `/vault/:id`                    | Permanently delete a document                  |

> **Route ordering**: All static paths (`/upload`, `/search`, `/categories`, `/category/:name`, `/history/:id`) are registered **before** `/:id` to prevent Express collision.

---

## 8. Future Firebase Storage Integration

Replace `LocalVaultRepository` with `FirebaseVaultRepository`:

```typescript
// Future implementation sketch
export class FirebaseVaultRepository implements VaultRepository {
  async save(doc: VaultDocument): Promise<void> {
    // await firestore.collection('vault').doc(doc.id).set(doc);
  }
  async getById(id: string): Promise<VaultDocument | null> {
    // const snap = await firestore.collection('vault').doc(id).get();
    // return snap.exists ? snap.data() as VaultDocument : null;
  }
  // ...
}
```

Binary file uploads: When a real file is uploaded via `multipart/form-data`:
1. Stream the binary to **Firebase Storage** at `storagePath`.
2. Store the download URL in `doc.storagePath`.
3. Save document metadata (excluding binary content) in Firestore.

The `storagePath` field on `VaultDocument` is already reserved for this.

---

## 9. Future AI Integration Strategy

Future AI modules consume documents **only through `VaultService`**, never directly from the repository:

```typescript
// Pattern for AI module consumption:
const docs = await vaultService.getByCategory(uid, 'Resume');
const latestResume = docs[0];
const analysis = await AIService.analyzeResume(latestResume.textContent, ...);
```

The `health.aiAnalysisStatus` and `health.aiProcessed` fields track AI processing state.
Use `markAIProcessed(doc)` from `metadata.ts` after AI analysis completes.

---

## 10. Backward Compatibility

| Module          | Change | Notes |
|-----------------|--------|-------|
| `resume/`       | ❌ None | Resume module unchanged. Future integration: resume versions saved into vault via `vaultService.uploadDocument` after analysis. |
| `readiness/`    | ❌ None | No changes. |
| `roadmap/`      | ❌ None | No changes. |
| `assessment/`   | ❌ None | No changes. |
| `career/`       | ❌ None | No changes. |
| `discovery/`    | ❌ None | No changes. |
| `ai/`           | ❌ None | No changes. |
| `types/`        | ❌ None | No changes. |
| `services/db.ts`| ❌ None | Vault uses its own repository; no DbService dependency. |
| `routes.ts`     | ✅ +3 lines | Added `import` + `router.use('/vault', vaultRouter)` only. |
