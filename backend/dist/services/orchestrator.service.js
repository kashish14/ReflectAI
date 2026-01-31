"use strict";
/**
 * Analysis orchestrator: create job, run AI pipeline (sync MVP), persist result.
 * Privacy: content passed to AI in memory only; not logged.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisOrchestratorService = void 0;
const uuid_1 = require("uuid");
const analysis_repository_1 = require("../repositories/analysis.repository");
const conversation_repository_1 = require("../repositories/conversation.repository");
const ai_1 = require("../ai");
const config_1 = require("../config");
const logger_1 = require("../lib/logger");
const metrics_1 = require("../lib/metrics");
class AnalysisOrchestratorService {
    context;
    constructor(context) {
        this.context = context;
    }
    async createAnalysis(tenantId, userId, conversationId, idempotencyKey) {
        const id = (0, uuid_1.v4)();
        const record = await analysis_repository_1.analysisRepository.create(tenantId, userId, id, conversationId, idempotencyKey);
        metrics_1.metrics.recordAnalysisJobQueued();
        logger_1.logger.info('analysis job created', {
            traceId: this.context?.traceId,
            spanId: this.context?.spanId,
            analysisId: id,
            conversationId,
            userId,
            tenantId,
        });
        // MVP: run analysis synchronously (no queue). In production, enqueue and process in worker.
        this.runAnalysisJob(tenantId, userId, id, conversationId).catch((err) => {
            logger_1.logger.error('analysis job failed', {
                traceId: this.context?.traceId,
                analysisId: id,
                message: err instanceof Error ? err.message : String(err),
            });
            metrics_1.metrics.recordAnalysisJobFailed();
        });
        return this.toResponse(record);
    }
    async runAnalysisJob(tenantId, userId, analysisId, conversationId) {
        await analysis_repository_1.analysisRepository.updateStatus(tenantId, userId, analysisId, 'running');
        const content = await conversation_repository_1.conversationRepository.getContent(tenantId, userId, conversationId);
        if (content == null) {
            await analysis_repository_1.analysisRepository.updateStatus(tenantId, userId, analysisId, 'failed');
            return;
        }
        const start = Date.now();
        const result = await (0, ai_1.runAnalysis)(content, { modelVersion: config_1.config.aiModelVersion });
        const durationMs = Date.now() - start;
        metrics_1.metrics.recordAiLatency(durationMs);
        await analysis_repository_1.analysisRepository.updateStatus(tenantId, userId, analysisId, 'completed', result.results, new Date().toISOString(), result.model_version);
        metrics_1.metrics.recordAnalysisJobCompleted(durationMs);
        logger_1.logger.info('analysis job completed', {
            traceId: this.context?.traceId,
            analysisId,
            durationMs,
            modelVersion: result.model_version,
        });
    }
    async getAnalysis(tenantId, userId, id) {
        const record = await analysis_repository_1.analysisRepository.getById(tenantId, userId, id);
        if (!record)
            return null;
        return this.toResponse(record);
    }
    toResponse(record) {
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
exports.AnalysisOrchestratorService = AnalysisOrchestratorService;
//# sourceMappingURL=orchestrator.service.js.map