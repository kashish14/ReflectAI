/**
 * API request context and error types.
 * Aligns with backend REST contract (code, message, details).
 */

export interface RequestContext {
  traceId: string;
  spanId?: string;
  userId?: string;
  tenantId?: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJson(): ApiErrorBody {
    return {
      code: this.code,
      message: this.message,
      ...(this.details !== undefined && { details: this.details }),
    };
  }
}

/** Request with context and auth (set by middleware). Use with Express.Request. */
export interface AuthContext {
  context?: RequestContext;
  userId?: string;
  tenantId?: string;
}
