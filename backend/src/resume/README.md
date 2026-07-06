# Resume Intelligence Engine

This module analyzes candidate resumes, computes ATS compatibility ratings, tracks skill gaps against career catalogs, and returns improvement suggestions.

---

## 📁 1. Directory Tree
```
src/resume/
├── README.md                  # Documentation reference (this file)
├── models.ts                  # Typings for Versions, Scores, Comparisons
├── ats.ts                     # ATS scoring calculations
├── skill_gap.ts               # Skills gap analysis (career requirements vs assessments)
├── improvements.ts            # Actionable feedback and suggestions compiler
├── repository.ts              # Decoupled Repository interface and memory cache
├── service.ts                 # Resume Intelligence orchestrations
├── validators.ts              # Query and parameter validators
├── exceptions.ts              # Custom exceptions (e.g. VersionNotFoundError)
├── dependencies.ts            # Dependency Injector wiring configurations
└── router.ts                  # Express route controllers
```

---

## 🏗️ 2. Resume Analysis Flow
```
User uploads text draft (POST /upload)
  ↓
User calls analysis pipeline (POST /analyze)
  ↓
ats.ts scores formatting, keyword density, projects, and difficulty matches
  ↓
skill_gap.ts audits resume terms vs career catalog requirements and assessments
  ↓
service.ts queries AIService for strengths, weaknesses, and improvement lists
  ↓
Updates local cache and synchronizes user profile resume status
```

---

## 📈 3. ATS Scoring Weights
Sub-criteria weights are distributed as follows:
- **Keyword Match (25%)**: Density of target career skills matching resume text.
- **Skills Score (25%)**: Presence of profile self-rated skills in the resume.
- **Experience Score (20%)**: Checks senior/lead keywords for Advanced tracks, junior/intern for Beginner tracks.
- **Education Score (15%)**: Compatibility of academic credentials with the catalog specifications.
- **Projects Score (10%)**: Project descriptions, Github links, and action verb occurrences.
- **Formatting Score (5%)**: Checks core resume header divisions.

---

## 🔌 4. API Directory (Mounted under `/resume`)
- **`POST /upload`**: Creates a new resume text draft.
- **`POST /analyze`**: Runs full ATS grading, skill gap comparison, and updates profile.
- **`GET /latest`**: Returns latest analyzed resume.
- **`GET /history`**: Returns list of all uploaded resume versions and scores.
- **`GET /compare`**: Expects `?versionA=id&versionB=id`. Compares two versions side-by-side.
