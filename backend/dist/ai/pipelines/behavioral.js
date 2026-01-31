"use strict";
/**
 * Behavioral pipeline: message length, count (no ML).
 * No logging of content.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBehavioralPipeline = runBehavioralPipeline;
function runBehavioralPipeline(messages) {
    if (messages.length === 0) {
        return { message_count: 0, message_length_avg: 0 };
    }
    const totalLength = messages.reduce((sum, m) => sum + m.length, 0);
    const message_length_avg = Math.round((totalLength / messages.length) * 10) / 10;
    return {
        message_count: messages.length,
        message_length_avg,
    };
}
//# sourceMappingURL=behavioral.js.map