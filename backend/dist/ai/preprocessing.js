"use strict";
/**
 * Preprocessing: normalize content, split into messages.
 * No logging of content; in-memory only.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocess = preprocess;
function preprocess(content) {
    const normalized = content.trim().replace(/\r\n/g, '\n');
    const messages = normalized
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    if (messages.length === 0) {
        messages.push(normalized || '(empty)');
    }
    return { messages };
}
//# sourceMappingURL=preprocessing.js.map