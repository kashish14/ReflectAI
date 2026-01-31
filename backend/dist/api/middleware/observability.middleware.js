"use strict";
/**
 * Observability: attach traceId/spanId, start timer, log request (no PII).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.observabilityMiddleware = observabilityMiddleware;
const trace_1 = require("../../lib/trace");
const logger_1 = require("../../lib/logger");
const metrics_1 = require("../../lib/metrics");
function observabilityMiddleware(req, res, next) {
    const { traceId, spanId } = (0, trace_1.getTraceFromHeaders)(req.headers);
    req.context = { traceId, spanId };
    req.startTime = Date.now();
    res.setHeader('X-Trace-Id', traceId);
    res.setHeader('X-Span-Id', spanId);
    res.on('finish', () => {
        const durationMs = req.startTime != null ? Date.now() - req.startTime : 0;
        const route = (req.route?.path ?? req.path);
        metrics_1.metrics.recordRequest(route, res.statusCode, durationMs);
        logger_1.logger.info('request completed', {
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
//# sourceMappingURL=observability.middleware.js.map