/**
 * Privacy-first helpers: content hash for dedup/idempotency; no PII in logs.
 */
/**
 * Compute SHA-256 of normalized content for deduplication and idempotency.
 * Do not use for passwords; use only for content identity.
 */
export declare function contentHash(content: string): string;
export declare function sanitizeForLog<T extends Record<string, unknown>>(obj: T): Partial<T>;
//# sourceMappingURL=privacy.d.ts.map