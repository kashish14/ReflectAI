/**
 * Observability: attach traceId/spanId, start timer, log request (no PII).
 */
import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            context?: {
                traceId: string;
                spanId: string;
            };
            startTime?: number;
        }
    }
}
export declare function observabilityMiddleware(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=observability.middleware.d.ts.map