import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Analysis } from '../../../../models/analysis.model';

@Component({
  selector: 'app-clarity-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clarity-metrics.component.html',
  styleUrl: './clarity-metrics.component.scss',
})
export class ClarityMetricsComponent {
  /** Analysis results (clarity section only used) */
  analysis = input.required<Analysis | null>();
}
