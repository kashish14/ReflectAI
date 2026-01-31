/**
 * User/privacy routes: export, delete data.
 */

import { Router, Request, Response } from 'express';

/** Placeholder: enqueue export job; return 202. */
export function createUsersRouter(/* exportService, deletionService */): Router {
  const router = Router();

  router.post('/me/export', (req: Request, res: Response) => {
    const userId = req.userId!;
    // TODO: enqueue export job; return job id or download link when ready
    res.status(202).json({
      message: 'Export job queued',
      user_id: userId,
    });
  });

  router.delete('/me/data', (req: Request, res: Response) => {
    const userId = req.userId!;
    // TODO: enqueue deletion job; cascade analyses -> conversations -> metadata
    res.status(202).json({
      message: 'Data deletion job queued',
      user_id: userId,
    });
  });

  return router;
}
