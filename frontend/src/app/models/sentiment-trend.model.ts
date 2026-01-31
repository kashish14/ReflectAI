/**
 * Data shape for sentiment trend visualization (e.g. over time or by segment).
 */
export type SentimentLabel = 'positive' | 'negative' | 'neutral';

export interface SentimentTrendPoint {
  /** Label for this point (e.g. timestamp, segment index) */
  label: string;
  /** Sentiment distribution for this point */
  positive: number;
  negative: number;
  neutral: number;
  /** Optional aggregate score -1 to 1 or 0 to 100 */
  score?: number;
}
