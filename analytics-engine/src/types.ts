/**
 * Sentiment analysis engine: input and output types.
 * Modular; no PII in logs; content in memory only.
 */

/** Raw input: text only, or pre-segmented messages. */
export interface EngineInput {
  /** Raw conversation/text to analyze. */
  text: string;
  /** Optional: pre-segmented messages (overrides splitting text by newlines). */
  segments?: string[];
}

/** Sentiment label and numeric score per segment. */
export type SentimentLabel = 'positive' | 'negative' | 'neutral';

export interface SegmentSentiment {
  index: number;
  score: number; // -1 to 1
  label: SentimentLabel;
  confidence?: number; // 0 to 1
}

/** Detected tone shift between consecutive segments. */
export interface ToneShift {
  fromIndex: number;
  toIndex: number;
  fromScore: number;
  toScore: number;
  magnitude: number; // absolute delta
  direction: 'improving' | 'declining' | 'neutral';
}

/** Clarity indicators for the text. */
export interface ClarityIndicators {
  readability: number; // 0–10 or similar scale
  avgSentenceLength: number;
  complexityScore: number; // 0–10, higher = more complex
  jargonCount: number;
  ambiguityFlags: string[];
  sentenceCount: number;
  wordCount: number;
}

/** Aggregates for visualization. */
export interface SentimentAggregate {
  overallScore: number; // -1 to 1
  label: SentimentLabel;
  positiveRatio: number;
  negativeRatio: number;
  neutralRatio: number;
  segmentCount: number;
}

/** Time-series point for charts (e.g. sentiment over segment index). */
export interface SentimentTimeSeriesPoint {
  index: number;
  score: number;
  label: SentimentLabel;
  cumulativeAvg?: number;
}

/** Visualization-ready payload. */
export interface VisualizationInsights {
  timeSeriesData: SentimentTimeSeriesPoint[];
  aggregateSummary: SentimentAggregate;
  sentimentDistribution: { positive: number; negative: number; neutral: number };
  toneShifts: ToneShift[];
  clarityIndicators: ClarityIndicators;
  /** Chart-friendly: stacked bar data per segment (positive, neutral, negative counts). */
  segmentStackedData?: Array<{ index: number; positive: number; neutral: number; negative: number }>;
}

/** Emotional trend analysis: direction, strength, runs, volatility. */
export interface EmotionalTrendAnalysis {
  /** Overall trend: improving | declining | stable */
  direction: 'improving' | 'declining' | 'stable';
  /** Strength of trend (0–1). */
  strength: number;
  /** Slope of sentiment over segment index (simple linear). */
  slope: number;
  /** Longest run of consecutive positive segments. */
  longestPositiveRun: number;
  /** Longest run of consecutive negative segments. */
  longestNegativeRun: number;
  /** Volatility: avg absolute change between consecutive segments (0–1 scale). */
  volatility: number;
  /** Segment index where trend is best / worst (optional). */
  peakIndex?: number;
  troughIndex?: number;
}

/** Single clarity score (0–100) with optional breakdown. */
export interface ClarityScore {
  /** 0–100, higher = clearer. */
  score: number;
  /** Letter-style grade (e.g. A, B, C). */
  grade: string;
  breakdown: {
    readability: number;   // 0–10 contribution
    complexity: number;   // inverse, 0–10
    jargonPenalty: number;
    ambiguityPenalty: number;
  };
}

/** Behavioral signals derived from segment lengths and counts. */
export interface BehavioralSignals {
  /** Average segment length (characters). */
  avgSegmentLength: number;
  /** Short segments (<= 50 chars) ratio. */
  shortSegmentRatio: number;
  /** Long segments (>= 200 chars) ratio. */
  longSegmentRatio: number;
  /** Std dev of segment lengths (spread). */
  lengthStdDev: number;
  /** Total segment count. */
  segmentCount: number;
  /** Total character count. */
  totalLength: number;
  /** Signal: many short messages (e.g. chatty). */
  isChatty: boolean;
  /** Signal: many long messages (e.g. essay-like). */
  isEssayLike: boolean;
}

/** Single insight summary for UI or reports. */
export interface InsightSummary {
  type: 'emotional_trend' | 'clarity' | 'behavioral' | 'tone_shift';
  summary: string;
  severity?: 'high' | 'medium' | 'low';
  /** Optional metric value for display. */
  value?: number | string;
}

/** Result of processing sentiment results into analytics (trend, clarity score, behavioral, summaries). */
export interface ProcessedAnalytics {
  emotionalTrendAnalysis: EmotionalTrendAnalysis;
  clarityScore: ClarityScore;
  behavioralSignals: BehavioralSignals;
  insightSummaries: InsightSummary[];
}

/** Full engine output. */
export interface SentimentEngineResult {
  /** Overall sentiment score (-1 to 1). */
  sentimentScore: number;
  /** Per-segment scores. */
  sentimentBySegment: SegmentSentiment[];
  /** Detected tone shifts. */
  toneShifts: ToneShift[];
  /** Clarity metrics. */
  clarityIndicators: ClarityIndicators;
  /** Pre-shaped for dashboards and charts. */
  visualization: VisualizationInsights;
  /** Emotional trend analysis. */
  emotionalTrendAnalysis: EmotionalTrendAnalysis;
  /** Single clarity score (0–100). */
  clarityScore: ClarityScore;
  /** Behavioral signals. */
  behavioralSignals: BehavioralSignals;
  /** Insight summaries for UI/reports. */
  insightSummaries: InsightSummary[];
  /** Optional: segments used (echo for debugging). */
  segmentCount: number;
}
