"use strict";
/**
 * Validation helpers for request body/params/query.
 * Use with express; validators return AppError on failure.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateConversation = validateCreateConversation;
exports.validateCreateAnalysis = validateCreateAnalysis;
exports.validateIdParam = validateIdParam;
const api_types_1 = require("../../types/api.types");
const MAX_CONTENT_LENGTH = 10 * 1024 * 1024; // 10MB
function validateCreateConversation(body) {
    if (body == null || typeof body !== 'object') {
        throw new api_types_1.AppError('VALIDATION_ERROR', 'Request body must be an object', 400);
    }
    const b = body;
    if (typeof b.content !== 'string') {
        throw new api_types_1.AppError('VALIDATION_ERROR', 'content must be a string', 400, { field: 'content' });
    }
    if (b.content.length > MAX_CONTENT_LENGTH) {
        throw new api_types_1.AppError('VALIDATION_ERROR', 'content exceeds maximum size', 400, {
            maxLength: MAX_CONTENT_LENGTH,
        });
    }
    if (b.content.trim().length === 0) {
        throw new api_types_1.AppError('VALIDATION_ERROR', 'content must not be empty', 400);
    }
    return true;
}
function validateCreateAnalysis(body) {
    if (body == null || typeof body !== 'object') {
        throw new api_types_1.AppError('VALIDATION_ERROR', 'Request body must be an object', 400);
    }
    const b = body;
    if (typeof b.conversation_id !== 'string' || b.conversation_id.trim() === '') {
        throw new api_types_1.AppError('VALIDATION_ERROR', 'conversation_id must be a non-empty string', 400, {
            field: 'conversation_id',
        });
    }
    if (b.idempotency_key != null && typeof b.idempotency_key !== 'string') {
        throw new api_types_1.AppError('VALIDATION_ERROR', 'idempotency_key must be a string', 400);
    }
    return true;
}
function validateIdParam(id, paramName) {
    if (id == null || id.trim() === '') {
        throw new api_types_1.AppError('VALIDATION_ERROR', `${paramName} is required`, 400);
    }
    return id.trim();
}
//# sourceMappingURL=validate.middleware.js.map