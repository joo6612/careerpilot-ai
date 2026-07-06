# AI Mentor Engine — Architecture Reference

The AI Mentor is CareerPilot's long-term career companion. Every response is powered by the AI Foundation Layer and grounded in the user's complete career context.

---

## 1. Folder Tree

```
src/mentor/
├── README.md           ← This file
├── models.ts           ← MentorMessage, Conversation, MentorPersonaId, MentorRecommendation, MentorResponse
├── personas.ts         ← 5 persona definitions: career-mentor, resume-mentor, interview-coach, learning-coach, roadmap-planner
├── memory.ts           ← Context window trimming, history formatting, conversation summarization
├── conversation.ts     ← createConversation, appendMessage, getOrCreateActiveConversation
├── recommendations.ts  ← buildRecommendation: reason, confidence, action, resources, next question
├── exceptions.ts       ← ConversationNotFoundError (404), UnauthorizedConversationAccessError (403)
├── validators.ts       ← validateChatBody, validatePersonaBody
├── repository.ts       ← MentorRepository interface + LocalMentorRepository (in-memory)
├── service.ts          ← MentorService — orchestration + context enrichment
├── router.ts           ← 6 Express route controllers
└── dependencies.ts     ← Dependency injection wiring
```

---

## 2. Mentor Architecture

```
Client Request
    ↓
Express Router (router.ts)
    ↓
MentorService (service.ts)         ← Only approved consumer interface
    ├── personas.ts                 — Persona system prompt injection
    ├── memory.ts                   — History trimming + context window
    ├── conversation.ts             — Session lifecycle management
    ├── recommendations.ts          — Structured recommendation derivation
    ├── compileAIContext()          — From ai/context/builder.ts (unchanged)
    │   └── + readiness enrichment  — ReadinessService.getLatestReport()
    │   └── + vault enrichment      — VaultService.getDocuments()
    ├── AIService.generateMentorReply() ← AI Foundation Layer ONLY
    └── MentorRepository            — Conversation storage abstraction
            ↓
    LocalMentorRepository           — In-memory (dev)
            ↓
    [Future] FirestoreMentorRepository — Persistent (prod)
```

---

## 3. Conversation Flow

```
POST /mentor/chat
  1. Load profile from DbService
  2. Load assessments, career, roadmap, vault, readiness (all non-throwing)
  3. compileAIContext() → base context string
  4. Inject persona system prompt prefix → enriched context
  5. Append readiness report + vault doc list to context
  6. Get or create conversation (by conversationId or active session)
  7. Build history text with memory trimming (max 10 messages)
  8. Append user message to conversation
  9. AIService.generateMentorReply(enrichedProfile, messages, text)
 10. Append mentor reply message
 11. Auto-update conversation summary if 10+ messages
 12. Persist conversation in repository
 13. Persist legacy DbService.saveUserChat() for backward compat
 14. Build MentorRecommendation from reply
 15. Return MentorResponse: { chat, reply, replyText, recommendation, conversationId, personaId }
```

---

## 4. Memory Strategy

| Scenario | Strategy |
|---|---|
| Short sessions (< 10 msgs) | Full history passed to AI context |
| Long sessions (≥ 10 msgs) | Last 10 messages trimmed + 3-line summary prepended |
| New session continuation | Summary seeded from previous session messages |
| Cross-persona sessions | Each persona maintains its own conversation thread |

---

## 5. Persona Design

| ID | Name | Focus | Welcome Message |
|---|---|---|---|
| `career-mentor` | Career Mentor | Strategic guidance, goal alignment, industry insight | "Hello! I'm your AI Career Mentor..." |
| `resume-mentor` | Resume Mentor | ATS optimization, keyword gaps, formatting | "Hi! I'm your Resume Mentor..." |
| `interview-coach` | Interview Coach | STAR method, technical prep, mock questions | "Let's get you interview-ready!..." |
| `learning-coach` | Learning Coach | Courses, study plans, resource recommendations | "Hi! I'm your Learning Coach..." |
| `roadmap-planner` | Roadmap Planner | Milestone prioritization, progress, scheduling | "Hello! I'm your Roadmap Planner..." |

Each persona injects a role-specific system prompt prefix into the AI context — shaping reply tone, focus area, and recommendation style.

---

## 6. AI Request Flow

```
MentorService.chat()
    ↓
enrichedContext = personaSystemPromptPrefix
               + compileAIContext(profile, career, assessments, roadmapItems).compiledText
               + readiness report block
               + vault document block
    ↓
enrichedProfile = { ...profile, aboutMe: enrichedContext + originalAboutMe }
    ↓
AIService.generateMentorReply(enrichedProfile, historyMessages, userText)
    ↓ (internally)
  → MENTOR_CHAT_PROMPT(compiledContext, historyText, userMessage)
  → provider.generateText(prompt, SYSTEM_PROMPT)
    ↓
replyText → buildRecommendation(replyText, personaId) → MentorRecommendation
```

**Rule**: No module ever calls Gemini directly. All AI calls route through `AIService`.

---

## 7. API Endpoints (Mounted at `/api/mentor`)

| Method | Path | Description | Legacy Compatible |
|---|---|---|---|
| `POST` | `/mentor/chat` | Send a message; returns reply + recommendation | ✅ `{ chat, reply }` shape preserved |
| `GET` | `/mentor/chat` | Get latest conversation messages | ✅ Returns `MentorMessage[]` |
| `GET` | `/mentor/history` | List all conversations with summaries | ➕ New |
| `GET` | `/mentor/personas` | List all 5 persona definitions | ➕ New |
| `POST` | `/mentor/persona` | Start a new conversation with a persona | ➕ New |
| `GET` | `/mentor/conversation/:id` | Get full conversation by ID | ➕ New |
| `DELETE` | `/mentor/conversation/:id` | Delete a conversation | ➕ New |

---

## 8. Future Dashboard Integration

The `MentorRecommendation` object returned on every `POST /mentor/chat` is designed for dashboard widget integration:

```typescript
{
  reason: string;              // Display in "Why this recommendation?" tooltip
  confidence: 'Low'|'Medium'|'High'; // Progress bar / badge
  recommendedAction: string;   // Primary CTA button text
  relatedResources: string[];  // Quick-link chips
  nextSuggestedQuestion: string; // "Ask your mentor" pre-fill chip
}
```

Dashboard can render these as an "AI Mentor Insights" widget alongside the chat panel.

---

## 9. Future Voice Assistant Integration

The mentor conversation flow is voice-assistant-ready:

- `POST /mentor/chat` accepts plain `text` — wire any STT output directly.
- `replyText` (string) in the response feeds directly into a TTS engine.
- `personaId` allows voice to switch personas: "Switch to Interview Coach."
- `conversationId` enables session resumption across voice invocations.
- `nextSuggestedQuestion` can be spoken as a follow-up prompt.

---

## 10. Backward Compatibility

| Module / File | Change | Notes |
|---|---|---|
| `career/` | ❌ None | Only consumed via `careerRepository` |
| `resume/` | ❌ None | No changes |
| `readiness/` | ❌ None | Only `readinessService.getLatestReport()` called |
| `roadmap/` | ❌ None | Only `roadmapService.getActiveRoadmap()` called |
| `assessment/` | ❌ None | Only `assessmentService.getAttemptsHistory()` called |
| `storage/career_vault/` | ❌ None | Only `vaultService.getDocuments()` called |
| `ai/` | ❌ None | `AIService.generateMentorReply()` called as-is |
| `services/db.ts` | ❌ None | `DbService.saveUserChat()` still called for legacy compat |
| `types/` | ❌ None | No changes |
| `routes.ts` | ✅ +1 import, -73 lines, +2 lines | Replaced inline handlers with `router.use('/mentor', mentorRouter)` |
| `GET /mentor/chat` response shape | ✅ Identical | Returns `MentorMessage[]` (same as legacy `ChatMessage[]`) |
| `POST /mentor/chat` response shape | ✅ Superset | Returns `{ chat, reply, replyText, recommendation, conversationId, personaId }` — legacy `{ chat, reply }` fields present |
