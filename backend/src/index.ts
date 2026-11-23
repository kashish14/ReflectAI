/**
 * ReflectAI backend entry: seed demo data, then start the server.
 */

import { createApp } from './app';
import { config } from './config';
import { logger } from './lib/logger';
import { seedDemoData } from './seed';

async function main(): Promise<void> {
  if (process.env.SEED_DEMO_DATA !== 'false') await seedDemoData();
  createApp().listen(config.port, () => {
    logger.info('server started', {
      port: config.port,
      apiPrefix: config.apiPrefix,
      nodeEnv: config.nodeEnv,
    });
  });
}

main();
