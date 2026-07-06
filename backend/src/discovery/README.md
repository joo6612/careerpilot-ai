# Career Discovery Engine

This module implements a weighted multi-criteria matching engine to recommend the top 5 career paths based on user profiles.

---

## 📁 1. Directory Tree
```
src/discovery/
├── README.md                  # Documentation reference (this file)
├── models.ts                  # Typings for Recommendations, Scores, Comparisons
├── matching.ts                # Match score calculator (skills, education, style)
├── ranking.ts                 # Catalog ranker resolving top 5 profiles
├── insights.ts                # Actionable feedback logs (risks, suggestions)
├── repository.ts              # Decoupled Repository interface and memory cache
├── service.ts                 # Career Discovery orchestrations
├── validators.ts              # Query and parameter validators
├── exceptions.ts              # Custom exceptions (e.g. ResultNotFoundError)
├── dependencies.ts            # Dependency Injector wiring configurations
└── router.ts                  # Express route controllers
```

---

## 🏗️ 2. Discovery Architecture Flow
The matching process coordinates details from multiple services:
```
User profile, education, interests, preferences, and assessments retrieved
  ↓
matching.ts scores each catalog career using a weighted multi-criteria formula
  ↓
ranking.ts sorts scores and extracts top 5 recommended careers (resolves missing skills and timelines)
  ↓
insights.ts calls AIService to generate strengths, weaknesses, gaps, and plans
  ↓
Caches DiscoveryHistoryItem in LocalDiscoveryRepository
```

---

## 📊 3. Weighted Matching Algorithm
Match scores are calculated using the following weights:
- **Skill Match (30%)**: Matches user self-rated skills (+7 pts) and verified assessments with score >=70% (+10 pts) against catalog requirements.
- **Education Match (20%)**: Keyword searches User degree text (CS, Software, Eng) against career entry requirements.
- **Interest Match (20%)**: Keyword matching on biography interest arrays against career tags.
- **Experience Match (15%)**: Maps user current status (Student, Graduate, Working Professional) and years of experience to career difficulty level.
- **Work Preference Match (15%)**: Matches preferred style ('Remote') against career remote availability percentages.

---

## 🔌 4. API Signature Directory
Mounted under Express path `/api/career`:
- **`POST /discovery`**: Triggers a profile discovery run and saves the historical item.
- **`GET /recommendations`**: Returns the most recent discovery recommendations.
- **`GET /compare`**: Expects `?careerA=id&careerB=id`. Compares pros, cons, salary midpoint differences, and study timelines.
- **`GET /history`**: Returns full user discovery run history.

---

## 🤖 5. AI Interaction Flow
All LLM prompts are isolated from the discovery service:
1. `DiscoveryService` calls `AIService.generateDiscoveryInsights(profile, topCareers)`.
2. `AIService` resolves system instructions and insights prompt, then delegates to `AIProvider` (Gemini or Mock).
3. If LLM execution fails, `DiscoveryService` returns default structured fallback metrics to prevent server crashes.
