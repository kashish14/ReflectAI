import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ConversationInputComponent } from '../conversation-input/conversation-input.component';
import { UploadInstructionsComponent } from '../upload-instructions/upload-instructions.component';
import { UploadHintComponent } from '../upload-hint/upload-hint.component';
import { ConversationService } from '../../services/conversation.service';
import { AnalysisService } from '../../../analysis/services/analysis.service';
import type { Analysis } from '../../../../models/analysis.model';

@Component({
  selector: 'app-conversation-upload-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ConversationInputComponent,
    UploadInstructionsComponent,
    UploadHintComponent,
  ],
  templateUrl: './conversation-upload-page.component.html',
  styleUrl: './conversation-upload-page.component.scss',
})
export class ConversationUploadPageComponent {
  private readonly router = inject(Router);
  private readonly conversationService = inject(ConversationService);
  private readonly analysisService = inject(AnalysisService);

  submitting = false;
  error: string | null = null;

  onSubmitted(payload: { content: string }): void {
    if (this.submitting) return;
    this.submitting = true;
    this.error = null;
    this.conversationService.create(payload.content).subscribe({
      next: (conv) => {
        if (!conv?.id) {
          this.error = 'Failed to create conversation';
          this.submitting = false;
          return;
        }
        this.analysisService.create({ conversation_id: conv.id }).subscribe({
          next: (analysis: Analysis | null) => {
            this.submitting = false;
            if (analysis?.id) this.router.navigate(['/analysis', analysis.id]);
            else this.error = 'Conversation saved. Start analysis from the conversation.';
          },
          error: () => {
            this.submitting = false;
            this.router.navigate(['/conversations', conv.id]);
          },
        });
      },
      error: () => {
        this.error = 'Failed to upload. Try again.';
        this.submitting = false;
      },
    });
  }

  onCancelled(): void {
    this.error = null;
  }
}
