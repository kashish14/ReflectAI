"use strict";
/**
 * Metrics interface for RED (rate, error, duration) and custom metrics.
 * Implement with OpenTelemetry, StatsD, or in-memory for dev.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.metrics = void 0;
/** No-op implementation for dev; replace with real implementation in production. */
exports.metrics = {
    recordRequest(_route, _statusCode, _durationMs) { },
    recordAnalysisJobQueued() { },
    recordAnalysisJobCompleted(_durationMs) { },
    recordAnalysisJobFailed() { },
    recordAiLatency(_durationMs) { },
};
//# sourceMappingURL=metrics.js.map