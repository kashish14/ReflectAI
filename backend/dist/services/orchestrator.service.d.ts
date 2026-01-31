/**
 * Analysis orchestrator: create job, run AI pipeline (sync MVP), persist result.
 * Privacy: content passed to AI in memory only; not logged.
 */
export interface AnalysisResponse {
    id: string;
    conversation_id: string;
    status: string;
    results?: unknown;
    model_version?: string;
    created_at: string;
    completed_at?: string | null;
}
export declare class AnalysisOrchestratorService {
    private readonly context?;
    constructor(context?: {
        traceId?: string;
        spanId?: string;
    } | undefined);
    createAnalysis(tenantId: string, userId: string, conversationId: string, idempotencyKey?: string): Promise<AnalysisResponse>;
    private runAnalysisJob;
    getAnalysis(tenantId: string, userId: string, id: string): Promise<AnalysisResponse | null>;
    private toResponse;
}
//# sourceMappingURL=orchestrator.service.d.ts.map