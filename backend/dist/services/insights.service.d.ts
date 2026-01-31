/**
 * Insights service: dashboard overview, trends, recent analyses.
 * Tenant-scoped; no PII in responses.
 */
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
    trend_buckets?: Array<{
        label: string;
        positive: number;
        negative: number;
        neutral: number;
    }>;
}
export declare class InsightsService {
    getOverview(tenantId: string, userId: string): Promise<InsightsOverview>;
    private buildTrendBuckets;
}
//# sourceMappingURL=insights.service.d.ts.map