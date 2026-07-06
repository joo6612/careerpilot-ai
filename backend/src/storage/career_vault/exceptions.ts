export class VaultDocumentNotFoundError extends Error {
  public statusCode = 404;

  constructor(id: string) {
    super(`Career Vault document with ID '${id}' was not found.`);
    this.name = 'VaultDocumentNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedVaultAccessError extends Error {
  public statusCode = 403;

  constructor(id: string) {
    super(`Access denied: you do not own Career Vault document '${id}'.`);
    this.name = 'UnauthorizedVaultAccessError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class VaultVersionNotFoundError extends Error {
  public statusCode = 404;

  constructor(versionId: string) {
    super(`Career Vault version snapshot '${versionId}' was not found.`);
    this.name = 'VaultVersionNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
