/**
 * Ingest service: parse, validate, hash, persist conversation.
 * Privacy: optional raw storage; content hash for dedup; no content in logs.
 */

import { randomUUID as uuidv4 } from 'crypto';
import { config } from '../config';
import { conversationRepository, type ConversationRecord } from '../repositories/conversation.repository';
import { contentHash } from '../lib/privacy';
import { logger } from '../lib/logger';

export interface ConversationResponse {
  id: string;
  tenant_id: string;
  user_id: string;
  source: string;
  created_at: string;
  /** First line of the conversation (max 80 chars); only present when raw content is stored. */
  preview?: string;
}

function toResponse(record: ConversationRecord): ConversationResponse {
  const firstLine = record.raw_content?.trim().split('\n')[0];
  return {
    id: record.id,
    tenant_id: record.tenant_id,
    user_id: record.user_id,
    source: record.source,
    created_at: record.created_at,
    preview: firstLine && firstLine.length > 80 ? `${firstLine.slice(0, 79)}…` : firstLine,
  };
}

export interface ListConversationsResponse {
  data: ConversationResponse[];
  next_cursor?: string;
}

export class IngestService {
  constructor(private readonly context?: { traceId?: string; spanId?: string }) {}

  async createConversation(
    tenantId: string,
    userId: string,
    content: string,
    options?: { storeRaw?: boolean }
  ): Promise<ConversationResponse> {
    const storeRaw = options?.storeRaw ?? config.storeRawContentByDefault;
    const contentHashValue = contentHash(content);
    const id = uuidv4();
    const record = await conversationRepository.create(tenantId, userId, id, {
      contentHash: contentHashValue,
      rawContent: storeRaw ? content : null,
      metadata: undefined,
      storeRaw,
    });

    logger.info('conversation created', {
      traceId: this.context?.traceId,
      spanId: this.context?.spanId,
      conversationId: id,
      userId,
      tenantId,
      contentLength: content.length,
      contentHash: contentHashValue,
      storeRaw,
    });

    return toResponse(record);
  }

  async getConversation(
    tenantId: string,
    userId: string,
    id: string
  ): Promise<ConversationResponse | null> {
    const record = await conversationRepository.getById(tenantId, userId, id);
    if (!record) return null;
    return toResponse(record);
  }

  async listConversations(
    tenantId: string,
    userId: string,
    options: { cursor?: string; limit: number }
  ): Promise<ListConversationsResponse> {
    const { data, next_cursor } = await conversationRepository.list(tenantId, userId, {
      cursor: options.cursor,
      limit: options.limit,
    });
    return {
      data: data.map(toResponse),
      next_cursor,
    };
  }
}
