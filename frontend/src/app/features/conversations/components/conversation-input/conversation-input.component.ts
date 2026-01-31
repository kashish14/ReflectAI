import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-conversation-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation-input.component.html',
  styleUrl: './conversation-input.component.scss',
})
export class ConversationInputComponent {
  /** Emitted when user submits conversation text */
  submitted = output<{ content: string }>();

  /** Emitted when user cancels or clears */
  cancelled = output<void>();

  /** When true, submit button is disabled and shows busy state */
  submitting = input<boolean>(false);

  content = signal('');
  placeholder = signal('Paste or type your conversation here. Each line can be a message, or use a format your export provides (e.g. CSV).');
  maxLength = signal(50_000);
  showCancel = signal(true);
  submitLabel = signal('Analyze conversation');

  characterCount = computed(() => this.content().length);
  isOverLimit = computed(() => this.characterCount() > this.maxLength());
  canSubmit = computed(() => {
    if (this.submitting()) return false;
    const text = this.content().trim();
    return text.length > 0 && text.length <= this.maxLength();
  });

  onSubmit(): void {
    if (!this.canSubmit()) return;
    this.submitted.emit({ content: this.content().trim() });
  }

  onCancel(): void {
    this.content.set('');
    this.cancelled.emit();
  }
}
