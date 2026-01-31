"use strict";
/**
 * Global error handler: map to HTTP status and { code, message, details }; no stack in response.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const api_types_1 = require("../../types/api.types");
const logger_1 = require("../../lib/logger");
function errorMiddleware(err, req, res, _next) {
    const traceId = req.context?.traceId;
    const statusCode = err instanceof api_types_1.AppError ? err.statusCode : 500;
    const body = err instanceof api_types_1.AppError
        ? err.toJson()
        : { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', details: undefined };
    if (statusCode >= 500) {
        logger_1.logger.error('request error', {
            traceId,
            statusCode,
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
        });
    }
    res.status(statusCode).json(body);
}
//# sourceMappingURL=error.middleware.js.map