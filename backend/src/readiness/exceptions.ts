export class ReportNotFoundError extends Error {
  public statusCode = 404;

  constructor(uid: string) {
    super(`No active career readiness report found for user '${uid}'.`);
    this.name = 'ReportNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
