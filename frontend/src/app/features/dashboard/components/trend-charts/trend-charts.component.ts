import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SentimentTrendVisualizationComponent } from '../../../analysis/components/sentiment-trend-visualization/sentiment-trend-visualization.component';
import type { SentimentTrendPoint } from '../../../../models/sentiment-trend.model';

@Component({
  selector: 'app-trend-charts',
  standalone: true,
  imports: [CommonModule, SentimentTrendVisualizationComponent],
  templateUrl: './trend-charts.component.html',
  styleUrl: './trend-charts.component.scss',
})
export class TrendChartsComponent {
  /** Trend data (e.g. from overview.trend_buckets or fallback sample) */
  data = input.required<SentimentTrendPoint[]>();

  /** Chart title */
  title = input<string>('Sentiment over time');
}
