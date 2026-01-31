/**
 * Behavioral signals from segment lengths and counts.
 */

import type { BehavioralSignals } from '../types';

const SHORT_THRESHOLD = 50;
const LONG_THRESHOLD = 200;

/**
 * Generate behavioral signals from segment texts (no timestamps in MVP).
 */
export function computeBehavioralSignals(segments: string[]): BehavioralSignals {
  if (segments.length === 0) {
    return {
      avgSegmentLength: 0,
      shortSegmentRatio: 0,
      longSegmentRatio: 0,
      lengthStdDev: 0,
      segmentCount: 0,
      totalLength: 0,
      isChatty: false,
      isEssayLike: false,
    };
  }

  const lengths = segments.map((s) => s.length);
  const totalLength = lengths.reduce((a, b) => a + b, 0);
  const avgSegmentLength = Math.round((totalLength / segments.length) * 10) / 10;
  const shortCount = lengths.filter((l) => l <= SHORT_THRESHOLD).length;
  const longCount = lengths.filter((l) => l >= LONG_THRESHOLD).length;
  const shortSegmentRatio = Math.round((shortCount / segments.length) * 100) / 100;
  const longSegmentRatio = Math.round((longCount / segments.length) * 100) / 100;

  const variance =
    lengths.reduce((sum, l) => sum + (l - avgSegmentLength) ** 2, 0) / segments.length;
  const lengthStdDev = Math.round(Math.sqrt(variance) * 10) / 10;

  const isChatty = shortSegmentRatio >= 0.5 && avgSegmentLength < 80;
  const isEssayLike = longSegmentRatio >= 0.3 || avgSegmentLength >= 150;

  return {
    avgSegmentLength,
    shortSegmentRatio,
    longSegmentRatio,
    lengthStdDev,
    segmentCount: segments.length,
    totalLength,
    isChatty,
    isEssayLike,
  };
}
