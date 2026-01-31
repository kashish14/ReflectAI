import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConversationService } from '../../services/conversation.service';
import { AnalysisService } from '../../../analysis/services/analysis.service';
import { ConversationMetaComponent } from '../conversation-meta/conversation-meta.component';
import { ConversationAnalysisActionComponent } from '../conversation-analysis-action/conversation-analysis-action.component';
import type { Conversation } from '../../../../models/conversation.model';
import type { Analysis } from '../../../../models/analysis.model';

@Component({
  selector: 'app-conversation-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ConversationMetaComponent, ConversationAnalysisActionComponent],
  templateUrl: './conversation-detail-page.component.html',
  styleUrl: './conversation-detail-page.component.scss',
})
export class ConversationDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly conversationService = inject(ConversationService);
  private readonly analysisService = inject(AnalysisService);

  id = '';
  conversation = signal<(Conversation & { tenant_id?: string }) | null>(null);
  loading = signal(true);
  analyzing = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.id) {
      this.loading.set(false);
      return;
    }
    this.conversationService.getById(this.id).subscribe({
      next: (c) => {
        this.conversation.set(c);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Conversation not found');
        this.loading.set(false);
      },
    });
  }

  startAnalysis(): void {
    if (!this.id || this.analyzing()) return;
    this.analyzing.set(true);
    this.error.set(null);
    this.analysisService.create({ conversation_id: this.id }).subscribe({
      next: (a: Analysis | null) => {
        this.analyzing.set(false);
        if (a?.id) this.router.navigate(['/analysis', a.id]);
        else this.error.set('Failed to start analysis');
      },
      error: () => {
        this.analyzing.set(false);
        this.error.set('Failed to start analysis');
      },
    });
  }
}
