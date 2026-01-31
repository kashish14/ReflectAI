/**
 * Dashboard / insights models — aligned with GET /v1/insights/overview.
 */
export interface RecentAnalysisItem {
  id: string;
  conversation_id: string;
  status: string;
  created_at: string;
  completed_at?: string | null;
}

export interface InsightsOverview {
  analyses_count: number;
  completed_count: number;
  recent_analyses: RecentAnalysisItem[];
  /** Optional: sentiment trend by period (e.g. last 7 days) */
  trend_buckets?: Array<{ label: string; positive: number; negative: number; neutral: number }>;
}
