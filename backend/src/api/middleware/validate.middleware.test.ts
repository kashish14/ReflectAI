/**
 * Unit tests: validation middleware — validateCreateConversation, validateCreateAnalysis, validateIdParam.
 */

import {
  validateCreateConversation,
  validateCreateAnalysis,
  validateIdParam,
} from './validate.middleware';
import { AppError } from '../../types/api.types';

describe('validate.middleware', () => {
  describe('validateCreateConversation', () => {
    it('accepts valid body with content string', () => {
      expect(() => validateCreateConversation({ content: 'hello' })).not.toThrow();
      expect(validateCreateConversation({ content: 'hello' })).toBe(true);
    });

    it('throws AppError when body is null', () => {
      expect(() => validateCreateConversation(null)).toThrow(AppError);
      try {
        validateCreateConversation(null);
      } catch (e) {
        expect((e as AppError).statusCode).toBe(400);
        expect((e as AppError).code).toBe('VALIDATION_ERROR');
      }
    });

    it('throws when content is not a string', () => {
      expect(() => validateCreateConversation({ content: 123 })).toThrow(AppError);
      expect(() => validateCreateConversation({ content: null })).toThrow(AppError);
    });

    it('throws when content is empty after trim', () => {
      expect(() => validateCreateConversation({ content: '   ' })).toThrow(AppError);
    });

    it('throws when content exceeds max size', () => {
      const big = 'x'.repeat(11 * 1024 * 1024);
      expect(() => validateCreateConversation({ content: big })).toThrow(AppError);
    });
  });

  describe('validateCreateAnalysis', () => {
    it('accepts valid body with conversation_id', () => {
      expect(() =>
        validateCreateAnalysis({ conversation_id: 'conv-123' })
      ).not.toThrow();
    });

    it('accepts optional idempotency_key', () => {
      expect(() =>
        validateCreateAnalysis({ conversation_id: 'c', idempotency_key: 'key' })
      ).not.toThrow();
    });

    it('throws when body is null', () => {
      expect(() => validateCreateAnalysis(null)).toThrow(AppError);
    });

    it('throws when conversation_id is missing or empty', () => {
      expect(() => validateCreateAnalysis({})).toThrow(AppError);
      expect(() => validateCreateAnalysis({ conversation_id: '' })).toThrow(AppError);
      expect(() => validateCreateAnalysis({ conversation_id: '   ' })).toThrow(AppError);
    });
  });

  describe('validateIdParam', () => {
    it('returns trimmed id when valid', () => {
      expect(validateIdParam('  abc-123  ', 'id')).toBe('abc-123');
    });

    it('throws when id is undefined or empty', () => {
      expect(() => validateIdParam(undefined, 'id')).toThrow(AppError);
      expect(() => validateIdParam('', 'id')).toThrow(AppError);
    });
  });
});
