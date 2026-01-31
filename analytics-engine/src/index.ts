/**
 * ReflectAI Sentiment Analysis Engine
 *
 * Modular engine that:
 * - Accepts text input (or pre-segmented messages)
 * - Returns sentiment score (per segment and aggregate)
 * - Detects tone shifts between segments
 * - Generates clarity indicators and clarity score
 * - Emotional trend analysis, behavioral signals, insight summaries
 * - Prepares insights for visualization
 */

import { preprocess } from './preprocessing';
import { scoreSegments } from './sentiment/scorer';
import { aggregateSentiment } from './sentiment/aggregate';
import { detectToneShifts } from './tone-shift/detector';
import { generateClarityIndicators } from './clarity/indicators';
import { computeClarityScore } from './clarity/clarity-score';
import { analyzeEmotionalTrend } from './trends/emotional-trend';
import { computeBehavioralSignals } from './behavioral/signals';
import { buildVisualizationInsights } from './insights/for-visualization';
import { buildInsightSummaries } from './insights/summaries';
import type {
  EngineInput,
  SentimentEngineResult,
  ToneShiftOptions,
  ProcessedAnalytics,
  SegmentSentiment,
  ToneShift,
  ClarityIndicators,
} from './types';

export interface AnalyzeOptions {
  /** Tone shift detection options. */
  toneShift?: ToneShiftOptions;
}

/**
 * Run the full sentiment analysis pipeline.
 *
 * @param input - Raw text or text + pre-segmented messages
 * @param options - Optional: tone shift thresholds, etc.
 * @returns Sentiment score, emotional trend, clarity score, behavioral signals, insight summaries, visualization
 */
export function analyze(input: EngineInput, options: AnalyzeOptions = {}): SentimentEngineResult {
  const { segments } = preprocess(input.text, input.segments);

  const sentimentBySegment = scoreSegments(segments);
  const aggregate = aggregateSentiment(sentimentBySegment);
  const toneShifts = detectToneShifts(sentimentBySegment, options.toneShift);
  const clarityIndicators = generateClarityIndicators(segments);
  const clarityScore = computeClarityScore(clarityIndicators);
  const emotionalTrendAnalysis = analyzeEmotionalTrend({ sentimentBySegment, toneShifts });
  const behavioralSignals = computeBehavioralSignals(segments);
  const visualization = buildVisualizationInsights({
    bySegment: sentimentBySegment,
    toneShifts,
    clarityIndicators,
  });
  const insightSummaries = buildInsightSummaries({
    emotionalTrendAnalysis,
    clarityScore,
    behavioralSignals,
    toneShifts,
    segmentCount: segments.length,
  });

  return {
    sentimentScore: aggregate.overallScore,
    sentimentBySegment,
    toneShifts,
    clarityIndicators,
    visualization,
    emotionalTrendAnalysis,
    clarityScore,
    behavioralSignals,
    insightSummaries,
    segmentCount: segments.length,
  };
}

/** Synchronous entry: analyze(text) for simple use. */
export function analyzeText(text: string, options?: AnalyzeOptions): SentimentEngineResult {
  return analyze({ text }, options);
}

/**
 * Process existing conversation sentiment results and generate analytics:
 * emotional trend analysis, clarity score, behavioral signals, insight summaries.
 * Use when sentiment comes from another source (e.g. API, stored analysis).
 *
 * @param sentimentResult - Sentiment-by-segment, tone shifts, clarity indicators
 * @param segments - Optional: raw segment texts (required for behavioral signals and full clarity)
 */
export function processSentimentResults(
  sentimentResult: {
    sentimentBySegment: SegmentSentiment[];
    toneShifts: ToneShift[];
    clarityIndicators: ClarityIndicators;
  },
  segments?: string[]
): ProcessedAnalytics {
  const { sentimentBySegment, toneShifts, clarityIndicators } = sentimentResult;
  const emotionalTrendAnalysis = analyzeEmotionalTrend({ sentimentBySegment, toneShifts });
  const clarityScore = computeClarityScore(clarityIndicators);
  const behavioralSignals = computeBehavioralSignals(segments ?? []);
  const insightSummaries = buildInsightSummaries({
    emotionalTrendAnalysis,
    clarityScore,
    behavioralSignals,
    toneShifts,
    segmentCount: sentimentBySegment.length,
  });

  return {
    emotionalTrendAnalysis,
    clarityScore,
    behavioralSignals,
    insightSummaries,
  };
}

export { preprocess } from './preprocessing';
export { scoreSegment, scoreSegments } from './sentiment/scorer';
export { aggregateSentiment } from './sentiment/aggregate';
export { detectToneShifts } from './tone-shift/detector';
export { generateClarityIndicators } from './clarity/indicators';
export { computeClarityScore } from './clarity/clarity-score';
export { analyzeEmotionalTrend } from './trends/emotional-trend';
export { computeBehavioralSignals } from './behavioral/signals';
export { buildVisualizationInsights } from './insights/for-visualization';
export { buildInsightSummaries } from './insights/summaries';
export * from './types';
