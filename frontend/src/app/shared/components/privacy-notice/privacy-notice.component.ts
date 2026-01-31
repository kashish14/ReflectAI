import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-notice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-notice.component.html',
  styleUrl: './privacy-notice.component.scss',
})
export class PrivacyNoticeComponent {
  /** Notice variant: banner (inline) or modal (overlay) */
  variant = input<'banner' | 'modal'>('banner');

  /** Optional title override */
  title = input<string | null>(null);

  /** Whether the notice can be dismissed by the user */
  dismissible = input<boolean>(true);

  /** Emitted when user dismisses the notice */
  dismissed = output<void>();

  readonly defaultTitle = 'Your privacy matters';
  readonly message =
    'ReflectAI processes your conversations only when you choose. We do not sell your data. You can export or delete your data anytime from the Privacy dashboard.';

  onDismiss(): void {
    this.dismissed.emit();
  }
}
