export class SessionNotFoundError extends Error {
  public statusCode = 404;

  constructor(sessionId: string) {
    super(`Assessment session with ID '${sessionId}' was not found or has expired.`);
    this.name = 'SessionNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SkillNotFoundError extends Error {
  public statusCode = 400;

  constructor(skill: string) {
    super(`Skill '${skill}' does not have any configured assessment questions in the bank.`);
    this.name = 'SkillNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
