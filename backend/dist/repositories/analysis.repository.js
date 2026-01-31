"use strict";
/**
 * Analysis repository: tenant-scoped persistence for analysis jobs and results.
 * MVP: in-memory store; replace with DB in production.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisRepository = void 0;
const store = new Map();
const byTenantUser = new Map();
function key(tenantId, userId, id) {
    return `${tenantId}:${userId}:${id}`;
}
function listKey(tenantId, userId) {
    return `${tenantId}:${userId}`;
}
const idempotencyMap = new Map();
exports.analysisRepository = {
    async create(tenantId, userId, id, conversationId, idempotencyKey) {
        if (idempotencyKey) {
            const existing = idempotencyMap.get(idempotencyKey);
            if (existing) {
                const rec = await this.getById(tenantId, userId, existing);
                return rec;
            }
            idempotencyMap.set(idempotencyKey, id);
        }
        const now = new Date().toISOString();
        const record = {
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
        if (!rec)
            return null;
        rec.status = status;
        if (results != null)
            rec.results = results;
        if (completedAt != null)
            rec.completed_at = completedAt;
        if (modelVersion != null)
            rec.model_version = modelVersion;
        return rec;
    },
    async list(tenantId, userId, options) {
        const ids = byTenantUser.get(listKey(tenantId, userId)) ?? [];
        const start = options.cursor ? ids.indexOf(options.cursor) + 1 : 0;
        const slice = ids.slice(start, start + options.limit);
        const data = slice
            .map((id) => store.get(key(tenantId, userId, id)))
            .filter((r) => r != null);
        const nextCursor = slice.length === options.limit && start + options.limit < ids.length
            ? ids[start + options.limit - 1]
            : undefined;
        return { data, next_cursor: nextCursor };
    },
};
//# sourceMappingURL=analysis.repository.js.map