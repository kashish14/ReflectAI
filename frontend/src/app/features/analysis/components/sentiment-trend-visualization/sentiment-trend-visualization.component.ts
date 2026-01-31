import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SentimentTrendPoint } from '../../../../models/sentiment-trend.model';

@Component({
  selector: 'app-sentiment-trend-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sentiment-trend-visualization.component.html',
  styleUrl: './sentiment-trend-visualization.component.scss',
})
export class SentimentTrendVisualizationComponent {
  /** Trend data: one point per label (e.g. time or segment) */
  data = input.required<SentimentTrendPoint[]>();

  /** Chart title for accessibility */
  title = input<string>('Sentiment over time');

  /** Whether to show labels on the X axis */
  showLabels = input<boolean>(true);

  /** Maximum bar height (CSS value, e.g. 120px) */
  barHeight = input<string>('120px');

  /** Returns total count for a point (for bar proportions) */
  total(point: SentimentTrendPoint): number {
    return point.positive + point.negative + point.neutral || 1;
  }

  /** Proportion 0–1 for positive segment */
  positiveRatio(point: SentimentTrendPoint): number {
    return point.positive / this.total(point);
  }

  negativeRatio(point: SentimentTrendPoint): number {
    return point.negative / this.total(point);
  }

  neutralRatio(point: SentimentTrendPoint): number {
    return point.neutral / this.total(point);
  }
}
