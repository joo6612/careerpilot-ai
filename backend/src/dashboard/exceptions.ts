export class DashboardLoadError extends Error {
  constructor(uid: string, originalError?: any) {
    super(`Failed to load dashboard for user '${uid}': ${originalError?.message || 'Unknown error'}`);
    this.name = 'DashboardLoadError';
  }
}

export class DashboardAggregationError extends Error {
  constructor(source: string, originalError: any) {
    super(`Aggregation failure on source '${source}': ${originalError.message}`);
    this.name = 'DashboardAggregationError';
  }
}

export class DashboardValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DashboardValidationError';
  }
}
