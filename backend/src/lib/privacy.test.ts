/**
 * Unit tests: privacy helpers — contentHash, sanitizeForLog.
 * No PII in test assertions or logs.
 */

import { contentHash, sanitizeForLog } from './privacy';

describe('privacy', () => {
  describe('contentHash', () => {
    it('returns same hash for same normalized content', () => {
      const a = contentHash('hello world');
      const b = contentHash('hello world');
      expect(a).toBe(b);
      expect(a).toMatch(/^[a-f0-9]{64}$/);
    });

    it('returns same hash when whitespace is normalized', () => {
      const a = contentHash('hello\nworld');
      const b = contentHash('hello\r\nworld');
      expect(a).toBe(b);
    });

    it('returns different hash for different content', () => {
      const a = contentHash('segment one');
      const b = contentHash('segment two');
      expect(a).not.toBe(b);
    });

    it('returns deterministic hex string of length 64', () => {
      const h = contentHash('test');
      expect(h).toHaveLength(64);
      expect(h).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('sanitizeForLog', () => {
    it('removes content key', () => {
      const out = sanitizeForLog({ content: 'secret', id: 'x' });
      expect(out).not.toHaveProperty('content');
      expect(out).toHaveProperty('id', 'x');
    });

    it('removes body, raw, text, message', () => {
      const out = sanitizeForLog({ body: 'x', raw: 'y', text: 'z', message: 'm', id: '1' });
      expect(out).toEqual({ id: '1' });
    });

    it('removes password and token (case-insensitive)', () => {
      const out = sanitizeForLog({ PASSWORD: 'p', Token: 't', conversationId: 'c' });
      expect(out).not.toHaveProperty('PASSWORD');
      expect(out).not.toHaveProperty('Token');
      expect(out).toHaveProperty('conversationId', 'c');
    });

    it('keeps safe keys: id, traceId, userId, count', () => {
      const out = sanitizeForLog({
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
