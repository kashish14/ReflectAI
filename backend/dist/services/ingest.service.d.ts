/**
 * Ingest service: parse, validate, hash, persist conversation.
 * Privacy: optional raw storage; content hash for dedup; no content in logs.
 */
export interface ConversationResponse {
    id: string;
    tenant_id: string;
    user_id: string;
    source: string;
    created_at: string;
}
export interface ListConversationsResponse {
    data: ConversationResponse[];
    next_cursor?: string;
}
export declare class IngestService {
    private readonly context?;
    constructor(context?: {
        traceId?: string;
        spanId?: string;
    } | undefined);
    createConversation(tenantId: string, userId: string, content: string, options?: {
        storeRaw?: boolean;
    }): Promise<ConversationResponse>;
    getConversation(tenantId: string, userId: string, id: string): Promise<ConversationResponse | null>;
    listConversations(tenantId: string, userId: string, options: {
        cursor?: string;
        limit: number;
    }): Promise<ListConversationsResponse>;
}
//# sourceMappingURL=ingest.service.d.ts.map