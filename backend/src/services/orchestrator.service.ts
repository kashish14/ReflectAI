/**
 * Analysis orchestrator: create job, run AI pipeline (sync MVP), persist result.
 * Privacy: content passed to AI in memory only; not logged.
 */

import { v4 as uuidv4 } from 'uuid';
import { analysisRepository } from '../repositories/analysis.repository';
import { conversationRepository } from '../repositories/conversation.repository';
import { runAnalysis } from '../ai';
import { config } from '../config';
import { logger } from '../lib/logger';
import { metrics } from '../lib/metrics';

export interface AnalysisResponse {
  id: string;
  conversation_id: string;
  status: string;
  results?: unknown;
  model_version?: string;
  created_at: string;
  completed_at?: string | null;
}

export class AnalysisOrchestratorService {
  constructor(private readonly context?: { traceId?: string; spanId?: string }) {}

  async createAnalysis(
    tenantId: string,
    userId: string,
    conversationId: string,
    idempotencyKey?: string
  ): Promise<AnalysisResponse> {
    const id = uuidv4();
    const record = await analysisRepository.create(
      tenantId,
      userId,
      id,
      conversationId,
      idempotencyKey
    );

    metrics.recordAnalysisJobQueued();

    logger.info('analysis job created', {
      traceId: this.context?.traceId,
      spanId: this.context?.spanId,
      analysisId: id,
      conversationId,
      userId,
      tenantId,
    });

    // MVP: run analysis synchronously (no queue). In production, enqueue and process in worker.
    this.runAnalysisJob(tenantId, userId, id, conversationId).catch((err) => {
      logger.error('analysis job failed', {
        traceId: this.context?.traceId,
        analysisId: id,
        message: err instanceof Error ? err.message : String(err),
      });
      metrics.recordAnalysisJobFailed();
    });

    return this.toResponse(record);
  }

  private async runAnalysisJob(
    tenantId: string,
    userId: string,
    analysisId: string,
    conversationId: string
  ): Promise<void> {
    await analysisRepository.updateStatus(tenantId, userId, analysisId, 'running');

    const content = await conversationRepository.getContent(tenantId, userId, conversationId);
    if (content == null) {
      await analysisRepository.updateStatus(tenantId, userId, analysisId, 'failed');
      return;
    }

    const start = Date.now();
    const result = await runAnalysis(content, { modelVersion: config.aiModelVersion });
    const durationMs = Date.now() - start;

    metrics.recordAiLatency(durationMs);

    await analysisRepository.updateStatus(
      tenantId,
      userId,
      analysisId,
      'completed',
      result.results,
      new Date().toISOString(),
      result.model_version
    );

    metrics.recordAnalysisJobCompleted(durationMs);

    logger.info('analysis job completed', {
      traceId: this.context?.traceId,
      analysisId,
      durationMs,
      modelVersion: result.model_version,
    });
  }

  async getAnalysis(
    tenantId: string,
    userId: string,
    id: string
  ): Promise<AnalysisResponse | null> {
    const record = await analysisRepository.getById(tenantId, userId, id);
    if (!record) return null;
    return this.toResponse(record);
  }

  private toResponse(record: import('../repositories/analysis.repository').AnalysisRecord): AnalysisResponse {
    return {
      id: record.id,
      conversation_id: record.conversation_id,
      status: record.status,
      results: record.results ?? undefined,
      model_version: record.model_version,
      created_at: record.created_at,
      completed_at: record.completed_at ?? undefined,
    };
  }
}
