export class ConversationNotFoundError extends Error {
  public statusCode = 404;

  constructor(id: string) {
    super(`Mentor conversation '${id}' was not found.`);
    this.name = 'ConversationNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedConversationAccessError extends Error {
  public statusCode = 403;

  constructor(id: string) {
    super(`Access denied: you do not own mentor conversation '${id}'.`);
    this.name = 'UnauthorizedConversationAccessError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
