/**
 * Rate limit middleware: per-user/tenant; approximate.
 * Uses express-rate-limit; key by userId or IP when no auth.
 */

import rateLimit from 'express-rate-limit';
import { config } from '../../config';

export const rateLimitMiddleware = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = (req as import('express').Request & { userId?: string }).userId;
    return userId ?? req.ip ?? 'anonymous';
  },
});
