import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { AnalysisStatus } from '../../../../models/analysis.model';

@Component({
  selector: 'app-analysis-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analysis-status.component.html',
  styleUrl: './analysis-status.component.scss',
})
export class AnalysisStatusComponent {
  status = input.required<AnalysisStatus>();
  /** Optional message (e.g. for failed) */
  message = input<string | null>(null);
}
