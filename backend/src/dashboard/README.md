# Dashboard Intelligence Engine

The Dashboard Intelligence Engine aggregates information from all career modules, providing a unified view of the candidate's career progression, readiness, and next actionable steps. It serves as the single source of truth for the frontend without persisting duplicate business data.

## Module Architecture

```
                                    +-----------------------+
                                    |   Express API Router  |
                                    +-----------+-----------+
                                                |
                                    +-----------v-----------+
                                    |    DashboardService   |
                                    +-----------+-----------+
                                                |
                                    +-----------v-----------+
                                    |  DashboardAggregator  |
                                    +-----------+-----------+
                                                |
        +-------------+-------------+-----------+-----------+-------------+-------------+
        |             |             |           |           |             |             |
  +-----v-----+ +-----v-----+ +-----v-----+ +---v---+ +-----v-----+ +-----v-----+ +-----v-----+
  |  Profile  | | Discovery | |Assessment | |Resume | |Readiness  | | Roadmap   | |CareerVault|
  +-----------+ +-----------+ +-----------+ +-------+ +-----------+ +-----------+ +-----------+
```

## Data Integration & Flow

1. **Parallel Aggregation**: When a dashboard request is received, the `DashboardAggregator` calls all independent module services in parallel using `Promise.all`.
2. **Normalized Transformation**: The aggregated raw payloads are processed on-the-fly by domain-specific utility functions:
   - `SnapshotCalculator`: Prepares the `CareerSnapshot` metric block.
   - `WidgetsBuilder`: Formats raw data into 10 cohesive frontend-consumable widget payloads.
   - `AnalyticsCompiler`: Groups historical points into trend vectors (Weekly/Monthly Progress, Careers Selected, Readiness, Resume ATS, and Roadmap Completion).
   - `InsightsGenerator`: Connects to the `AIService` Foundation Layer to output summarized priorities, strengths, weaknesses, and upcoming milestones.

## REST API Specification

All routes below require Bearer Token Authentication via `authMiddleware` and are mounted under `/api/dashboard`:

- **`GET /api/dashboard`**: Returns the complete dashboard payload (snapshot, widgets, activities, analytics, insights).
- **`GET /api/dashboard/snapshot`**: Returns the single `CareerSnapshot` metric block.
- **`GET /api/dashboard/widgets`**: Returns list of active widgets. Supports filtering via `?widgets=widget-type-1,widget-type-2`.
- **`GET /api/dashboard/activity`**: Returns aggregated activity timeline feed.
- **`GET /api/dashboard/analytics`**: Returns weekly/monthly counts and score trends.
- **`GET /api/dashboard/insights`**: Returns AI-generated recommendations and priorities.
