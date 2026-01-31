/**
 * Insights service: dashboard overview, trends, recent analyses.
 * Tenant-scoped; no PII in responses.
 */

import { analysisRepository } from '../repositories/analysis.repository';

export interface InsightsOverview {
  analyses_count: number;
  completed_count: number;
  recent_analyses: Array<{
    id: string;
    conversation_id: string;
    status: string;
    created_at: string;
    completed_at?: string | null;
  }>;
  /** Sentiment trend by period (e.g. last 7 days) for dashboard charts */
  trend_buckets?: Array<{ label: string; positive: number; negative: number; neutral: number }>;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getSentimentCounts(
  results: { sentiment?: { scores?: Array<{ label?: string }> } } | null | undefined
): { positive: number; negative: number; neutral: number } {
  const out = { positive: 0, negative: 0, neutral: 0 };
  if (!results?.sentiment?.scores?.length) return out;
  for (const s of results.sentiment.scores) {
    const l = (s.label ?? '').toLowerCase();
    if (l === 'positive') out.positive += 1;
    else if (l === 'negative') out.negative += 1;
    else out.neutral += 1;
  }
  return out;
}

export class InsightsService {
  async getOverview(tenantId: string, userId: string): Promise<InsightsOverview> {
    const { data } = await analysisRepository.list(tenantId, userId, { limit: 100 });
    const completed = data.filter((a) => a.status === 'completed');
    const recent = data.slice(0, 10).map((a) => ({
      id: a.id,
      conversation_id: a.conversation_id,
      status: a.status,
      created_at: a.created_at,
      completed_at: a.completed_at ?? undefined,
    }));

    const trend_buckets = this.buildTrendBuckets(completed);

    return {
      analyses_count: data.length,
      completed_count: completed.length,
      recent_analyses: recent,
      trend_buckets,
    };
  }

  private buildTrendBuckets(
    completed: Array<{ completed_at?: string | null; results?: unknown }>
  ): Array<{ label: string; positive: number; negative: number; neutral: number }> {
    const now = new Date();
    const buckets: Array<{ date: Date; positive: number; negative: number; neutral: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      buckets.push({ date: d, positive: 0, negative: 0, neutral: 0 });
    }
    for (const a of completed) {
      const completedAt = a.completed_at ? new Date(a.completed_at) : null;
      if (!completedAt) continue;
      const dayStart = new Date(completedAt);
      dayStart.setHours(0, 0, 0, 0);
      const bucket = buckets.find((b) => b.date.getTime() === dayStart.getTime());
      if (!bucket) continue;
      const counts = getSentimentCounts(a.results as Parameters<typeof getSentimentCounts>[0]);
      bucket.positive += counts.positive;
      bucket.negative += counts.negative;
      bucket.neutral += counts.neutral;
    }
    return buckets.map((b) => ({
      label: DAY_LABELS[b.date.getDay()],
      positive: b.positive,
      negative: b.negative,
      neutral: b.neutral,
    }));
  }
}
