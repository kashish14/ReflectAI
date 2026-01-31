"use strict";
/**
 * Conversation API routes: create, list, get by id.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConversationsRouter = createConversationsRouter;
const express_1 = require("express");
const validate_middleware_1 = require("../middleware/validate.middleware");
const api_types_1 = require("../../types/api.types");
function createConversationsRouter(ingestService) {
    const router = (0, express_1.Router)();
    router.post('/', (req, res, next) => {
        try {
            (0, validate_middleware_1.validateCreateConversation)(req.body);
        }
        catch (e) {
            return next(e);
        }
        const userId = req.userId;
        const tenantId = req.tenantId;
        const { content } = req.body;
        ingestService
            .createConversation(tenantId, userId, content)
            .then((conversation) => res.status(201).json(conversation))
            .catch(next);
    });
    router.get('/', (req, res, next) => {
        const userId = req.userId;
        const tenantId = req.tenantId;
        const cursor = req.query.cursor ?? undefined;
        const limit = Math.min(parseInt(req.query.limit ?? '20', 10), 100);
        ingestService
            .listConversations(tenantId, userId, { cursor, limit })
            .then((result) => res.json(result))
            .catch(next);
    });
    router.get('/:id', (req, res, next) => {
        try {
            const id = (0, validate_middleware_1.validateIdParam)(req.params.id, 'id');
            const userId = req.userId;
            const tenantId = req.tenantId;
            ingestService
                .getConversation(tenantId, userId, id)
                .then((conversation) => {
                if (!conversation)
                    return next(new api_types_1.AppError('NOT_FOUND', 'Conversation not found', 404));
                res.json(conversation);
            })
                .catch(next);
        }
        catch (e) {
            next(e);
        }
    });
    return router;
}
//# sourceMappingURL=conversations.routes.js.map