/**
 * Emotional trend analysis: direction, strength, runs, volatility.
 * Processes sentiment-by-segment and tone shifts.
 */

import type { SegmentSentiment, ToneShift, EmotionalTrendAnalysis } from '../types';

export interface EmotionalTrendInput {
  sentimentBySegment: SegmentSentiment[];
  toneShifts: ToneShift[];
}

/**
 * Compute linear slope of score over index (least-squares style).
 */
function slope(scores: SegmentSentiment[]): number {
  if (scores.length < 2) return 0;
  const n = scores.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += scores[i].score;
    sumXY += i * scores[i].score;
    sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

/** Longest consecutive run of segments matching predicate. */
function longestRun(segments: SegmentSentiment[], positive: boolean): number {
  let max = 0;
  let current = 0;
  const target = positive ? 'positive' : 'negative';
  for (const seg of segments) {
    if (seg.label === target) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  }
  return max;
}

/** Volatility: average absolute change between consecutive scores, normalized to 0–1. */
function volatility(scores: SegmentSentiment[]): number {
  if (scores.length < 2) return 0;
  let sumDelta = 0;
  for (let i = 1; i < scores.length; i++) {
    sumDelta += Math.abs(scores[i].score - scores[i - 1].score);
  }
  const avgDelta = sumDelta / (scores.length - 1);
  return Math.min(1, avgDelta / 2);
}

/** Find index of max and min score. */
function peakAndTrough(scores: SegmentSentiment[]): { peakIndex?: number; troughIndex?: number } {
  if (scores.length === 0) return {};
  let maxScore = scores[0].score;
  let minScore = scores[0].score;
  let peakIndex = 0;
  let troughIndex = 0;
  for (let i = 1; i < scores.length; i++) {
    if (scores[i].score > maxScore) {
      maxScore = scores[i].score;
      peakIndex = i;
    }
    if (scores[i].score < minScore) {
      minScore = scores[i].score;
      troughIndex = i;
    }
  }
  return { peakIndex, troughIndex };
}

/**
 * Generate emotional trend analysis from sentiment-by-segment and tone shifts.
 */
export function analyzeEmotionalTrend(input: EmotionalTrendInput): EmotionalTrendAnalysis {
  const { sentimentBySegment } = input;
  if (sentimentBySegment.length === 0) {
    return {
      direction: 'stable',
      strength: 0,
      slope: 0,
      longestPositiveRun: 0,
      longestNegativeRun: 0,
      volatility: 0,
    };
  }

  const slopeValue = slope(sentimentBySegment);
  const vol = volatility(sentimentBySegment);
  const { peakIndex, troughIndex } = peakAndTrough(sentimentBySegment);

  const direction: EmotionalTrendAnalysis['direction'] =
    slopeValue > 0.02 ? 'improving' : slopeValue < -0.02 ? 'declining' : 'stable';
  const strength = Math.min(1, Math.abs(slopeValue) * 10);

  return {
    direction,
    strength: Math.round(strength * 100) / 100,
    slope: Math.round(slopeValue * 100) / 100,
    longestPositiveRun: longestRun(sentimentBySegment, true),
    longestNegativeRun: longestRun(sentimentBySegment, false),
    volatility: Math.round(vol * 100) / 100,
    peakIndex,
    troughIndex,
  };
}
