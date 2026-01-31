/**
 * Validation helpers for request body/params/query.
 * Use with express; validators return AppError on failure.
 */

import { AppError } from '../../types/api.types';

const MAX_CONTENT_LENGTH = 10 * 1024 * 1024; // 10MB

export interface CreateConversationBody {
  content: string;
}

export interface CreateAnalysisBody {
  conversation_id: string;
  idempotency_key?: string;
}

export function validateCreateConversation(body: unknown): body is CreateConversationBody {
  if (body == null || typeof body !== 'object') {
    throw new AppError('VALIDATION_ERROR', 'Request body must be an object', 400);
  }
  const b = body as Record<string, unknown>;
  if (typeof b.content !== 'string') {
    throw new AppError('VALIDATION_ERROR', 'content must be a string', 400, { field: 'content' });
  }
  if (b.content.length > MAX_CONTENT_LENGTH) {
    throw new AppError('VALIDATION_ERROR', 'content exceeds maximum size', 400, {
      maxLength: MAX_CONTENT_LENGTH,
    });
  }
  if (b.content.trim().length === 0) {
    throw new AppError('VALIDATION_ERROR', 'content must not be empty', 400);
  }
  return true;
}

export function validateCreateAnalysis(body: unknown): body is CreateAnalysisBody {
  if (body == null || typeof body !== 'object') {
    throw new AppError('VALIDATION_ERROR', 'Request body must be an object', 400);
  }
  const b = body as Record<string, unknown>;
  if (typeof b.conversation_id !== 'string' || b.conversation_id.trim() === '') {
    throw new AppError('VALIDATION_ERROR', 'conversation_id must be a non-empty string', 400, {
      field: 'conversation_id',
    });
  }
  if (b.idempotency_key != null && typeof b.idempotency_key !== 'string') {
    throw new AppError('VALIDATION_ERROR', 'idempotency_key must be a string', 400);
  }
  return true;
}

export function validateIdParam(id: string | undefined, paramName: string): string {
  if (id == null || id.trim() === '') {
    throw new AppError('VALIDATION_ERROR', `${paramName} is required`, 400);
  }
  return id.trim();
}
