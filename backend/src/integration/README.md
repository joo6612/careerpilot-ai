# System Integration & Orchestration Engine

This module connects all independent CareerPilot modules into a unified, event-driven ecosystem. Subsystems communicate exclusively through public service interfaces, publishing events to a central Event Bus. The `IntegrationOrchestrator` listens to these events and executes five system workflows asynchronously.

## Integration Architecture

```
+-----------------------------------------------------------------------------------+
|                                     EVENT BUS                                     |
+--+-------------------+----------------------+--------------------+----------------+
   |                   |                      |                    |
   | PROFILE_UPDATED   | ASSESSMENT_COMPLETED | RESUME_ANALYZED    | DOCUMENT_UPLOADED
   v                   v                      v                    v
+-----------------------------------------------------------------------------------+
|                              INTEGRATION ORCHESTRATOR                             |
|  - Concurrency locks (uid)                    - Change-detection cache            |
+--+-------------------+----------------------+--------------------+----------------+
   |                   |                      |                    |
   v (Workflow 1/5)    v (Workflow 2)         v (Workflow 3)       v (Workflow 4)
+-----------------------------------------------------------------------------------+
|                                WORKFLOW EXECUTORS                                 |
+-----------------------------------------------------------------------------------+
```

## System Workflows

### Workflow 1: Profile Completed
- **Trigger**: `PROFILE_UPDATED` (when profile holds no career changes)
- **Path**: Refresh Career Discovery suggestions -> Recalculate Readiness scores -> Regenerate learning roadmaps -> Publish `DASHBOARD_REFRESHED`

### Workflow 2: Assessment Completed
- **Trigger**: `ASSESSMENT_COMPLETED`
- **Path**: Recalculate Readiness scores (syncs verified skills) -> Regenerate roadmaps (unlocks milestones) -> Publish `DASHBOARD_REFRESHED`

### Workflow 3: Resume Uploaded
- **Trigger**: `RESUME_ANALYZED`
- **Path**: Sync parsed resume to Career Vault -> Recalculate Readiness scores (ATS updates) -> Publish `DASHBOARD_REFRESHED`

### Workflow 4: Certificate Uploaded
- **Trigger**: `DOCUMENT_UPLOADED` (with category = `Certificate`)
- **Path**: Sync certificate to profile certifications -> Recalculate Readiness -> Regenerate roadmap -> Publish `DASHBOARD_REFRESHED`

### Workflow 5: Career Changed
- **Trigger**: `PROFILE_UPDATED` (when target career path changes)
- **Path**: Rerun Discovery -> Update Resume ATS analysis against new track -> Recalculate Readiness -> Regenerate Roadmap -> Publish `DASHBOARD_REFRESHED`

## Event Catalog

- **`PROFILE_UPDATED`**: Fired when profile data is saved.
- **`ASSESSMENT_COMPLETED`**: Fired when an assessment session is successfully graded and submitted.
- **`RESUME_ANALYZED`**: Fired when a resume draft is analyzed against the target track.
- **`DOCUMENT_UPLOADED`**: Fired when any asset (certificate, project, transcript) is uploaded to the Career Vault.
- **`DASHBOARD_REFRESHED`**: Fired to trigger dashboard recalculation events.

## Performance Caching (Change Detection)

To avoid redundant module executions and heavy AI calls, the orchestrator keeps an input state cache:
- Keeps a hash of the user profile, resume timestamp, assessment completions count, and vault document count.
- Compares incoming trigger states against the cache.
- If no changes are detected, execution skips, avoiding redundant recalculations.
- Recalculations can be forced via the `POST /api/system/recalculate` endpoint with `force: true`.
