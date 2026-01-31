import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConversationService } from '../../services/conversation.service';
import type { Conversation } from '../../../../models/conversation.model';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.scss',
})
export class ConversationListComponent implements OnInit {
  private readonly conversationService = inject(ConversationService);

  conversations = signal<(Conversation & { tenant_id?: string })[]>([]);
  loading = signal(true);
  nextCursor = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.conversationService.list({ limit: 20 }).subscribe({
      next: (res) => {
        this.conversations.set(res.data);
        this.nextCursor.set(res.next_cursor);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short' });
    } catch {
      return iso;
    }
  }
}
