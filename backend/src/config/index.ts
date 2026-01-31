/**
 * Backend config from environment.
 * No secrets in code; use env vars or a secret manager in production.
 */
export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? '/v1',
  nodeEnv: process.env.NODE_ENV ?? 'development',

  /** Max body size for conversation upload (bytes). */
  maxConversationSize: parseInt(process.env.MAX_CONVERSATION_SIZE ?? '10485760', 10), // 10MB

  /** Rate limit: max requests per window per user (approximate). */
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),

  /** AI / queue (placeholders). */
  aiModelVersion: process.env.AI_MODEL_VERSION ?? '1.0.0',
  queueEnabled: process.env.QUEUE_ENABLED !== 'false',

  /** Privacy: store raw content so analysis can run (dev default true; set false in prod if needed). */
  storeRawContentByDefault:
    process.env.STORE_RAW_CONTENT_DEFAULT === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.STORE_RAW_CONTENT_DEFAULT !== 'false'),
} as const;

export type Config = typeof config;
