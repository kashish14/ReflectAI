/**
 * Backend config from environment.
 * No secrets in code; use env vars or a secret manager in production.
 */
export declare const config: {
    readonly port: number;
    readonly apiPrefix: string;
    readonly nodeEnv: string;
    /** Max body size for conversation upload (bytes). */
    readonly maxConversationSize: number;
    /** Rate limit: max requests per window per user (approximate). */
    readonly rateLimitWindowMs: number;
    readonly rateLimitMax: number;
    /** AI / queue (placeholders). */
    readonly aiModelVersion: string;
    readonly queueEnabled: boolean;
    /** Privacy: store raw content so analysis can run (dev default true; set false in prod if needed). */
    readonly storeRawContentByDefault: boolean;
};
export type Config = typeof config;
//# sourceMappingURL=index.d.ts.map