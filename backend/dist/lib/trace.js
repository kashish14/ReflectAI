"use strict";
/**
 * Trace context: generate or propagate traceId / spanId per request.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTraceContext = createTraceContext;
exports.getTraceFromHeaders = getTraceFromHeaders;
const crypto_1 = require("crypto");
const TRACE_HEADER = 'x-trace-id';
const SPAN_HEADER = 'x-span-id';
function createTraceContext() {
    return {
        traceId: (0, crypto_1.randomUUID)(),
        spanId: (0, crypto_1.randomUUID)().slice(0, 16),
    };
}
function getTraceFromHeaders(headers) {
    const traceId = typeof headers[TRACE_HEADER] === 'string' ? headers[TRACE_HEADER] : undefined;
    const spanId = typeof headers[SPAN_HEADER] === 'string' ? headers[SPAN_HEADER] : undefined;
    return {
        traceId: traceId ?? (0, crypto_1.randomUUID)(),
        spanId: spanId ?? (0, crypto_1.randomUUID)().slice(0, 16),
    };
}
//# sourceMappingURL=trace.js.map