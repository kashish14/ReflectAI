/**
 * Sentiment scorer: numeric score (-1 to 1) and label per segment.
 * Rule-based MVP; replace with ML/API adapter in production.
 */

import type { SegmentSentiment, SentimentLabel } from '../types';

const POSITIVE_WORDS = new Set(
  'good great happy love thanks amazing wonderful excellent positive yes glad hope best'.split(/\s+/)
);
const NEGATIVE_WORDS = new Set(
  'bad terrible hate sad angry frustrated awful poor negative no sorry worst fail'.split(/\s+/)
);

function wordScore(text: string): { positive: number; negative: number } {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter((w) => w.length > 1);
  let positive = 0;
  let negative = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) positive++;
    if (NEGATIVE_WORDS.has(w)) negative++;
  }
  return { positive, negative };
}

/**
 * Compute sentiment score for a single segment. Returns -1 to 1.
 */
export function scoreSegment(text: string): { score: number; label: SentimentLabel; confidence: number } {
  const { positive, negative } = wordScore(text);
  const total = positive + negative;
  if (total === 0) {
    return { score: 0, label: 'neutral', confidence: 0.5 };
  }
  const raw = (positive - negative) / Math.max(total, 1);
  const score = Math.max(-1, Math.min(1, raw));
  const confidence = Math.min(1, total / 5);
  const label: SentimentLabel = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';
  return { score, label, confidence };
}

/**
 * Score all segments; return array of SegmentSentiment.
 */
export function scoreSegments(segments: string[]): SegmentSentiment[] {
  return segments.map((text, index) => {
    const { score, label, confidence } = scoreSegment(text);
    return { index, score, label, confidence };
  });
}
