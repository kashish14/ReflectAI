import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { interval, Subscription, switchMap, takeWhile } from 'rxjs';
import { AnalysisService } from '../../services/analysis.service';
import { AnalysisStatusComponent } from '../analysis-status/analysis-status.component';
import { SentimentSummaryComponent } from '../sentiment-summary/sentiment-summary.component';
import { ClarityMetricsComponent } from '../clarity-metrics/clarity-metrics.component';
import { SentimentTrendVisualizationComponent } from '../sentiment-trend-visualization/sentiment-trend-visualization.component';
import type { Analysis } from '../../../../models/analysis.model';
import type { SentimentTrendPoint } from '../../../../models/sentiment-trend.model';

@Component({
  selector: 'app-analysis-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AnalysisStatusComponent,
    SentimentSummaryComponent,
    ClarityMetricsComponent,
    SentimentTrendVisualizationComponent,
  ],
  templateUrl: './analysis-detail-page.component.html',
  styleUrl: './analysis-detail-page.component.scss',
})
export class AnalysisDetailPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly analysisService = inject(AnalysisService);

  id = '';
  analysis = signal<Analysis | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  private pollSub: Subscription | null = null;

  status = computed(() => this.analysis()?.status ?? null);
  isComplete = computed(() => {
    const s = this.analysis()?.status;
    return s === 'completed' || s === 'failed';
  });

  /** Trend points from analysis results (one per message or aggregated). */
  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium' });
    } catch {
      return iso;
    }
  }

  trendPoints = computed<SentimentTrendPoint[]>(() => {
    const a = this.analysis();
    const scores = a?.results?.sentiment?.scores;
    if (!scores?.length) return [];
    return scores.map((s, i) => {
      const label = s.label?.toLowerCase() ?? 'neutral';
      return {
        label: String(i + 1),
        positive: label === 'positive' ? 1 : 0,
        negative: label === 'negative' ? 1 : 0,
        neutral: label === 'neutral' ? 1 : 0,
      };
    });
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.id) {
      this.loading.set(false);
      return;
    }
    this.fetch();
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  fetch(): void {
    this.loading.set(true);
    this.error.set(null);
    this.analysisService.getById(this.id).subscribe({
      next: (a) => {
        this.analysis.set(a);
        this.loading.set(false);
        if (a && !this.isComplete()) this.startPolling();
      },
      error: () => {
        this.error.set('Analysis not found');
        this.loading.set(false);
      },
    });
  }

  private startPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = interval(2000)
      .pipe(
        switchMap(() => this.analysisService.getById(this.id)),
        takeWhile((a) => a != null && a.status !== 'completed' && a.status !== 'failed', true)
      )
      .subscribe((a) => {
        if (a) this.analysis.set(a);
      });
  }
}
