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

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const minLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) ?? 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[minLevel];
}

function formatLog(level: LogLevel, message: string, meta?: LogMeta): string {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  return JSON.stringify(payload);
}

export const logger = {
  debug(message: string, meta?: LogMeta): void {
    if (shouldLog('debug')) console.log(formatLog('debug', message, meta));
  },
  info(message: string, meta?: LogMeta): void {
    if (shouldLog('info')) console.log(formatLog('info', message, meta));
  },
  warn(message: string, meta?: LogMeta): void {
    if (shouldLog('warn')) console.warn(formatLog('warn', message, meta));
  },
  error(message: string, meta?: LogMeta): void {
    if (shouldLog('error')) console.error(formatLog('error', message, meta));
  },
};
