"use strict";
/**
 * Clarity pipeline: readability heuristics (sentence length, word count).
 * No external API; no logging of content.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runClarityPipeline = runClarityPipeline;
function countSentences(text) {
    const trimmed = text.trim();
    if (trimmed.length === 0)
        return 0;
    const matches = trimmed.match(/[.!?]+/g);
    return matches ? matches.length : 1;
}
function countWords(text) {
    return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}
/** Simple readability: avg words per sentence (inverse complexity). */
function readability(words, sentences) {
    if (sentences === 0)
        return 10;
    const avg = words / sentences;
    if (avg <= 10)
        return 10;
    if (avg <= 15)
        return 8;
    if (avg <= 20)
        return 6;
    return Math.max(1, 6 - (avg - 20) / 5);
}
function runClarityPipeline(messages) {
    const all = messages.join(' ');
    const words = countWords(all);
    const sentences = Math.max(1, countSentences(all));
    const readabilityScore = Math.round(readability(words, sentences) * 10) / 10;
    const flags = [];
    if (words / sentences > 25)
        flags.push('long_sentences');
    if (messages.some((m) => m.length > 500))
        flags.push('long_messages');
    return {
        readability: readabilityScore,
        flags: flags.length > 0 ? flags : undefined,
    };
}
//# sourceMappingURL=clarity.js.map