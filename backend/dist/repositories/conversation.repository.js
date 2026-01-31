"use strict";
/**
 * Conversation repository: tenant-scoped persistence.
 * MVP: in-memory store; replace with DB (Postgres, etc.) in production.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationRepository = void 0;
const store = new Map();
const byTenantUser = new Map();
function key(tenantId, userId, id) {
    return `${tenantId}:${userId}:${id}`;
}
function listKey(tenantId, userId) {
    return `${tenantId}:${userId}`;
}
exports.conversationRepository = {
    async create(tenantId, userId, id, input) {
        const now = new Date().toISOString();
        const record = {
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
            .filter((r) => r != null);
        const nextCursor = slice.length === options.limit && start + options.limit < ids.length
            ? ids[start + options.limit - 1]
            : undefined;
        return { data, next_cursor: nextCursor };
    },
};
//# sourceMappingURL=conversation.repository.js.map