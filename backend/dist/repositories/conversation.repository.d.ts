/**
 * Conversation repository: tenant-scoped persistence.
 * MVP: in-memory store; replace with DB (Postgres, etc.) in production.
 */
export interface ConversationRecord {
    id: string;
    tenant_id: string;
    user_id: string;
    source: string;
    content_hash: string;
    metadata?: {
        timestamps?: string[];
        participants?: string[];
    };
    raw_content?: string | null;
    created_at: string;
}
export interface CreateConversationInput {
    contentHash: string;
    rawContent?: string | null;
    metadata?: ConversationRecord['metadata'];
    storeRaw: boolean;
}
export interface ConversationRepository {
    create(tenantId: string, userId: string, id: string, input: CreateConversationInput): Promise<ConversationRecord>;
    getById(tenantId: string, userId: string, id: string): Promise<ConversationRecord | null>;
    getContent(tenantId: string, userId: string, id: string): Promise<string | null>;
    list(tenantId: string, userId: string, options: {
        cursor?: string;
        limit: number;
    }): Promise<{
        data: ConversationRecord[];
        next_cursor?: string;
    }>;
}
export declare const conversationRepository: ConversationRepository;
//# sourceMappingURL=conversation.repository.d.ts.map