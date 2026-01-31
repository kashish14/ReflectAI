/**
 * Insight summaries: short, structured summaries for UI and reports.
 */

import type {
  EmotionalTrendAnalysis,
  ClarityScore,
  BehavioralSignals,
  ToneShift,
  InsightSummary,
} from '../types';

export interface BuildSummariesInput {
  emotionalTrendAnalysis: EmotionalTrendAnalysis;
  clarityScore: ClarityScore;
  behavioralSignals: BehavioralSignals;
  toneShifts: ToneShift[];
  segmentCount: number;
}

/**
 * Build insight summaries from analytics outputs.
 */
export function buildInsightSummaries(input: BuildSummariesInput): InsightSummary[] {
  const summaries: InsightSummary[] = [];
  const {
    emotionalTrendAnalysis,
    clarityScore,
    behavioralSignals,
    toneShifts,
    segmentCount,
  } = input;

  // Emotional trend
  if (emotionalTrendAnalysis.direction !== 'stable') {
    const severity =
      emotionalTrendAnalysis.strength > 0.5 ? 'high' : emotionalTrendAnalysis.strength > 0.2 ? 'medium' : 'low';
    summaries.push({
      type: 'emotional_trend',
      summary:
        emotionalTrendAnalysis.direction === 'improving'
          ? `Sentiment improves over the conversation (${segmentCount} segments).`
          : `Sentiment declines over the conversation (${segmentCount} segments).`,
      severity,
      value: emotionalTrendAnalysis.direction,
    });
  } else if (segmentCount > 1) {
    summaries.push({
      type: 'emotional_trend',
      summary: `Sentiment remains relatively stable across ${segmentCount} segments.`,
      value: 'stable',
    });
  }

  if (emotionalTrendAnalysis.volatility > 0.4) {
    summaries.push({
      type: 'emotional_trend',
      summary: `High emotional volatility detected (${(emotionalTrendAnalysis.volatility * 100).toFixed(0)}% avg change between segments).`,
      severity: 'high',
      value: emotionalTrendAnalysis.volatility,
    });
  }

  // Clarity
  summaries.push({
    type: 'clarity',
    summary:
      clarityScore.score >= 80
        ? `Clarity score: ${clarityScore.score}/100 (${clarityScore.grade}). Communication is clear.`
        : clarityScore.score >= 60
          ? `Clarity score: ${clarityScore.score}/100 (${clarityScore.grade}). Consider simplifying long sentences or reducing jargon.`
          : `Clarity score: ${clarityScore.score}/100 (${clarityScore.grade}). Low clarity; review readability and ambiguity.`,
    severity: clarityScore.score >= 80 ? 'low' : clarityScore.score >= 60 ? 'medium' : 'high',
    value: `${clarityScore.score} (${clarityScore.grade})`,
  });

  // Behavioral
  if (behavioralSignals.isChatty) {
    summaries.push({
      type: 'behavioral',
      summary: `Short, chatty message style (avg ${behavioralSignals.avgSegmentLength} chars; ${(behavioralSignals.shortSegmentRatio * 100).toFixed(0)}% short segments).`,
      value: 'chatty',
    });
  }
  if (behavioralSignals.isEssayLike) {
    summaries.push({
      type: 'behavioral',
      summary: `Long-form style (avg ${behavioralSignals.avgSegmentLength} chars; ${(behavioralSignals.longSegmentRatio * 100).toFixed(0)}% long segments).`,
      value: 'essay_like',
    });
  }
  if (!behavioralSignals.isChatty && !behavioralSignals.isEssayLike && segmentCount > 0) {
    summaries.push({
      type: 'behavioral',
      summary: `Mixed message lengths (avg ${behavioralSignals.avgSegmentLength} chars, ${segmentCount} segments).`,
      value: behavioralSignals.avgSegmentLength,
    });
  }

  // Tone shifts
  if (toneShifts.length > 0) {
    const declining = toneShifts.filter((t) => t.direction === 'declining').length;
    const improving = toneShifts.filter((t) => t.direction === 'improving').length;
    const severity = toneShifts.length >= 3 ? 'high' : toneShifts.length >= 1 ? 'medium' : 'low';
    summaries.push({
      type: 'tone_shift',
      summary: `${toneShifts.length} tone shift(s) detected (${improving} improving, ${declining} declining).`,
      severity,
      value: toneShifts.length,
    });
  }

  return summaries;
}
