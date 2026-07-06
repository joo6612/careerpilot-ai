export class ResultNotFoundError extends Error {
  public statusCode = 404;

  constructor(uid: string) {
    super(`No active career discovery recommendations found for candidate '${uid}'.`);
    this.name = 'ResultNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
