/**
 * Observability: attach traceId/spanId, start timer, log request (no PII).
 */

import { Request, Response, NextFunction } from 'express';
import { getTraceFromHeaders } from '../../lib/trace';
import { logger } from '../../lib/logger';
import { metrics } from '../../lib/metrics';

declare global {
  namespace Express {
    interface Request {
      context?: { traceId: string; spanId: string };
      startTime?: number;
    }
  }
}

export function observabilityMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { traceId, spanId } = getTraceFromHeaders(req.headers as Record<string, string | string[] | undefined>);
  req.context = { traceId, spanId };
  req.startTime = Date.now();

  res.setHeader('X-Trace-Id', traceId);
  res.setHeader('X-Span-Id', spanId);

  res.on('finish', () => {
    const durationMs = req.startTime != null ? Date.now() - req.startTime : 0;
    const route = (req.route?.path ?? req.path) as string;
    metrics.recordRequest(route, res.statusCode, durationMs);
    logger.info('request completed', {
      traceId,
      spanId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
}
