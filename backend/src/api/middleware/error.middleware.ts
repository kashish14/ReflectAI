/**
 * Global error handler: map to HTTP status and { code, message, details }; no stack in response.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../types/api.types';
import { logger } from '../../lib/logger';

export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const traceId = (req as Request & { context?: { traceId: string } }).context?.traceId;
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const body =
    err instanceof AppError
      ? err.toJson()
      : { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', details: undefined };

  if (statusCode >= 500) {
    logger.error('request error', {
      traceId,
      statusCode,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
  }

  res.status(statusCode).json(body);
}
