/**
 * Privacy-first helpers: content hash for dedup/idempotency; no PII in logs.
 */

import { createHash } from 'crypto';

const HASH_ALGORITHM = 'sha256';
const ENCODING = 'utf8';

/**
 * Compute SHA-256 of normalized content for deduplication and idempotency.
 * Do not use for passwords; use only for content identity.
 */
export function contentHash(content: string): string {
  const normalized = content.trim().replace(/\r\n/g, '\n');
  return createHash(HASH_ALGORITHM).update(normalized, ENCODING).digest('hex');
}

/**
 * Sanitize an object for logging: remove known PII/content keys.
 * Only ids, counts, and hashes are safe to log.
 */
const UNSAFE_KEYS = new Set([
  'content',
  'body',
  'raw',
  'text',
  'message',
  'password',
  'token',
  'authorization',
]);

export function sanitizeForLog<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (UNSAFE_KEYS.has(k.toLowerCase())) continue;
    out[k as keyof T] = v as T[keyof T];
  }
  return out;
}
