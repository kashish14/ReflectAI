# ReflectAI Sentiment Analysis Engine

Modular sentiment analysis engine for ReflectAI. It:

- **Accepts text input** — Raw text or pre-segmented messages
- **Returns sentiment score** — Per-segment score (-1 to 1) and aggregate
- **Detects tone shifts** — Significant sentiment changes between consecutive segments
- **Generates clarity indicators and clarity score** — Readability, complexity, jargon; single 0–100 score + grade
- **Emotional trend analysis** — Direction (improving/declining/stable), strength, runs, volatility
- **Behavioral signals** — Segment length stats, chatty vs essay-like
- **Insight summaries** — Short, structured summaries for UI and reports
- **Prepares insights for visualization** — Time-series data, aggregates, stacked bar data

## Usage

```ts
import { analyze, analyzeText, processSentimentResults } from '@reflectai/analytics-engine';

// Full pipeline: raw text
const result = analyzeText(
  "This is great! I'm so happy.\nBut wait, this is frustrating."
);

console.log(result.sentimentScore);           // aggregate -1 to 1
console.log(result.sentimentBySegment);       // per-segment scores
console.log(result.toneShifts);               // detected shifts
console.log(result.clarityIndicators);        // readability, jargon, ambiguity
console.log(result.clarityScore);             // 0–100 score + grade (e.g. A, B)
console.log(result.emotionalTrendAnalysis);  // direction, strength, volatility
console.log(result.behavioralSignals);        // avg length, chatty/essay-like
console.log(result.insightSummaries);         // short summaries for UI
console.log(result.visualization);            // timeSeriesData, aggregateSummary, etc.
```

Process existing sentiment results (e.g. from API):

```ts
const processed = processSentimentResults(
  {
    sentimentBySegment: [...],
    toneShifts: [...],
    clarityIndicators: { ... },
  },
  segments  // optional: raw segment texts for behavioral signals
);
// → { emotionalTrendAnalysis, clarityScore, behavioralSignals, insightSummaries }
```

## Output Shape

| Field | Description |
|-------|-------------|
| `sentimentScore` | Overall score (-1 to 1) |
| `sentimentBySegment` | `{ index, score, label, confidence? }[]` |
| `toneShifts` | `{ fromIndex, toIndex, fromScore, toScore, magnitude, direction }[]` |
| `clarityIndicators` | `readability`, `avgSentenceLength`, `complexityScore`, `jargonCount`, `ambiguityFlags` |
| `clarityScore` | `{ score: 0–100, grade: A–F, breakdown }` |
| `emotionalTrendAnalysis` | `{ direction, strength, slope, longestPositiveRun, longestNegativeRun, volatility }` |
| `behavioralSignals` | `{ avgSegmentLength, shortSegmentRatio, longSegmentRatio, isChatty, isEssayLike }` |
| `insightSummaries` | `{ type, summary, severity?, value? }[]` |
| `visualization` | `timeSeriesData`, `aggregateSummary`, `sentimentDistribution`, `segmentStackedData` |

## Structure

| Path | Purpose |
|------|---------|
| `src/index.ts` | Entry: `analyze(input)`, `analyzeText(text)`, `processSentimentResults(...)` |
| `src/preprocessing.ts` | Normalize and segment text |
| `src/sentiment/scorer.ts` | Numeric sentiment score per segment |
| `src/sentiment/aggregate.ts` | Overall score and distribution |
| `src/tone-shift/detector.ts` | Detect tone shifts (configurable magnitude) |
| `src/clarity/indicators.ts` | Readability, complexity, jargon, ambiguity |
| `src/clarity/clarity-score.ts` | Single 0–100 clarity score + grade |
| `src/trends/emotional-trend.ts` | Emotional trend analysis from sentiment + tone shifts |
| `src/behavioral/signals.ts` | Behavioral signals from segment lengths |
| `src/insights/for-visualization.ts` | Build chart-ready time series and aggregates |
| `src/insights/summaries.ts` | Build insight summaries for UI/reports |

## Options

- **Tone shift:** `analyze(input, { toneShift: { minMagnitude: 0.3, windowSize: 1 } })` — Minimum score delta to count as a shift; optional smoothing window.

## Build

```bash
npm install
npm run build
```

No runtime dependencies; TypeScript only for build.
