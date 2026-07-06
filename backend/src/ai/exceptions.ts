export class AIError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'AIError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ProviderError extends AIError {
  constructor(message: string, providerName: string) {
    super(`AI Provider '${providerName}' failed: ${message}`, 502);
    this.name = 'ProviderError';
  }
}

export class ContextError extends AIError {
  constructor(message: string) {
    super(`AI Context Validation Error: ${message}`, 400);
    this.name = 'ContextError';
  }
}

export class PromptError extends AIError {
  constructor(message: string) {
    super(`AI Prompt Template Error: ${message}`, 400);
    this.name = 'PromptError';
  }
}

export class ResponseParseError extends AIError {
  constructor(message: string, rawText?: string) {
    super(`AI Response Parsing Error: ${message}${rawText ? ` | Raw Response: ${rawText}` : ''}`, 422);
    this.name = 'ResponseParseError';
  }
}
