/**
 * Analysis repository: tenant-scoped persistence for analysis jobs and results.
 * MVP: in-memory store; replace with DB in production.
 */

export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AnalysisResult {
  sentiment?: {
    scores?: Array<{ message_index?: number; label: string; score?: number }>;
    aggregate?: string;
    emotional_labels?: string[];
  };
  clarity?: { readability?: number; flags?: string[] };
  behavioral?: { message_length_avg?: number; [key: string]: unknown };
}

export interface AnalysisRecord {
  id: string;
  conversation_id: string;
  tenant_id: string;
  user_id: string;
  status: AnalysisStatus;
  results?: AnalysisResult | null;
  model_version?: string;
  created_at: string;
  completed_at?: string | null;
}

const store = new Map<string, AnalysisRecord>();
const byTenantUser = new Map<string, string[]>();

function key(tenantId: string, userId: string, id: string): string {
  return `${tenantId}:${userId}:${id}`;
}

function listKey(tenantId: string, userId: string): string {
  return `${tenantId}:${userId}`;
}

export interface AnalysisRepository {
  create(
    tenantId: string,
    userId: string,
    id: string,
    conversationId: string,
    idempotencyKey?: string
  ): Promise<AnalysisRecord>;
  getById(tenantId: string, userId: string, id: string): Promise<AnalysisRecord | null>;
  updateStatus(
    tenantId: string,
    userId: string,
    id: string,
    status: AnalysisStatus,
    results?: AnalysisResult | null,
    completedAt?: string,
    modelVersion?: string
  ): Promise<AnalysisRecord | null>;
  list(
    tenantId: string,
    userId: string,
    options: { cursor?: string; limit: number }
  ): Promise<{ data: AnalysisRecord[]; next_cursor?: string }>;
}

const idempotencyMap = new Map<string, string>();

export const analysisRepository: AnalysisRepository = {
  async create(tenantId, userId, id, conversationId, idempotencyKey) {
    if (idempotencyKey) {
      const existing = idempotencyMap.get(idempotencyKey);
      if (existing) {
        const rec = await this.getById(tenantId, userId, existing);
        return rec!;
      }
      idempotencyMap.set(idempotencyKey, id);
    }
    const now = new Date().toISOString();
    const record: AnalysisRecord = {
      id,
      conversation_id: conversationId,
      tenant_id: tenantId,
      user_id: userId,
      status: 'pending',
      results: null,
      created_at: now,
      completed_at: null,
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

  async updateStatus(tenantId, userId, id, status, results, completedAt, modelVersion) {
    const rec = store.get(key(tenantId, userId, id));
    if (!rec) return null;
    rec.status = status;
    if (results != null) rec.results = results;
    if (completedAt != null) rec.completed_at = completedAt;
    if (modelVersion != null) rec.model_version = modelVersion;
    return rec;
  },

  async list(tenantId, userId, options) {
    const ids = byTenantUser.get(listKey(tenantId, userId)) ?? [];
    const start = options.cursor ? ids.indexOf(options.cursor) + 1 : 0;
    const slice = ids.slice(start, start + options.limit);
    const data = slice
      .map((id) => store.get(key(tenantId, userId, id)))
      .filter((r): r is AnalysisRecord => r != null);
    const nextCursor =
      slice.length === options.limit && start + options.limit < ids.length
        ? ids[start + options.limit - 1]
        : undefined;
    return { data, next_cursor: nextCursor };
  },
};
