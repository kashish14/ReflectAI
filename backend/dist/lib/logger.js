"use strict";
/**
 * Structured JSON logger. Never log PII or raw conversation content.
 * Use only: traceId, spanId, userId, tenantId, conversationId, analysisId, counts, hashes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const LOG_LEVEL_ORDER = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
const minLevel = process.env.LOG_LEVEL ?? 'info';
function shouldLog(level) {
    return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[minLevel];
}
function formatLog(level, message, meta) {
    const payload = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...meta,
    };
    return JSON.stringify(payload);
}
exports.logger = {
    debug(message, meta) {
        if (shouldLog('debug'))
            console.log(formatLog('debug', message, meta));
    },
    info(message, meta) {
        if (shouldLog('info'))
            console.log(formatLog('info', message, meta));
    },
    warn(message, meta) {
        if (shouldLog('warn'))
            console.warn(formatLog('warn', message, meta));
    },
    error(message, meta) {
        if (shouldLog('error'))
            console.error(formatLog('error', message, meta));
    },
};
//# sourceMappingURL=logger.js.map