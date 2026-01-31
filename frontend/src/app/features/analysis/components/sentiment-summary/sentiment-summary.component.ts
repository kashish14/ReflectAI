import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Analysis } from '../../../../models/analysis.model';

@Component({
  selector: 'app-sentiment-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sentiment-summary.component.html',
  styleUrl: './sentiment-summary.component.scss',
})
export class SentimentSummaryComponent {
  /** Analysis results (sentiment section only used) */
  analysis = input.required<Analysis | null>();
}
