/**
 * Structured JSON logger. Never log PII or raw conversation content.
 * Use only: traceId, spanId, userId, tenantId, conversationId, analysisId, counts, hashes.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogMeta {
    traceId?: string;
    spanId?: string;
    userId?: string;
    tenantId?: string;
    conversationId?: string;
    analysisId?: string;
    durationMs?: number;
    statusCode?: number;
    [key: string]: unknown;
}
export declare const logger: {
    debug(message: string, meta?: LogMeta): void;
    info(message: string, meta?: LogMeta): void;
    warn(message: string, meta?: LogMeta): void;
    error(message: string, meta?: LogMeta): void;
};
//# sourceMappingURL=logger.d.ts.map