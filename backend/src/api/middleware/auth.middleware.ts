/**
 * Auth middleware: resolve user/tenant from header or JWT; attach to req.
 * MVP: simple header-based user/tenant; replace with JWT/session in production.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../types/api.types';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tenantId?: string;
    }
  }
}

const USER_HEADER = 'x-user-id';
const TENANT_HEADER = 'x-tenant-id';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const userId = req.headers[USER_HEADER] as string | undefined;
  const tenantId = (req.headers[TENANT_HEADER] as string) ?? userId ?? 'default';

  if (!userId) {
    next(new AppError('UNAUTHORIZED', 'Missing or invalid user context', 401));
    return;
  }

  req.userId = userId;
  req.tenantId = tenantId;
  next();
}
