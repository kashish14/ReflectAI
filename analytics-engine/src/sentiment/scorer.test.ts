/**
 * Unit tests: sentiment scorer — scoreSegment, scoreSegments.
 * AI processing validation: bounds, labels, determinism.
 */

import { scoreSegment, scoreSegments } from './scorer';

describe('sentiment/scorer', () => {
  describe('scoreSegment', () => {
    it('returns score in [-1, 1] and label in { positive, negative, neutral }', () => {
      const r = scoreSegment('This is great and amazing!');
      expect(r.score).toBeGreaterThanOrEqual(-1);
      expect(r.score).toBeLessThanOrEqual(1);
      expect(['positive', 'negative', 'neutral']).toContain(r.label);
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    });

    it('positive phrase yields score > 0 and label positive', () => {
      const r = scoreSegment('I love this. Great work! Thanks.');
      expect(r.score).toBeGreaterThan(0);
      expect(r.label).toBe('positive');
    });

    it('negative phrase yields score < 0 and label negative', () => {
      const r = scoreSegment('This is bad. Terrible. I hate it.');
      expect(r.score).toBeLessThan(0);
      expect(r.label).toBe('negative');
    });

    it('neutral or empty yields label neutral', () => {
      const r = scoreSegment('The meeting is at 3pm.');
      expect(r.label).toBe('neutral');
      const empty = scoreSegment('');
      expect(empty.label).toBe('neutral');
    });

    it('is deterministic: same input gives same output', () => {
      const a = scoreSegment('hello world great');
      const b = scoreSegment('hello world great');
      expect(a.score).toBe(b.score);
      expect(a.label).toBe(b.label);
    });
  });

  describe('scoreSegments', () => {
    it('returns array of SegmentSentiment with index, score, label', () => {
      const segments = ['Good.', 'Bad.', 'Okay.'];
      const result = scoreSegments(segments);
      expect(result).toHaveLength(3);
      result.forEach((seg, i) => {
        expect(seg.index).toBe(i);
        expect(seg.score).toBeGreaterThanOrEqual(-1);
        expect(seg.score).toBeLessThanOrEqual(1);
        expect(['positive', 'negative', 'neutral']).toContain(seg.label);
      });
    });

    it('empty segments array returns empty array', () => {
      expect(scoreSegments([])).toEqual([]);
    });
  });
});
