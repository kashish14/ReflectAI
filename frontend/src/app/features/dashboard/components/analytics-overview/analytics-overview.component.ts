import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsightCardComponent } from '../../../../shared/components/insight-card/insight-card.component';
import type { InsightsOverview } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-analytics-overview',
  standalone: true,
  imports: [CommonModule, InsightCardComponent],
  templateUrl: './analytics-overview.component.html',
  styleUrl: './analytics-overview.component.scss',
})
export class AnalyticsOverviewComponent {
  /** Overview data from DashboardService.getOverview() */
  overview = input.required<InsightsOverview | null>();

  /** Completion rate 0–100 for display */
  completionRate(overview: InsightsOverview): number {
    if (overview.analyses_count === 0) return 0;
    return Math.round((overview.completed_count / overview.analyses_count) * 100);
  }
}
