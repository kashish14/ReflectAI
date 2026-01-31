/**
 * Trace context: generate or propagate traceId / spanId per request.
 */

import { randomUUID } from 'crypto';

export interface TraceContext {
  traceId: string;
  spanId: string;
}

const TRACE_HEADER = 'x-trace-id';
const SPAN_HEADER = 'x-span-id';

export function createTraceContext(): TraceContext {
  return {
    traceId: randomUUID(),
    spanId: randomUUID().slice(0, 16),
  };
}

export function getTraceFromHeaders(headers: { [key: string]: string | string[] | undefined }): TraceContext {
  const traceId = typeof headers[TRACE_HEADER] === 'string' ? headers[TRACE_HEADER] : undefined;
  const spanId = typeof headers[SPAN_HEADER] === 'string' ? headers[SPAN_HEADER] : undefined;
  return {
    traceId: traceId ?? randomUUID(),
    spanId: spanId ?? randomUUID().slice(0, 16),
  };
}
