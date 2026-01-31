/**
 * Tone shift detection: find significant sentiment changes between consecutive segments.
 */

import type { SegmentSentiment, ToneShift } from '../types';

export interface ToneShiftOptions {
  /** Minimum absolute score delta to count as a shift. Default 0.3. */
  minMagnitude?: number;
  /** Optional: smooth over N segments before comparing. Default 1. */
  windowSize?: number;
}

const DEFAULT_MIN_MAGNITUDE = 0.3;
const DEFAULT_WINDOW_SIZE = 1;

/**
 * Detect tone shifts between consecutive segments.
 */
export function detectToneShifts(
  bySegment: SegmentSentiment[],
  options: ToneShiftOptions = {}
): ToneShift[] {
  const minMagnitude = options.minMagnitude ?? DEFAULT_MIN_MAGNITUDE;
  const windowSize = options.windowSize ?? DEFAULT_WINDOW_SIZE;
  const shifts: ToneShift[] = [];

  if (bySegment.length < 2) return shifts;

  for (let i = 0; i < bySegment.length - 1; i++) {
    const fromIdx = i;
    const toIdx = i + 1;

    const fromScore = windowAverage(bySegment, fromIdx, windowSize);
    const toScore = windowAverage(bySegment, toIdx, windowSize);
    const magnitude = Math.abs(toScore - fromScore);

    if (magnitude < minMagnitude) continue;

    const direction: ToneShift['direction'] =
      toScore > fromScore ? 'improving' : toScore < fromScore ? 'declining' : 'neutral';

    shifts.push({
      fromIndex: fromIdx,
      toIndex: toIdx,
      fromScore: Math.round(fromScore * 100) / 100,
      toScore: Math.round(toScore * 100) / 100,
      magnitude: Math.round(magnitude * 100) / 100,
      direction,
    });
  }

  return shifts;
}

function windowAverage(segments: SegmentSentiment[], center: number, size: number): number {
  const start = Math.max(0, center - Math.floor(size / 2));
  const end = Math.min(segments.length, start + size);
  let sum = 0;
  let count = 0;
  for (let i = start; i < end; i++) {
    sum += segments[i].score;
    count++;
  }
  return count === 0 ? 0 : sum / count;
}
