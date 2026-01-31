/**
 * Analysis repository: tenant-scoped persistence for analysis jobs and results.
 * MVP: in-memory store; replace with DB in production.
 */
export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'failed';
export interface AnalysisResult {
    sentiment?: {
        scores?: Array<{
            message_index?: number;
            label: string;
            score?: number;
        }>;
        aggregate?: string;
        emotional_labels?: string[];
    };
    clarity?: {
        readability?: number;
        flags?: string[];
    };
    behavioral?: {
        message_length_avg?: number;
        [key: string]: unknown;
    };
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
export interface AnalysisRepository {
    create(tenantId: string, userId: string, id: string, conversationId: string, idempotencyKey?: string): Promise<AnalysisRecord>;
    getById(tenantId: string, userId: string, id: string): Promise<AnalysisRecord | null>;
    updateStatus(tenantId: string, userId: string, id: string, status: AnalysisStatus, results?: AnalysisResult | null, completedAt?: string, modelVersion?: string): Promise<AnalysisRecord | null>;
    list(tenantId: string, userId: string, options: {
        cursor?: string;
        limit: number;
    }): Promise<{
        data: AnalysisRecord[];
        next_cursor?: string;
    }>;
}
export declare const analysisRepository: AnalysisRepository;
//# sourceMappingURL=analysis.repository.d.ts.map