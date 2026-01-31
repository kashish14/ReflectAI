/**
 * Sentiment aggregates: overall score, distribution, label.
 */

import type { SegmentSentiment, SentimentAggregate, SentimentLabel } from '../types';

export function aggregateSentiment(bySegment: SegmentSentiment[]): SentimentAggregate {
  if (bySegment.length === 0) {
    return {
      overallScore: 0,
      label: 'neutral',
      positiveRatio: 0,
      negativeRatio: 0,
      neutralRatio: 1,
      segmentCount: 0,
    };
  }

  const sum = bySegment.reduce((s, seg) => s + seg.score, 0);
  const overallScore = Math.max(-1, Math.min(1, sum / bySegment.length));
  const positive = bySegment.filter((s) => s.label === 'positive').length;
  const negative = bySegment.filter((s) => s.label === 'negative').length;
  const neutral = bySegment.filter((s) => s.label === 'neutral').length;
  const n = bySegment.length;

  const label: SentimentLabel =
    overallScore > 0.1 ? 'positive' : overallScore < -0.1 ? 'negative' : 'neutral';

  return {
    overallScore: Math.round(overallScore * 100) / 100,
    label,
    positiveRatio: Math.round((positive / n) * 100) / 100,
    negativeRatio: Math.round((negative / n) * 100) / 100,
    neutralRatio: Math.round((neutral / n) * 100) / 100,
    segmentCount: n,
  };
}
