# Career Domain Foundation

This module establishes Career profiles as first-class domain models, decoupling them from static definitions and hardcoded references.

---

## 📁 1. Directory Tree
```
src/career/
├── README.md                  # Documentation reference (this file)
├── models.ts                  # Interfaces for Career, Salary, and Difficulties
├── catalog.ts                 # Full database profiles for the 10 careers
├── repository.ts              # Decoupled CareerRepository interface and Local implementation
├── service.ts                 # Career business services (search, filter, skills, roadmaps)
├── validators.ts              # Query and parameter validators
├── exceptions.ts              # Custom error exception classes
├── dependencies.ts            # Dependency Injector (wiring repository, service, router)
└── router.ts                  # Express route controllers
```

---

## 🏗️ 2. Career Module Architecture
Adhering to Domain-Driven Design (DDD) and Clean Architecture:
- **Domain Layer (`models.ts`, `exceptions.ts`)**: Defines type interfaces and exceptions. Zero dependency on external tools or databases.
- **Repository Interface (`repository.ts`)**: Abstract definition of persistence methods, decoupling core logic from specific database engines.
- **Service Layer (`service.ts`)**: Contains core application services (searching, filtering, skills mapping). Relies solely on repository interfaces.
- **Controller/Router Layer (`router.ts`, `dependencies.ts`)**: Exposes REST interfaces to the Express runtime.

---

## 📊 3. Career Catalog Structure
The career catalog represents 10 standard technical roles. Each profile includes:
- **`id`**: String matching standard tokens (e.g. `"ai-engineer"`, `"devops-engineer"`).
- **`title`**: Display name.
- **`requiredSkills` / `beginnerSkills` / `intermediateSkills` / `advancedSkills`**: Explicit lists detailing progressive skill requirements.
- **`salaryRange`**: `{ min: number, max: number, currency: string }`.
- **`growthTrend`**: Market statistics.
- **`tools` & `technologies`**: Associated development packages.
- **`roadmapTemplate`**: Pre-configured stringified JSON mapping 4 chronological milestone blocks.

---

## 🔌 4. Exposed REST APIs
All routes are mounted under the public Express prefix `/api/career`:
- **`GET /`**: Lists all profiles. Supports optional category filtering using `?category=name`.
- **`GET /search`**: Fuzzy text matching on query parameter `?q=text`.
- **`GET /categories`**: Returns distinct categories.
- **`GET /:id`**: Gets the full detailed profile for a specific career ID.
- **`GET /:id/skills`**: Gets the skills structure categorized by difficulty.
- **`GET /:id/roadmap`**: Resolves default milestone timelines.

---

## 🗄️ 5. Repository Design & Firestore Migration Strategy
The module isolates persistence logic behind the `CareerRepository` interface:

```typescript
export interface CareerRepository {
  getAll(): Promise<Career[]>;
  getById(id: string): Promise<Career | null>;
  search(query: string): Promise<Career[]>;
  getCategories(): Promise<string[]>;
}
```

### Firestore Integration Roadmap
Migrating from in-memory arrays to Firestore does **not** require any refactoring in services, controllers, or validators.
1. Implement a new class `FirestoreCareerRepository` conforming to `CareerRepository`:
   ```typescript
   import * as admin from 'firebase-admin';
   
   export class FirestoreCareerRepository implements CareerRepository {
     private db = admin.firestore().collection('careers');
     
     async getAll(): Promise<Career[]> {
       const snapshot = await this.db.get();
       return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Career));
     }
     // ... implement remaining repository signatures ...
   }
   ```
2. In `dependencies.ts`, modify the instantiation line:
   ```typescript
   // Swap Local for Firestore:
   // const repository = new LocalCareerRepository();
   const repository = new FirestoreCareerRepository();
   ```
