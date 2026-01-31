"use strict";
/**
 * Unit tests: validation middleware — validateCreateConversation, validateCreateAnalysis, validateIdParam.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const validate_middleware_1 = require("./validate.middleware");
const api_types_1 = require("../../types/api.types");
describe('validate.middleware', () => {
    describe('validateCreateConversation', () => {
        it('accepts valid body with content string', () => {
            expect(() => (0, validate_middleware_1.validateCreateConversation)({ content: 'hello' })).not.toThrow();
            expect((0, validate_middleware_1.validateCreateConversation)({ content: 'hello' })).toBe(true);
        });
        it('throws AppError when body is null', () => {
            expect(() => (0, validate_middleware_1.validateCreateConversation)(null)).toThrow(api_types_1.AppError);
            try {
                (0, validate_middleware_1.validateCreateConversation)(null);
            }
            catch (e) {
                expect(e.statusCode).toBe(400);
                expect(e.code).toBe('VALIDATION_ERROR');
            }
        });
        it('throws when content is not a string', () => {
            expect(() => (0, validate_middleware_1.validateCreateConversation)({ content: 123 })).toThrow(api_types_1.AppError);
            expect(() => (0, validate_middleware_1.validateCreateConversation)({ content: null })).toThrow(api_types_1.AppError);
        });
        it('throws when content is empty after trim', () => {
            expect(() => (0, validate_middleware_1.validateCreateConversation)({ content: '   ' })).toThrow(api_types_1.AppError);
        });
        it('throws when content exceeds max size', () => {
            const big = 'x'.repeat(11 * 1024 * 1024);
            expect(() => (0, validate_middleware_1.validateCreateConversation)({ content: big })).toThrow(api_types_1.AppError);
        });
    });
    describe('validateCreateAnalysis', () => {
        it('accepts valid body with conversation_id', () => {
            expect(() => (0, validate_middleware_1.validateCreateAnalysis)({ conversation_id: 'conv-123' })).not.toThrow();
        });
        it('accepts optional idempotency_key', () => {
            expect(() => (0, validate_middleware_1.validateCreateAnalysis)({ conversation_id: 'c', idempotency_key: 'key' })).not.toThrow();
        });
        it('throws when body is null', () => {
            expect(() => (0, validate_middleware_1.validateCreateAnalysis)(null)).toThrow(api_types_1.AppError);
        });
        it('throws when conversation_id is missing or empty', () => {
            expect(() => (0, validate_middleware_1.validateCreateAnalysis)({})).toThrow(api_types_1.AppError);
            expect(() => (0, validate_middleware_1.validateCreateAnalysis)({ conversation_id: '' })).toThrow(api_types_1.AppError);
            expect(() => (0, validate_middleware_1.validateCreateAnalysis)({ conversation_id: '   ' })).toThrow(api_types_1.AppError);
        });
    });
    describe('validateIdParam', () => {
        it('returns trimmed id when valid', () => {
            expect((0, validate_middleware_1.validateIdParam)('  abc-123  ', 'id')).toBe('abc-123');
        });
        it('throws when id is undefined or empty', () => {
            expect(() => (0, validate_middleware_1.validateIdParam)(undefined, 'id')).toThrow(api_types_1.AppError);
            expect(() => (0, validate_middleware_1.validateIdParam)('', 'id')).toThrow(api_types_1.AppError);
        });
    });
});
//# sourceMappingURL=validate.middleware.test.js.map