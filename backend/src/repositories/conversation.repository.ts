/**
 * Conversation repository: tenant-scoped persistence.
 * MVP: in-memory store; replace with DB (Postgres, etc.) in production.
 */

import { config } from '../config';

export interface ConversationRecord {
  id: string;
  tenant_id: string;
  user_id: string;
  source: string;
  content_hash: string;
  metadata?: { timestamps?: string[]; participants?: string[] };
  raw_content?: string | null;
  created_at: string;
}

const store = new Map<string, ConversationRecord>();
const byTenantUser = new Map<string, string[]>();

function key(tenantId: string, userId: string, id: string): string {
  return `${tenantId}:${userId}:${id}`;
}

function listKey(tenantId: string, userId: string): string {
  return `${tenantId}:${userId}`;
}

export interface CreateConversationInput {
  contentHash: string;
  rawContent?: string | null;
  metadata?: ConversationRecord['metadata'];
  storeRaw: boolean;
}

export interface ConversationRepository {
  create(
    tenantId: string,
    userId: string,
    id: string,
    input: CreateConversationInput
  ): Promise<ConversationRecord>;
  getById(tenantId: string, userId: string, id: string): Promise<ConversationRecord | null>;
  getContent(tenantId: string, userId: string, id: string): Promise<string | null>;
  list(
    tenantId: string,
    userId: string,
    options: { cursor?: string; limit: number }
  ): Promise<{ data: ConversationRecord[]; next_cursor?: string }>;
}

export const conversationRepository: ConversationRepository = {
  async create(tenantId, userId, id, input) {
    const now = new Date().toISOString();
    const record: ConversationRecord = {
      id,
      tenant_id: tenantId,
      user_id: userId,
      source: 'manual',
      content_hash: input.contentHash,
      metadata: input.metadata,
      raw_content: input.storeRaw ? input.rawContent ?? null : null,
      created_at: now,
    };
    store.set(key(tenantId, userId, id), record);
    const list = byTenantUser.get(listKey(tenantId, userId)) ?? [];
    list.push(id);
    byTenantUser.set(listKey(tenantId, userId), list);
    return record;
  },

  async getById(tenantId, userId, id) {
    return store.get(key(tenantId, userId, id)) ?? null;
  },

  async getContent(tenantId, userId, id) {
    const rec = store.get(key(tenantId, userId, id));
    return rec?.raw_content ?? null;
  },

  async list(tenantId, userId, options) {
    const ids = byTenantUser.get(listKey(tenantId, userId)) ?? [];
    const start = options.cursor ? ids.indexOf(options.cursor) + 1 : 0;
    const slice = ids.slice(start, start + options.limit);
    const data = slice
      .map((id) => store.get(key(tenantId, userId, id)))
      .filter((r): r is ConversationRecord => r != null);
    const nextCursor =
      slice.length === options.limit && start + options.limit < ids.length
        ? ids[start + options.limit - 1]
        : undefined;
    return { data, next_cursor: nextCursor };
  },
};
