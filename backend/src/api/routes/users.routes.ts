/**
 * User/privacy routes: export and delete everything stored for the current user.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { conversationRepository } from '../../repositories/conversation.repository';
import { analysisRepository } from '../../repositories/analysis.repository';

const ALL = { limit: Number.MAX_SAFE_INTEGER };

export function createUsersRouter(): Router {
  const router = Router();

  /** Export all conversations and analyses for the user as JSON. */
  router.post('/me/export', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [conversations, analyses] = await Promise.all([
        conversationRepository.list(req.tenantId!, req.userId!, ALL),
        analysisRepository.list(req.tenantId!, req.userId!, ALL),
      ]);
      res.json({
        user_id: req.userId,
        exported_at: new Date().toISOString(),
        conversations: conversations.data,
        analyses: analyses.data,
      });
    } catch (err) {
      next(err);
    }
  });

  /** Permanently delete all conversations and analyses for the user. */
  router.delete('/me/data', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analyses = await analysisRepository.deleteAll(req.tenantId!, req.userId!);
      const conversations = await conversationRepository.deleteAll(req.tenantId!, req.userId!);
      res.json({ deleted: { conversations, analyses } });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
