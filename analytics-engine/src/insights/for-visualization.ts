/**
 * Prepare insights for visualization: time series, aggregates, stacked data.
 */

import type {
  SegmentSentiment,
  ToneShift,
  ClarityIndicators,
  SentimentAggregate,
  SentimentTimeSeriesPoint,
  VisualizationInsights,
  SentimentLabel,
} from '../types';
import { aggregateSentiment } from '../sentiment/aggregate';

export interface BuildVisualizationInput {
  bySegment: SegmentSentiment[];
  toneShifts: ToneShift[];
  clarityIndicators: ClarityIndicators;
}

/**
 * Build visualization-ready payload: time series, aggregate summary, distribution, tone shifts.
 */
export function buildVisualizationInsights(input: BuildVisualizationInput): VisualizationInsights {
  const { bySegment, toneShifts, clarityIndicators } = input;
  const aggregateSummary = aggregateSentiment(bySegment);

  const timeSeriesData: SentimentTimeSeriesPoint[] = bySegment.map((seg, i) => {
    const preceding = bySegment.slice(0, i + 1);
    const cumulativeAvg =
      preceding.length === 0
        ? seg.score
        : preceding.reduce((s, p) => s + p.score, 0) / preceding.length;
    return {
      index: seg.index,
      score: seg.score,
      label: seg.label,
      cumulativeAvg: Math.round(cumulativeAvg * 100) / 100,
    };
  });

  const sentimentDistribution = {
    positive: aggregateSummary.positiveRatio,
    negative: aggregateSummary.negativeRatio,
    neutral: aggregateSummary.neutralRatio,
  };

  const segmentStackedData = bySegment.map((seg) => ({
    index: seg.index,
    positive: seg.label === 'positive' ? 1 : 0,
    neutral: seg.label === 'neutral' ? 1 : 0,
    negative: seg.label === 'negative' ? 1 : 0,
  }));

  return {
    timeSeriesData,
    aggregateSummary,
    sentimentDistribution,
    toneShifts,
    clarityIndicators,
    segmentStackedData,
  };
}
