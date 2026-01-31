"use strict";
/**
 * ReflectAI backend entry: load config, seed demo data, start server.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const logger_1 = require("./lib/logger");
const seed_1 = require("./seed");
const app = (0, app_1.createApp)();
(0, seed_1.seedDemoData)();
app.listen(config_1.config.port, () => {
    logger_1.logger.info('server started', {
        port: config_1.config.port,
        apiPrefix: config_1.config.apiPrefix,
        nodeEnv: config_1.config.nodeEnv,
    });
});
//# sourceMappingURL=index.js.map