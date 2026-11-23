import { runSentimentPipeline } from './sentiment';

describe('runSentimentPipeline', () => {
  it('scores each message and ignores punctuation', () => {
    const result = runSentimentPipeline(['Thanks, this is great!', 'The build broke again.', 'See you at 3.']);
    expect(result.scores.map((s) => s.label)).toEqual(['positive', 'negative', 'neutral']);
    expect(result.scores[0].score).toBe(1);
    expect(result.scores[1].score).toBe(-1);
  });

  it('derives aggregate and emotional labels', () => {
    const result = runSentimentPipeline(['Thank you so much!', 'I am excited about this.']);
    expect(result.aggregate).toBe('positive');
    expect(result.emotional_labels).toEqual(expect.arrayContaining(['grateful', 'excited']));
  });

  it('handles empty input', () => {
    expect(runSentimentPipeline([])).toEqual({ scores: [], aggregate: 'neutral', emotional_labels: [] });
  });
});
