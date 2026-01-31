"use strict";
/**
 * Sentiment pipeline: rule-based MVP (keyword/score).
 * Replace with API adapter or ML model in production; never log input.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSentimentPipeline = runSentimentPipeline;
const POSITIVE_WORDS = new Set('good great happy love thanks amazing wonderful excellent positive yes'.split(/\s+/));
const NEGATIVE_WORDS = new Set('bad terrible hate sad angry frustrated awful poor negative no'.split(/\s+/));
function scoreMessage(text) {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/).filter((w) => w.length > 1);
    let pos = 0;
    let neg = 0;
    for (const w of words) {
        if (POSITIVE_WORDS.has(w))
            pos++;
        if (NEGATIVE_WORDS.has(w))
            neg++;
    }
    if (pos > neg)
        return 'positive';
    if (neg > pos)
        return 'negative';
    return 'neutral';
}
function runSentimentPipeline(messages) {
    const scores = messages.map((text, i) => ({
        message_index: i,
        label: scoreMessage(text),
        score: 0.5,
    }));
    const positive = scores.filter((s) => s.label === 'positive').length;
    const negative = scores.filter((s) => s.label === 'negative').length;
    const neutral = scores.filter((s) => s.label === 'neutral').length;
    const total = scores.length;
    const aggregate = total === 0
        ? 'neutral'
        : positive >= negative && positive >= neutral
            ? 'positive'
            : negative >= positive && negative >= neutral
                ? 'negative'
                : 'neutral';
    return {
        scores,
        aggregate,
    };
}
//# sourceMappingURL=sentiment.js.map