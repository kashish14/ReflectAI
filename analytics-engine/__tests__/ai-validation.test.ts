/**
 * AI processing validation: full pipeline output shape, bounds, determinism.
 * Golden-style: assert on structure and numeric bounds; no PII in fixtures.
 */

import { analyzeText, processSentimentResults } from '../src/index';
import type { SegmentSentiment, ClarityIndicators, ToneShift } from '../src/types';

const GOLDEN_SIMPLE = 'This is great!\nI am so happy.\n';
const GOLDEN_MIXED = 'Great news.\nBut wait, this is frustrating.\nOkay, thanks.';

describe('AI processing validation', () => {
  describe('analyzeText output shape and bounds', () => {
    it('returns all required top-level fields', () => {
      const result = analyzeText(GOLDEN_SIMPLE);
      expect(result).toHaveProperty('sentimentScore');
      expect(result).toHaveProperty('sentimentBySegment');
      expect(result).toHaveProperty('toneShifts');
      expect(result).toHaveProperty('clarityIndicators');
      expect(result).toHaveProperty('clarityScore');
      expect(result).toHaveProperty('emotionalTrendAnalysis');
      expect(result).toHaveProperty('behavioralSignals');
      expect(result).toHaveProperty('insightSummaries');
      expect(result).toHaveProperty('visualization');
      expect(result).toHaveProperty('segmentCount');
    });

    it('sentimentScore is in [-1, 1]', () => {
      const result = analyzeText(GOLDEN_SIMPLE);
      expect(result.sentimentScore).toBeGreaterThanOrEqual(-1);
      expect(result.sentimentScore).toBeLessThanOrEqual(1);
      expect(Number.isFinite(result.sentimentScore)).toBe(true);
    });

    it('sentimentBySegment: each score in [-1, 1], label in { positive, negative, neutral }', () => {
      const result = analyzeText(GOLDEN_MIXED);
      result.sentimentBySegment.forEach((seg: SegmentSentiment) => {
        expect(seg.score).toBeGreaterThanOrEqual(-1);
        expect(seg.score).toBeLessThanOrEqual(1);
        expect(['positive', 'negative', 'neutral']).toContain(seg.label);
        expect(seg.index).toBeGreaterThanOrEqual(0);
      });
    });

    it('clarityScore: score in [0, 100], grade in { A, B, C, D, F }', () => {
      const result = analyzeText(GOLDEN_SIMPLE);
      expect(result.clarityScore.score).toBeGreaterThanOrEqual(0);
      expect(result.clarityScore.score).toBeLessThanOrEqual(100);
      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.clarityScore.grade);
    });

    it('emotionalTrendAnalysis: direction in { improving, declining, stable }, strength and volatility in [0, 1]', () => {
      const result = analyzeText(GOLDEN_MIXED);
      const t = result.emotionalTrendAnalysis;
      expect(['improving', 'declining', 'stable']).toContain(t.direction);
      expect(t.strength).toBeGreaterThanOrEqual(0);
      expect(t.strength).toBeLessThanOrEqual(1);
      expect(t.volatility).toBeGreaterThanOrEqual(0);
      expect(t.volatility).toBeLessThanOrEqual(1);
    });

    it('behavioralSignals: ratios in [0, 1], segmentCount >= 0', () => {
      const result = analyzeText(GOLDEN_SIMPLE);
      const b = result.behavioralSignals;
      expect(b.shortSegmentRatio).toBeGreaterThanOrEqual(0);
      expect(b.shortSegmentRatio).toBeLessThanOrEqual(1);
      expect(b.longSegmentRatio).toBeGreaterThanOrEqual(0);
      expect(b.longSegmentRatio).toBeLessThanOrEqual(1);
      expect(b.segmentCount).toBeGreaterThanOrEqual(0);
    });

    it('toneShifts: magnitude >= 0, direction in { improving, declining, neutral }, fromIndex < toIndex', () => {
      const result = analyzeText(GOLDEN_MIXED);
      result.toneShifts.forEach((shift: ToneShift) => {
        expect(shift.magnitude).toBeGreaterThanOrEqual(0);
        expect(['improving', 'declining', 'neutral']).toContain(shift.direction);
        expect(shift.fromIndex).toBeLessThan(shift.toIndex);
      });
    });

    it('insightSummaries: each has type and summary string', () => {
      const result = analyzeText(GOLDEN_SIMPLE);
      expect(Array.isArray(result.insightSummaries)).toBe(true);
      result.insightSummaries.forEach((s) => {
        expect(['emotional_trend', 'clarity', 'behavioral', 'tone_shift']).toContain(s.type);
        expect(typeof s.summary).toBe('string');
        expect(s.summary.length).toBeGreaterThan(0);
        if (s.severity) {
          expect(['high', 'medium', 'low']).toContain(s.severity);
        }
      });
    });

    it('is deterministic: same input gives same sentimentScore and segment count', () => {
      const a = analyzeText(GOLDEN_SIMPLE);
      const b = analyzeText(GOLDEN_SIMPLE);
      expect(a.sentimentScore).toBe(b.sentimentScore);
      expect(a.segmentCount).toBe(b.segmentCount);
      expect(a.sentimentBySegment.length).toBe(b.sentimentBySegment.length);
    });
  });

  describe('processSentimentResults', () => {
    it('returns emotionalTrendAnalysis, clarityScore, behavioralSignals, insightSummaries', () => {
      const sentimentResult = {
        sentimentBySegment: [
          { index: 0, score: 0.5, label: 'positive' as const },
          { index: 1, score: -0.3, label: 'negative' as const },
        ],
        toneShifts: [
          { fromIndex: 0, toIndex: 1, fromScore: 0.5, toScore: -0.3, magnitude: 0.8, direction: 'declining' as const },
        ],
        clarityIndicators: {
          readability: 7,
          avgSentenceLength: 15,
          complexityScore: 3,
          jargonCount: 0,
          ambiguityFlags: [],
          sentenceCount: 5,
          wordCount: 75,
        },
      };
      const processed = processSentimentResults(sentimentResult, ['Seg one.', 'Seg two.']);
      expect(processed).toHaveProperty('emotionalTrendAnalysis');
      expect(processed).toHaveProperty('clarityScore');
      expect(processed).toHaveProperty('behavioralSignals');
      expect(processed).toHaveProperty('insightSummaries');
      expect(processed.clarityScore.score).toBeGreaterThanOrEqual(0);
      expect(processed.clarityScore.score).toBeLessThanOrEqual(100);
      expect(processed.behavioralSignals.segmentCount).toBe(2);
    });
  });
});
