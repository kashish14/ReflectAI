/**
 * Rate limit middleware: per-user/tenant; approximate.
 * Uses express-rate-limit; key by userId or IP when no auth.
 */
export declare const rateLimitMiddleware: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimit.middleware.d.ts.map