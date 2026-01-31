"use strict";
/**
 * Ingest service: parse, validate, hash, persist conversation.
 * Privacy: optional raw storage; content hash for dedup; no content in logs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestService = void 0;
const uuid_1 = require("uuid");
const config_1 = require("../config");
const conversation_repository_1 = require("../repositories/conversation.repository");
const privacy_1 = require("../lib/privacy");
const logger_1 = require("../lib/logger");
class IngestService {
    context;
    constructor(context) {
        this.context = context;
    }
    async createConversation(tenantId, userId, content, options) {
        const storeRaw = options?.storeRaw ?? config_1.config.storeRawContentByDefault;
        const contentHashValue = (0, privacy_1.contentHash)(content);
        const id = (0, uuid_1.v4)();
        const record = await conversation_repository_1.conversationRepository.create(tenantId, userId, id, {
            contentHash: contentHashValue,
            rawContent: storeRaw ? content : null,
            metadata: undefined,
            storeRaw,
        });
        logger_1.logger.info('conversation created', {
            traceId: this.context?.traceId,
            spanId: this.context?.spanId,
            conversationId: id,
            userId,
            tenantId,
            contentLength: content.length,
            contentHash: contentHashValue,
            storeRaw,
        });
        return {
            id: record.id,
            tenant_id: record.tenant_id,
            user_id: record.user_id,
            source: record.source,
            created_at: record.created_at,
        };
    }
    async getConversation(tenantId, userId, id) {
        const record = await conversation_repository_1.conversationRepository.getById(tenantId, userId, id);
        if (!record)
            return null;
        return {
            id: record.id,
            tenant_id: record.tenant_id,
            user_id: record.user_id,
            source: record.source,
            created_at: record.created_at,
        };
    }
    async listConversations(tenantId, userId, options) {
        const { data, next_cursor } = await conversation_repository_1.conversationRepository.list(tenantId, userId, {
            cursor: options.cursor,
            limit: options.limit,
        });
        return {
            data: data.map((r) => ({
                id: r.id,
                tenant_id: r.tenant_id,
                user_id: r.user_id,
                source: r.source,
                created_at: r.created_at,
            })),
            next_cursor,
        };
    }
}
exports.IngestService = IngestService;
//# sourceMappingURL=ingest.service.js.map