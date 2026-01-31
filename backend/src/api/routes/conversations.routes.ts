/**
 * Conversation API routes: create, list, get by id.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { IngestService } from '../../services/ingest.service';
import { validateCreateConversation, validateIdParam } from '../middleware/validate.middleware';
import { AppError } from '../../types/api.types';

export function createConversationsRouter(ingestService: IngestService): Router {
  const router = Router();

  router.post('/', (req: Request, res: Response, next: NextFunction) => {
    try {
      validateCreateConversation(req.body);
    } catch (e) {
      return next(e);
    }
    const userId = req.userId!;
    const tenantId = req.tenantId!;
    const { content } = req.body as { content: string };

    ingestService
      .createConversation(tenantId, userId, content)
      .then((conversation) => res.status(201).json(conversation))
      .catch(next);
  });

  router.get('/', (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const tenantId = req.tenantId!;
    const cursor = (req.query.cursor as string) ?? undefined;
    const limit = Math.min(parseInt((req.query.limit as string) ?? '20', 10), 100);

    ingestService
      .listConversations(tenantId, userId, { cursor, limit })
      .then((result) => res.json(result))
      .catch(next);
  });

  router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = validateIdParam(req.params.id, 'id');
      const userId = req.userId!;
      const tenantId = req.tenantId!;

      ingestService
        .getConversation(tenantId, userId, id)
        .then((conversation) => {
          if (!conversation) return next(new AppError('NOT_FOUND', 'Conversation not found', 404));
          res.json(conversation);
        })
        .catch(next);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
