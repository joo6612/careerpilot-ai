# Skill Assessment & Verification Foundation

This module implements a structured, multi-tier engine to test candidate technical competencies.

---

## 📁 1. Directory Tree
```
src/assessment/
├── README.md                  # Documentation reference (this file)
├── models.ts                  # Interfaces for Questions, Sessions, and Attempts
├── difficulty.ts              # Difficulty mappings and rules
├── question_bank.ts           # Preconfigured bank of sample questions
├── scoring.ts                 # Scoring algorithm (percentage, multipliers, levels)
├── repository.ts              # Decoupled Repository interface and memory database
├── service.ts                 # Assessment orchestrator services
├── validators.ts              # Query and parameter validators
├── exceptions.ts              # Custom exceptions (e.g. SessionNotFoundError)
├── dependencies.ts            # Dependency Injector wiring configurations
└── router.ts                  # Express route controllers
```

---

## 🏗️ 2. Assessment Architecture Flow
The engine uses standard service boundaries:
```
User Selection & Self-Rating (1-5 Stars)
  ↓
Difficulty Mapping (1-2: Beginner, 3-4: Intermediate, 5: Advanced)
  ↓
Question bank filtration (selects exactly 3 questions matching criteria tags)
  ↓
Caches temporary AssessmentSession in memory (no answers exposed to client)
  ↓
Grading & Scoring calculation (compares user response to target values)
  ↓
Verified SkillScore saved to user attempt log
```

---

## 📊 3. Scoring Strategy
Grading computes the following metrics upon answer submissions:
- **Correct Answers**: Matches clean lowercase trimmed answers.
- **Percentage**: `(correctAnswers / totalQuestions) * 100`.
- **Difficulty Multiplier**: beginner: `1.0`, Intermediate: `1.2`, Advanced: `1.5`.
- **Verified Score**: `Math.round(percentage * difficultyMultiplier)` (capped at 100).
- **Skill Level Progression**:
  - Tested Intermediate but scored `<70%` &rarr; demoted to verified `Beginner` level.
  - Tested Advanced but scored `<75%` &rarr; demoted to verified `Intermediate` (or `Beginner` if `<40%`).
- **Confidence Rating**:
  - `>=80%` correct &rarr; `High`.
  - `>=50%` correct &rarr; `Medium`.
  - `<50%` correct &rarr; `Low`.

---

## 📝 4. Question Bank Structure
The catalog (`question_bank.ts`) implements MCQ, Code Output, Code Completion, and Real-world Scenario types.

Each question conforms to the following schema:
- **`id`**: Unique token (e.g. `"py-beg-1"`).
- **`skill`**: Associated programming context.
- **`difficulty`**: `Beginner` | `Intermediate` | `Advanced`.
- **`type`**: `MCQ` | `Code Output` | `Code Completion` | `Real-world Scenario`.
- **`question`**: Description/Code snippet text.
- **`options`**: Selection array (MCQ only).
- **`answer`**: Accurate answer value.
- **`explanation`**: Post-grading feedback explanations.
- **`tags`**: Keyword labels (e.g., `'Basic Concept'`, `'Simple Coding'`).

---

## 🔌 5. API Signature Directory
Mounted under Express path `/api/assessment`:
- **`GET /skills`**: Lists all skills with active assessments.
- **`POST /start`**: Body: `{ skill: string, selfRating: number }`. Initializes and returns a new session.
- **`POST /submit`**: Body: `{ sessionId: string, answers: { [qid]: value } }`. Grades response and logs results.
- **`GET /history`**: Returns all past attempt records for the authenticated user.
- **`GET /result/:id`**: Resolves past attempt results details.

---

## 🤖 6. Future AI Integration Strategy
This foundation layer can easily adapt to dynamic, AI-generated questions:
1. **Dynamic Prompt generation**: `AIService` can compile a prompt using `AssessmentPrompts` requesting 3 questions for a target skill and difficulty.
2. **Integration Integration**: In `AssessmentService.startAssessmentSession()`, instead of querying the static `QUESTION_BANK`, invoke `AIService.generateQuestions(skill, difficulty)` to fetch questions from Gemini.
3. **Evaluation Assistance**: For open-ended coding questions, submit answers to `AIService.evaluateOpenEndedAnswer(question, userAnswer)` for semantic grading.
