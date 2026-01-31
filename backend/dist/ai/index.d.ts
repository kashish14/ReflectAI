/**
 * AI integration layer: run full analysis (preprocess → pipelines → aggregate).
 * Content in memory only; not logged or persisted by this layer.
 */
import type { RunAnalysisOutput } from './types';
export interface RunAnalysisOptions {
    modelVersion: string;
}
export declare function runAnalysis(content: string, options: RunAnalysisOptions): Promise<RunAnalysisOutput>;
export { preprocess } from './preprocessing';
export { runSentimentPipeline } from './pipelines/sentiment';
export { runClarityPipeline } from './pipelines/clarity';
export { runBehavioralPipeline } from './pipelines/behavioral';
export * from './types';
//# sourceMappingURL=index.d.ts.map