"use strict";
/**
 * Express app: middleware, mount /v1 routes.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const observability_middleware_1 = require("./api/middleware/observability.middleware");
const auth_middleware_1 = require("./api/middleware/auth.middleware");
const rateLimit_middleware_1 = require("./api/middleware/rateLimit.middleware");
const error_middleware_1 = require("./api/middleware/error.middleware");
const conversations_routes_1 = require("./api/routes/conversations.routes");
const analyses_routes_1 = require("./api/routes/analyses.routes");
const insights_routes_1 = require("./api/routes/insights.routes");
const users_routes_1 = require("./api/routes/users.routes");
const ingest_service_1 = require("./services/ingest.service");
const orchestrator_service_1 = require("./services/orchestrator.service");
const insights_service_1 = require("./services/insights.service");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    app.use(express_1.default.json({ limit: config_1.config.maxConversationSize }));
    app.use(observability_middleware_1.observabilityMiddleware);
    app.use(auth_middleware_1.authMiddleware);
    app.use(rateLimit_middleware_1.rateLimitMiddleware);
    const ingestService = new ingest_service_1.IngestService();
    const orchestratorService = new orchestrator_service_1.AnalysisOrchestratorService();
    const insightsService = new insights_service_1.InsightsService();
    app.use(`${config_1.config.apiPrefix}/conversations`, (0, conversations_routes_1.createConversationsRouter)(ingestService));
    app.use(`${config_1.config.apiPrefix}/analyses`, (0, analyses_routes_1.createAnalysesRouter)(orchestratorService));
    app.use(`${config_1.config.apiPrefix}/insights`, (0, insights_routes_1.createInsightsRouter)(insightsService));
    app.use(`${config_1.config.apiPrefix}/users`, (0, users_routes_1.createUsersRouter)());
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    app.use(error_middleware_1.errorMiddleware);
    return app;
}
//# sourceMappingURL=app.js.map