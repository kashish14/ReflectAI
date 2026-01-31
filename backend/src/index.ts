/**
 * ReflectAI backend entry: load config, seed demo data, start server.
 */

import { createApp } from './app';
import { config } from './config';
import { logger } from './lib/logger';
import { seedDemoData } from './seed';

const app = createApp();

seedDemoData();

app.listen(config.port, () => {
  logger.info('server started', {
    port: config.port,
    apiPrefix: config.apiPrefix,
    nodeEnv: config.nodeEnv,
  });
});
