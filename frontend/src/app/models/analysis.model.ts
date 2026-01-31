/**
 * Analysis model — aligns with backend /v1/analyses contract.
 * Status is polled until 'completed' or 'failed'; results populated when completed.
 */
export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface SentimentScore {
  message_index?: number;
  label: 'positive' | 'negative' | 'neutral';
  score?: number;
}

export interface Analysis {
  id: string;
  conversation_id: string;
  status: AnalysisStatus;
  results?: {
    sentiment?: {
      scores?: SentimentScore[];
      aggregate?: string;
      emotional_labels?: string[];
    };
    clarity?: {
      readability?: number;
      flags?: string[];
    };
    behavioral?: {
      message_length_avg?: number;
      [key: string]: unknown;
    };
  };
  created_at: string;
  completed_at?: string;
}

export interface CreateAnalysisRequest {
  conversation_id: string;
  idempotency_key?: string;
}
