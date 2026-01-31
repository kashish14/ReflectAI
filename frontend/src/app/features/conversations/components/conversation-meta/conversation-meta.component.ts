import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conversation-meta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversation-meta.component.html',
  styleUrl: './conversation-meta.component.scss',
})
export class ConversationMetaComponent {
  /** Conversation ID (full) */
  id = input.required<string>();
  /** Created at ISO string */
  createdAt = input.required<string>();
  /** Source (e.g. manual, slack) */
  source = input.required<string>();

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium' });
    } catch {
      return iso;
    }
  }
}
