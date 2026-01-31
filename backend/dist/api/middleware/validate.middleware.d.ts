/**
 * Validation helpers for request body/params/query.
 * Use with express; validators return AppError on failure.
 */
export interface CreateConversationBody {
    content: string;
}
export interface CreateAnalysisBody {
    conversation_id: string;
    idempotency_key?: string;
}
export declare function validateCreateConversation(body: unknown): body is CreateConversationBody;
export declare function validateCreateAnalysis(body: unknown): body is CreateAnalysisBody;
export declare function validateIdParam(id: string | undefined, paramName: string): string;
//# sourceMappingURL=validate.middleware.d.ts.map