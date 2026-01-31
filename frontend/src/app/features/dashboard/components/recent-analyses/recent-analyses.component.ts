import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { RecentAnalysisItem } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-recent-analyses',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recent-analyses.component.html',
  styleUrl: './recent-analyses.component.scss',
})
export class RecentAnalysesComponent {
  /** Recent analyses from overview; empty array when loading or none */
  items = input.required<RecentAnalysisItem[]>();

  /** Whether overview is still loading */
  loading = input<boolean>(false);

  formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { dateStyle: 'short' });
    } catch {
      return iso;
    }
  }

  statusVariant(status: string): 'default' | 'positive' | 'neutral' | 'negative' {
    switch (status) {
      case 'completed':
        return 'positive';
      case 'failed':
        return 'negative';
      default:
        return 'neutral';
    }
  }
}
