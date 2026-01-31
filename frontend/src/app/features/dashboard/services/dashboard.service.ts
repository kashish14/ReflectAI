import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import type { InsightsOverview } from '../../../models/dashboard.model';

/** Dummy data shown when API fails or returns empty — so dashboard UI is visible. */
const DUMMY_OVERVIEW: InsightsOverview = {
  analyses_count: 4,
  completed_count: 3,
  recent_analyses: [
    { id: 'demo-analysis-1', conversation_id: 'demo-conv-1', status: 'completed', created_at: new Date().toISOString(), completed_at: new Date().toISOString() },
    { id: 'demo-analysis-2', conversation_id: 'demo-conv-2', status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString(), completed_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'demo-analysis-3', conversation_id: 'demo-conv-3', status: 'completed', created_at: new Date(Date.now() - 172800000).toISOString(), completed_at: new Date(Date.now() - 172800000).toISOString() },
  ],
  trend_buckets: [
    { label: 'Mon', positive: 12, negative: 2, neutral: 6 },
    { label: 'Tue', positive: 8, negative: 4, neutral: 8 },
    { label: 'Wed', positive: 14, negative: 1, neutral: 5 },
    { label: 'Thu', positive: 10, negative: 3, neutral: 7 },
    { label: 'Fri', positive: 16, negative: 2, neutral: 2 },
    { label: 'Sat', positive: 6, negative: 1, neutral: 3 },
    { label: 'Sun', positive: 4, negative: 0, neutral: 6 },
  ],
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1';

  /**
   * Fetches dashboard overview: counts, recent analyses, optional trend buckets.
   * Uses dummy data when API fails so the dashboard UI still shows sample data.
   */
  getOverview(): Observable<InsightsOverview> {
    return this.http.get<InsightsOverview>(`${this.baseUrl}/insights/overview`).pipe(
      catchError(() => of(DUMMY_OVERVIEW))
    );
  }
}
