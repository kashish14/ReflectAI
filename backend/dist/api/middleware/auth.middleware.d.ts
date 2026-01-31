/**
 * Auth middleware: resolve user/tenant from header or JWT; attach to req.
 * MVP: simple header-based user/tenant; replace with JWT/session in production.
 */
import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            tenantId?: string;
        }
    }
}
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map