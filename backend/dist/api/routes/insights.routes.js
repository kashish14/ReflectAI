"use strict";
/**
 * Insights API routes: dashboard overview, trends.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInsightsRouter = createInsightsRouter;
const express_1 = require("express");
function createInsightsRouter(insightsService) {
    const router = (0, express_1.Router)();
    router.get('/overview', (req, res, next) => {
        const userId = req.userId;
        const tenantId = req.tenantId;
        insightsService
            .getOverview(tenantId, userId)
            .then((overview) => res.json(overview))
            .catch(next);
    });
    return router;
}
//# sourceMappingURL=insights.routes.js.map