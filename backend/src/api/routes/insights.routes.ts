/**
 * Insights API routes: dashboard overview, trends.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { InsightsService } from '../../services/insights.service';

export function createInsightsRouter(insightsService: InsightsService): Router {
  const router = Router();

  router.get('/overview', (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const tenantId = req.tenantId!;

    insightsService
      .getOverview(tenantId, userId)
      .then((overview) => res.json(overview))
      .catch(next);
  });

  return router;
}
