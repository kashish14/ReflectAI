/**
 * Single clarity score (0–100) from clarity indicators.
 */

import type { ClarityIndicators, ClarityScore } from '../types';

/**
 * Compute 0–100 clarity score and grade from indicators.
 * Higher readability + lower complexity + fewer jargon/ambiguity = higher score.
 */
export function computeClarityScore(indicators: ClarityIndicators): ClarityScore {
  const readability = Math.min(10, Math.max(0, indicators.readability));
  const complexityNorm = Math.min(10, Math.max(0, indicators.complexityScore));
  const jargonPenalty = Math.min(10, indicators.jargonCount * 2);
  const ambiguityPenalty = Math.min(10, indicators.ambiguityFlags.length * 2);

  const raw =
    readability * 4 +
    (10 - complexityNorm) * 3 -
    jargonPenalty -
    ambiguityPenalty;
  const score = Math.round(Math.max(0, Math.min(100, raw * 2.5)));

  const grade =
    score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

  return {
    score,
    grade,
    breakdown: {
      readability,
      complexity: complexityNorm,
      jargonPenalty: Math.round(jargonPenalty * 10) / 10,
      ambiguityPenalty: Math.round(ambiguityPenalty * 10) / 10,
    },
  };
}
