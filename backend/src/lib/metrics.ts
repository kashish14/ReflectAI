/**
 * Metrics interface for RED (rate, error, duration) and custom metrics.
 * Implement with OpenTelemetry, StatsD, or in-memory for dev.
 */

export interface MetricsRecorder {
  recordRequest(route: string, statusCode: number, durationMs: number): void;
  recordAnalysisJobQueued(): void;
  recordAnalysisJobCompleted(durationMs: number): void;
  recordAnalysisJobFailed(): void;
  recordAiLatency(durationMs: number): void;
}

/** No-op implementation for dev; replace with real implementation in production. */
export const metrics: MetricsRecorder = {
  recordRequest(_route: string, _statusCode: number, _durationMs: number): void {},
  recordAnalysisJobQueued(): void {},
  recordAnalysisJobCompleted(_durationMs: number): void {},
  recordAnalysisJobFailed(): void {},
  recordAiLatency(_durationMs: number): void {},
};
