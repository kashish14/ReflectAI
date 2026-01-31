import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type InsightCardTrend = 'up' | 'down' | 'neutral' | null;

@Component({
  selector: 'app-insight-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insight-card.component.html',
  styleUrl: './insight-card.component.scss',
})
export class InsightCardComponent {
  /** Card title (e.g. "Overall sentiment") */
  title = input.required<string>();

  /** Primary value to display (e.g. "72% positive") */
  value = input.required<string>();

  /** Optional trend for delta or direction */
  trend = input<InsightCardTrend>(null);

  /** Optional trend label (e.g. "vs last week") */
  trendLabel = input<string | null>(null);

  /** Optional icon name or emoji for visual cue */
  icon = input<string | null>(null);

  /** Optional subtitle or description */
  subtitle = input<string | null>(null);

  /** Accent style: default, positive, neutral, negative */
  variant = input<'default' | 'positive' | 'neutral' | 'negative'>('default');

  /** Optional link (e.g. to detail view) */
  link = input<string | null>(null);
}
