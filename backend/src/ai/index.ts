/**
 * AI integration layer: run full analysis (preprocess → pipelines → aggregate).
 * Content in memory only; not logged or persisted by this layer.
 */

import { preprocess } from './preprocessing';
import { runSentimentPipeline } from './pipelines/sentiment';
import { runClarityPipeline } from './pipelines/clarity';
import { runBehavioralPipeline } from './pipelines/behavioral';
import type { RunAnalysisOutput, AnalysisResult } from './types';

export interface RunAnalysisOptions {
  modelVersion: string;
}

export function runAnalysis(
  content: string,
  options: RunAnalysisOptions
): Promise<RunAnalysisOutput> {
  const input = preprocess(content);
  const { messages } = input;

  const sentiment = runSentimentPipeline(messages);
  const clarity = runClarityPipeline(messages);
  const behavioral = runBehavioralPipeline(messages);

  const results: AnalysisResult = {
    sentiment,
    clarity,
    behavioral,
  };

  return Promise.resolve({
    results,
    model_version: options.modelVersion,
  });
}

export { preprocess } from './preprocessing';
export { runSentimentPipeline } from './pipelines/sentiment';
export { runClarityPipeline } from './pipelines/clarity';
export { runBehavioralPipeline } from './pipelines/behavioral';
export * from './types';
