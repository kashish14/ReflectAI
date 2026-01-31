/**
 * Analysis API routes: create job, get by id (poll for status/results).
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AnalysisOrchestratorService, AnalysisResponse } from '../../services/orchestrator.service';
import { validateCreateAnalysis, validateIdParam } from '../middleware/validate.middleware';
import { AppError } from '../../types/api.types';

export function createAnalysesRouter(orchestratorService: AnalysisOrchestratorService): Router {
  const router = Router();

  router.post('/', (req: Request, res: Response, next: NextFunction) => {
    try {
      validateCreateAnalysis(req.body);
    } catch (e) {
      return next(e);
    }
    const userId = req.userId!;
    const tenantId = req.tenantId!;
    const { conversation_id, idempotency_key } = req.body as { conversation_id: string; idempotency_key?: string };

    orchestratorService
      .createAnalysis(tenantId, userId, conversation_id, idempotency_key)
      .then((analysis: AnalysisResponse) => res.status(202).json(analysis))
      .catch(next);
  });

  router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = validateIdParam(req.params.id, 'id');
      const userId = req.userId!;
      const tenantId = req.tenantId!;

      orchestratorService
        .getAnalysis(tenantId, userId, id)
        .then((analysis: AnalysisResponse | null) => {
          if (!analysis) return next(new AppError('NOT_FOUND', 'Analysis not found', 404));
          res.json(analysis);
        })
        .catch(next);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
