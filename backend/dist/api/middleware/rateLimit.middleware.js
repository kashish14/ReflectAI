"use strict";
/**
 * Rate limit middleware: per-user/tenant; approximate.
 * Uses express-rate-limit; key by userId or IP when no auth.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("../../config");
exports.rateLimitMiddleware = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimitWindowMs,
    max: config_1.config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const userId = req.userId;
        return userId ?? req.ip ?? 'anonymous';
    },
});
//# sourceMappingURL=rateLimit.middleware.js.map