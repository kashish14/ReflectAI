"use strict";
/**
 * Privacy-first helpers: content hash for dedup/idempotency; no PII in logs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentHash = contentHash;
exports.sanitizeForLog = sanitizeForLog;
const crypto_1 = require("crypto");
const HASH_ALGORITHM = 'sha256';
const ENCODING = 'utf8';
/**
 * Compute SHA-256 of normalized content for deduplication and idempotency.
 * Do not use for passwords; use only for content identity.
 */
function contentHash(content) {
    const normalized = content.trim().replace(/\r\n/g, '\n');
    return (0, crypto_1.createHash)(HASH_ALGORITHM).update(normalized, ENCODING).digest('hex');
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
function sanitizeForLog(obj) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (UNSAFE_KEYS.has(k.toLowerCase()))
            continue;
        out[k] = v;
    }
    return out;
}
//# sourceMappingURL=privacy.js.map