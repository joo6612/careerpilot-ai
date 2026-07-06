# Career Readiness Engine

This module computes category readiness indicators (skills, resumes, projects, certs) and generates prioritized next steps.

---

## 📁 1. Directory Tree
```
src/readiness/
├── README.md                  # Documentation reference (this file)
├── models.ts                  # Typings for Readiness, Scores, Actions, Trends
├── calculator.ts              # Readiness score calculations
├── recommendations.ts         # Priority improvement actions compiler
├── repository.ts              # Decoupled Repository interface and memory cache
├── service.ts                 # Career Readiness orchestrations
├── validators.ts              # Query and parameter validators
├── exceptions.ts              # Custom exceptions (e.g. ReportNotFoundError)
├── dependencies.ts            # Dependency Injector wiring configurations
└── router.ts                  # Express route controllers
```

---

## 📊 2. Readiness Scoring Algorithm
The Overall Score is calculated using a weighted average:
- **Skill Readiness (30% weight)**: Compares required catalog skills against user profile skills.
- **Resume Readiness (20% weight)**: Directly matches the parsed ATS score (`profile.resume.atsScore`).
- **Project Readiness (15% weight)**: Grades completeness of profile projects portfolio links and descriptions.
- **Certification Readiness (15% weight)**: Evaluates count of listed industry credentials.
- **Education Readiness (10% weight)**: Matches academic qualifications to the career prerequisites.
- **Assessment Readiness (10% weight)**: Ratio of verified skill challenges passed.

---

## 🔌 3. REST API list
Mounted under Express path `/api/readiness`:
- **`POST /calculate`**: Triggers readiness scoring, queries AI insights, and stores history.
- **`GET /latest`**: Returns the latest readiness report details.
- **`GET /trends`**: Returns historical scores and verified assessments completions trend.
- **`GET /history`**: Returns full runs history.
