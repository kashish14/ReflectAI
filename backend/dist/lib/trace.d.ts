/**
 * Trace context: generate or propagate traceId / spanId per request.
 */
export interface TraceContext {
    traceId: string;
    spanId: string;
}
export declare function createTraceContext(): TraceContext;
export declare function getTraceFromHeaders(headers: {
    [key: string]: string | string[] | undefined;
}): TraceContext;
//# sourceMappingURL=trace.d.ts.map