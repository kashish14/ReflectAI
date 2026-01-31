/**
 * API request context and error types.
 * Aligns with backend REST contract (code, message, details).
 */
export interface RequestContext {
    traceId: string;
    spanId?: string;
    userId?: string;
    tenantId?: string;
}
export interface ApiErrorBody {
    code: string;
    message: string;
    details?: unknown;
}
export declare class AppError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details?: unknown | undefined;
    constructor(code: string, message: string, statusCode?: number, details?: unknown | undefined);
    toJson(): ApiErrorBody;
}
/** Request with context and auth (set by middleware). Use with Express.Request. */
export interface AuthContext {
    context?: RequestContext;
    userId?: string;
    tenantId?: string;
}
//# sourceMappingURL=api.types.d.ts.map