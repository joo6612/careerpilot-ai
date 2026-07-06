export class CareerNotFoundError extends Error {
  public statusCode: number;

  constructor(careerId: string) {
    super(`Career with ID '${careerId}' was not found in the catalog.`);
    this.name = 'CareerNotFoundError';
    this.statusCode = 404;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
