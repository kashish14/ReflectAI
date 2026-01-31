"use strict";
/**
 * User/privacy routes: export, delete data.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUsersRouter = createUsersRouter;
const express_1 = require("express");
/** Placeholder: enqueue export job; return 202. */
function createUsersRouter( /* exportService, deletionService */) {
    const router = (0, express_1.Router)();
    router.post('/me/export', (req, res) => {
        const userId = req.userId;
        // TODO: enqueue export job; return job id or download link when ready
        res.status(202).json({
            message: 'Export job queued',
            user_id: userId,
        });
    });
    router.delete('/me/data', (req, res) => {
        const userId = req.userId;
        // TODO: enqueue deletion job; cascade analyses -> conversations -> metadata
        res.status(202).json({
            message: 'Data deletion job queued',
            user_id: userId,
        });
    });
    return router;
}
//# sourceMappingURL=users.routes.js.map