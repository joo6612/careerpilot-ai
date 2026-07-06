export class VersionNotFoundError extends Error {
  public statusCode = 404;

  constructor(versionId: string) {
    super(`Resume version '${versionId}' not found.`);
    this.name = 'VersionNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
