"use strict";
/**
 * API request context and error types.
 * Aligns with backend REST contract (code, message, details).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
        Object.setPrototypeOf(this, AppError.prototype);
    }
    toJson() {
        return {
            code: this.code,
            message: this.message,
            ...(this.details !== undefined && { details: this.details }),
        };
    }
}
exports.AppError = AppError;
//# sourceMappingURL=api.types.js.map