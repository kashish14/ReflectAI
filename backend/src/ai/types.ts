/**
 * AI layer types: input and output. No PII in logs; content in memory only.
 */

export interface ConversationInput {
  messages: string[];
  timestamps?: string[];
}

export interface SentimentResult {
  scores: Array<{ message_index: number; label: 'positive' | 'negative' | 'neutral'; score?: number }>;
  aggregate?: string;
  emotional_labels?: string[];
}

export interface ClarityResult {
  readability?: number;
  flags?: string[];
}

export interface BehavioralResult {
  message_length_avg?: number;
  message_count?: number;
  [key: string]: unknown;
}

export interface AnalysisResult {
  sentiment?: SentimentResult;
  clarity?: ClarityResult;
  behavioral?: BehavioralResult;
}

export interface RunAnalysisOutput {
  results: AnalysisResult;
  model_version: string;
}
