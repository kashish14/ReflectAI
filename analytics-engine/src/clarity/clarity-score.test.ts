/**
 * Unit tests + AI validation: clarity score — bounds, grade, breakdown.
 */

import { computeClarityScore } from './clarity-score';
import type { ClarityIndicators } from '../types';

describe('clarity/clarity-score', () => {
  it('returns score in [0, 100] and grade in { A, B, C, D, F }', () => {
    const indicators: ClarityIndicators = {
      readability: 8,
      avgSentenceLength: 12,
      complexityScore: 2,
      jargonCount: 0,
      ambiguityFlags: [],
      sentenceCount: 10,
      wordCount: 120,
    };
    const r = computeClarityScore(indicators);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(r.grade);
    expect(r.breakdown).toHaveProperty('readability');
    expect(r.breakdown).toHaveProperty('complexity');
    expect(r.breakdown).toHaveProperty('jargonPenalty');
    expect(r.breakdown).toHaveProperty('ambiguityPenalty');
  });

  it('high readability and low complexity yield high score and A or B', () => {
    const indicators: ClarityIndicators = {
      readability: 9,
      avgSentenceLength: 10,
      complexityScore: 1,
      jargonCount: 0,
      ambiguityFlags: [],
      sentenceCount: 5,
      wordCount: 50,
    };
    const r = computeClarityScore(indicators);
    expect(r.score).toBeGreaterThanOrEqual(80);
    expect(['A', 'B']).toContain(r.grade);
  });

  it('high jargon and ambiguity lower score', () => {
    const low: ClarityIndicators = {
      readability: 5,
      avgSentenceLength: 25,
      complexityScore: 6,
      jargonCount: 5,
      ambiguityFlags: ['hedging_language', 'uncertainty_phrases'],
      sentenceCount: 4,
      wordCount: 100,
    };
    const r = computeClarityScore(low);
    expect(r.score).toBeLessThan(80);
    expect(r.breakdown.jargonPenalty).toBeGreaterThan(0);
    expect(r.breakdown.ambiguityPenalty).toBeGreaterThan(0);
  });
});
