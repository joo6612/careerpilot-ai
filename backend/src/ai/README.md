# AI Foundation Layer

This module implements the unified, provider-agnostic, and context-aware intelligence core of CareerPilot.

---

## 📁 1. Directory Tree
```
src/ai/
├── context/
│   ├── builder.ts             # Orchestrates and aggregates sub-contexts
│   ├── user_context.ts        # Parses and sanitizes bio-profile
│   ├── career_context.ts      # Integrates details from the Career catalog
│   ├── assessment_context.ts  # Compiles verified skill credentials
│   └── resume_context.ts      # Formats resume ATS scoring details
├── prompt_library/
│   ├── system.ts              # Core system instructions
│   ├── career.ts              # Career suggestion templates
│   ├── resume.ts              # ATS analysis templates
│   ├── roadmap.ts             # Roadmap milestone templates
│   ├── mentor.ts              # Mentor chat templates
│   └── assessment.ts          # Technical grading templates
├── providers/
│   ├── base.ts                # AIProvider interface definition
│   ├── gemini.ts              # Gemini SDK provider implementation
│   └── mock.ts                # Mock simulation fallback provider
├── services/
│   ├── ai_service.ts          # Main orchestrator coordination service
│   ├── response_formatter.ts  # Builds standard outputs
│   └── validators.ts          # Audits input prerequisites (missing bio, career, etc.)
├── models/
│   ├── request.ts             # Strongly-typed input requests
│   ├── response.ts            # StandardAIResponse structure
│   └── confidence.ts          # Confidence engine specifications
├── README.md                  # Documentation reference (this file)
└── exceptions.ts              # Custom error classes (AIError, ContextError, etc.)
```

---

## 🏗️ 2. AI Architecture Pattern
The design follows a strict dependency injection flow that keeps the business logic completely decoupled from specific AI models:

```
Routing Controllers / Client Modules
  ↓
AIService (Main Orchestrator Coordination Service)
  ↓
AIProvider (Decoupled base interface)
  ↓
[GeminiProvider]  or  [MockProvider] (or Future OpenAI / Claude Providers)
```

---

## 🏗️ 3. Context Builder Design
Raw database structures are never sent directly to prompt context. Instead, they are parsed and compiled into formatted parameters using decoupled context-builders:
1. **`user_context.ts`**: Formats biography, education level, and self-rated skills.
2. **`career_context.ts`**: Integrates matching target career catalog profile details.
3. **`assessment_context.ts`**: Extracts best verified skill scores.
4. **`resume_context.ts`**: Formats uploaded text and ATS summaries.
5. **`builder.ts`**: Combines these sub-contexts and formats them as a cohesive block.

---

## 📝 4. Prompt Library Structure
All prompt templates are decoupled from the code and placed in `prompt_library/`:
* **`system.ts`**: Implements `SYSTEM_PROMPT` configuring professional boundaries and prohibiting hallucinations.
* **`career.ts`**: Suggestions and required career skills.
* **`resume.ts`**: ATS score checks.
* **`roadmap.ts`**: 4-stage milestone generation.
* **`mentor.ts`**: Conversational mentor contexts.
* **`assessment.ts`**: Technical answers grading.

---

## 🔌 5. Provider Pattern Explanation
LLM execution is abstracted using the `AIProvider` interface:

```typescript
export interface AIProvider {
  name: string;
  generateText(promptText: string, systemInstruction?: string, jsonMode?: boolean): Promise<string>;
}
```

* **`GeminiProvider`**: Coordinates Google Generative AI API connections.
* **`MockProvider`**: Used in local test configurations, matching prompt keywords to return mock data.
* **OpenAI / Claude Integration**: Swapping models only requires writing a class implementing `AIProvider` and initializing it inside `AIService`.

---

## 🔄 6. AI Request Flow
```
Controller Route Triggered
  ↓
Retrieve profile, career details, and assessment history from repositories
  ↓
AIValidators audits completeness (Throws ContextError on critical missing fields)
  ↓
compileAIContext resolves context aggregates
  ↓
Prompt library builds prompts
  ↓
AIService hands execution to current active AIProvider (Gemini/Mock)
```

---

## 🔄 7. AI Response Flow
```
AIProvider returns raw text string
  ↓
AIService parses JSON strings (Handles ResponseParseError on invalid outputs)
  ↓
ConfidenceEngine calculates confidence ('Low' | 'Medium' | 'High') based on profile details
  ↓
AIResponseFormatter compiles StandardAIResponse payload with data, warnings, execution time, and recommendations
  ↓
Controller returns 200 OK standard response payload to candidate frontend client
```
