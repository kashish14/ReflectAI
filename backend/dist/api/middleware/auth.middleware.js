"use strict";
/**
 * Auth middleware: resolve user/tenant from header or JWT; attach to req.
 * MVP: simple header-based user/tenant; replace with JWT/session in production.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const api_types_1 = require("../../types/api.types");
const USER_HEADER = 'x-user-id';
const TENANT_HEADER = 'x-tenant-id';
function authMiddleware(req, res, next) {
    const userId = req.headers[USER_HEADER];
    const tenantId = req.headers[TENANT_HEADER] ?? userId ?? 'default';
    if (!userId) {
        next(new api_types_1.AppError('UNAUTHORIZED', 'Missing or invalid user context', 401));
        return;
    }
    req.userId = userId;
    req.tenantId = tenantId;
    next();
}
//# sourceMappingURL=auth.middleware.js.map