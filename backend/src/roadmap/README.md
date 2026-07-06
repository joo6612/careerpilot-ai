# Intelligent Roadmap Engine

This module converts career readiness gaps into an actionable, dynamic roadmap with phases, milestones, and tasks.

---

## 📁 1. Directory Tree
```
src/roadmap/
├── README.md                  # Documentation reference (this file)
├── models.ts                  # Typings for Phases, Milestones, Tasks, Progress
├── milestones.ts              # Default milestone structures definition
├── generator.ts               # AI coordinating generation algorithms
├── planner.ts                 # Time calculation utilities
├── scheduler.ts               # Calendar pacing pacing schedulers
├── progress.ts                # Progress percentage calculators
├── repository.ts              # Decoupled Repository interface and memory cache
├── service.ts                 # Career Roadmap orchestrations
├── validators.ts              # Query and parameter validators
├── exceptions.ts              # Custom exceptions (e.g. RoadmapNotFoundError)
├── dependencies.ts            # Dependency Injector wiring configurations
└── router.ts                  # Express route controllers
```

---

## 🏗️ 2. Roadmap Generation Pipeline
```
User requests a roadmap generation (POST /generate)
  ↓
generator.ts maps biography context and required catalog skills
  ↓
queries AIService to fetch learning milestones
  ↓
programmatically builds tasks (title, difficulty, estimated hours, resources)
  ↓
Preserves already completed tasks/milestones based on matching titles
  ↓
scheduler.ts calculates timeline ranges based on study hours availability
  ↓
Caches UserRoadmap and synchronizes legacy flat arrays with DbService
```

---

## 📊 3. Adaptive Regeneration Logic
When generating a roadmap:
1. Load the active user roadmap.
2. Compile a list of completed milestone and task titles.
3. Generate the new roadmap.
4. Compare milestone/task titles in the new roadmap: if a title matches one in the completed list, set its status to `'completed'`.
5. Recalculate completion percentages and remaining hours.

---

## 🔌 4. API Directory (Mounted under `/roadmap`)
- **`POST /generate`**: Generates or adaptively regenerates roadmaps.
- **`GET /`**: Returns the active structured roadmap.
- **`PATCH /task`**: Body: `{ taskId, status }`. Updates task completion.
- **`PATCH /milestone`**: Body: `{ milestoneId, status }`. Updates milestone completion.
- **`GET /progress`**: Returns detailed completion statistics.
- **`GET /history`**: Returns past roadmap session histories.
- **`POST /toggle`**: Body: `{ id }`. Legacy compatibility status toggler.
