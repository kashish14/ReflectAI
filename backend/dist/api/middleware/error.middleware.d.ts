/**
 * Global error handler: map to HTTP status and { code, message, details }; no stack in response.
 */
import { Request, Response, NextFunction } from 'express';
export declare function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=error.middleware.d.ts.map