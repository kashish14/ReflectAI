/**
 * Express app: middleware, mount /v1 routes.
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { observabilityMiddleware } from './api/middleware/observability.middleware';
import { authMiddleware } from './api/middleware/auth.middleware';
import { rateLimitMiddleware } from './api/middleware/rateLimit.middleware';
import { errorMiddleware } from './api/middleware/error.middleware';
import { createConversationsRouter } from './api/routes/conversations.routes';
import { createAnalysesRouter } from './api/routes/analyses.routes';
import { createInsightsRouter } from './api/routes/insights.routes';
import { createUsersRouter } from './api/routes/users.routes';
import { IngestService } from './services/ingest.service';
import { AnalysisOrchestratorService } from './services/orchestrator.service';
import { InsightsService } from './services/insights.service';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: config.maxConversationSize }));

  app.use(observabilityMiddleware);
  app.use(authMiddleware);
  app.use(rateLimitMiddleware);

  const ingestService = new IngestService();
  const orchestratorService = new AnalysisOrchestratorService();
  const insightsService = new InsightsService();

  app.use(`${config.apiPrefix}/conversations`, createConversationsRouter(ingestService));
  app.use(`${config.apiPrefix}/analyses`, createAnalysesRouter(orchestratorService));
  app.use(`${config.apiPrefix}/insights`, createInsightsRouter(insightsService));
  app.use(`${config.apiPrefix}/users`, createUsersRouter());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use(errorMiddleware);

  return app;
}
