"use strict";
/**
 * Insights service: dashboard overview, trends, recent analyses.
 * Tenant-scoped; no PII in responses.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightsService = void 0;
const analysis_repository_1 = require("../repositories/analysis.repository");
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function getSentimentCounts(results) {
    const out = { positive: 0, negative: 0, neutral: 0 };
    if (!results?.sentiment?.scores?.length)
        return out;
    for (const s of results.sentiment.scores) {
        const l = (s.label ?? '').toLowerCase();
        if (l === 'positive')
            out.positive += 1;
        else if (l === 'negative')
            out.negative += 1;
        else
            out.neutral += 1;
    }
    return out;
}
class InsightsService {
    async getOverview(tenantId, userId) {
        const { data } = await analysis_repository_1.analysisRepository.list(tenantId, userId, { limit: 100 });
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
    buildTrendBuckets(completed) {
        const now = new Date();
        const buckets = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            buckets.push({ date: d, positive: 0, negative: 0, neutral: 0 });
        }
        for (const a of completed) {
            const completedAt = a.completed_at ? new Date(a.completed_at) : null;
            if (!completedAt)
                continue;
            const dayStart = new Date(completedAt);
            dayStart.setHours(0, 0, 0, 0);
            const bucket = buckets.find((b) => b.date.getTime() === dayStart.getTime());
            if (!bucket)
                continue;
            const counts = getSentimentCounts(a.results);
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
exports.InsightsService = InsightsService;
//# sourceMappingURL=insights.service.js.map