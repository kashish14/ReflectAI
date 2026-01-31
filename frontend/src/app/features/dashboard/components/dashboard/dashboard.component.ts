import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout.component';
import { AnalyticsOverviewComponent } from '../analytics-overview/analytics-overview.component';
import { RecentAnalysesComponent } from '../recent-analyses/recent-analyses.component';
import { TrendChartsComponent } from '../trend-charts/trend-charts.component';
import { PrivacyNoticeComponent } from '../../../../shared/components/privacy-notice/privacy-notice.component';
import { DashboardService } from '../../services/dashboard.service';
import type { InsightsOverview } from '../../../../models/dashboard.model';
import type { SentimentTrendPoint } from '../../../../models/sentiment-trend.model';

const SAMPLE_TREND: SentimentTrendPoint[] = [
  { label: 'Mon', positive: 12, negative: 2, neutral: 6 },
  { label: 'Tue', positive: 8, negative: 4, neutral: 8 },
  { label: 'Wed', positive: 14, negative: 1, neutral: 5 },
  { label: 'Thu', positive: 10, negative: 3, neutral: 7 },
  { label: 'Fri', positive: 16, negative: 2, neutral: 2 },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    AnalyticsOverviewComponent,
    RecentAnalysesComponent,
    TrendChartsComponent,
    PrivacyNoticeComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  overview = signal<InsightsOverview | null>(null);
  loading = signal(true);
  privacyDismissed = signal(false);

  /** Trend data: from API or fallback sample */
  trendData = signal<SentimentTrendPoint[]>(SAMPLE_TREND);

  ngOnInit(): void {
    this.dashboardService.getOverview().subscribe({
      next: (o) => {
        this.overview.set(o);
        if (o.trend_buckets && o.trend_buckets.length > 0) {
          this.trendData.set(
            o.trend_buckets.map((b) => ({
              label: b.label,
              positive: b.positive,
              negative: b.negative,
              neutral: b.neutral,
            }))
          );
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPrivacyDismissed(): void {
    this.privacyDismissed.set(true);
  }
}
