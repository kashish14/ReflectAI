"use strict";
/**
 * Unit tests: privacy helpers — contentHash, sanitizeForLog.
 * No PII in test assertions or logs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const privacy_1 = require("./privacy");
describe('privacy', () => {
    describe('contentHash', () => {
        it('returns same hash for same normalized content', () => {
            const a = (0, privacy_1.contentHash)('hello world');
            const b = (0, privacy_1.contentHash)('hello world');
            expect(a).toBe(b);
            expect(a).toMatch(/^[a-f0-9]{64}$/);
        });
        it('returns same hash when whitespace is normalized', () => {
            const a = (0, privacy_1.contentHash)('hello\nworld');
            const b = (0, privacy_1.contentHash)('hello\r\nworld');
            expect(a).toBe(b);
        });
        it('returns different hash for different content', () => {
            const a = (0, privacy_1.contentHash)('segment one');
            const b = (0, privacy_1.contentHash)('segment two');
            expect(a).not.toBe(b);
        });
        it('returns deterministic hex string of length 64', () => {
            const h = (0, privacy_1.contentHash)('test');
            expect(h).toHaveLength(64);
            expect(h).toMatch(/^[a-f0-9]+$/);
        });
    });
    describe('sanitizeForLog', () => {
        it('removes content key', () => {
            const out = (0, privacy_1.sanitizeForLog)({ content: 'secret', id: 'x' });
            expect(out).not.toHaveProperty('content');
            expect(out).toHaveProperty('id', 'x');
        });
        it('removes body, raw, text, message', () => {
            const out = (0, privacy_1.sanitizeForLog)({ body: 'x', raw: 'y', text: 'z', message: 'm', id: '1' });
            expect(out).toEqual({ id: '1' });
        });
        it('removes password and token (case-insensitive)', () => {
            const out = (0, privacy_1.sanitizeForLog)({ PASSWORD: 'p', Token: 't', conversationId: 'c' });
            expect(out).not.toHaveProperty('PASSWORD');
            expect(out).not.toHaveProperty('Token');
            expect(out).toHaveProperty('conversationId', 'c');
        });
        it('keeps safe keys: id, traceId, userId, count', () => {
            const out = (0, privacy_1.sanitizeForLog)({
                id: '1',
                traceId: 't',
                userId: 'u',
                count: 5,
                content: 'strip',
            });
            expect(out).toEqual({ id: '1', traceId: 't', userId: 'u', count: 5 });
        });
    });
});
//# sourceMappingURL=privacy.test.js.map