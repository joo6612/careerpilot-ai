export class RoadmapNotFoundError extends Error {
  public statusCode = 404;

  constructor(uid: string) {
    super(`No active learning roadmap found for candidate '${uid}'.`);
    this.name = 'RoadmapNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
