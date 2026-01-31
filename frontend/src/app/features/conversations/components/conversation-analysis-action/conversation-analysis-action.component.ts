import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conversation-analysis-action',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversation-analysis-action.component.html',
  styleUrl: './conversation-analysis-action.component.scss',
})
export class ConversationAnalysisActionComponent {
  /** Whether analysis is in progress */
  analyzing = input<boolean>(false);
  /** Optional error message to show */
  errorMessage = input<string | null>(null);
  /** Optional description override */
  description = input<string>(
    'Run sentiment, clarity, and behavioral analysis on this conversation. You’ll be redirected to the analysis page when the job starts.'
  );

  /** Emitted when user clicks Analyze */
  startAnalysis = output<void>();

  onStart(): void {
    if (!this.analyzing()) this.startAnalysis.emit();
  }
}
