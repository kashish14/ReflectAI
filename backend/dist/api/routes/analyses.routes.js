"use strict";
/**
 * Analysis API routes: create job, get by id (poll for status/results).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnalysesRouter = createAnalysesRouter;
const express_1 = require("express");
const validate_middleware_1 = require("../middleware/validate.middleware");
const api_types_1 = require("../../types/api.types");
function createAnalysesRouter(orchestratorService) {
    const router = (0, express_1.Router)();
    router.post('/', (req, res, next) => {
        try {
            (0, validate_middleware_1.validateCreateAnalysis)(req.body);
        }
        catch (e) {
            return next(e);
        }
        const userId = req.userId;
        const tenantId = req.tenantId;
        const { conversation_id, idempotency_key } = req.body;
        orchestratorService
            .createAnalysis(tenantId, userId, conversation_id, idempotency_key)
            .then((analysis) => res.status(202).json(analysis))
            .catch(next);
    });
    router.get('/:id', (req, res, next) => {
        try {
            const id = (0, validate_middleware_1.validateIdParam)(req.params.id, 'id');
            const userId = req.userId;
            const tenantId = req.tenantId;
            orchestratorService
                .getAnalysis(tenantId, userId, id)
                .then((analysis) => {
                if (!analysis)
                    return next(new api_types_1.AppError('NOT_FOUND', 'Analysis not found', 404));
                res.json(analysis);
            })
                .catch(next);
        }
        catch (e) {
            next(e);
        }
    });
    return router;
}
//# sourceMappingURL=analyses.routes.js.map