import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-instructions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-instructions.component.html',
  styleUrl: './upload-instructions.component.scss',
})
export class UploadInstructionsComponent {
  /** Main instruction text */
  subtitle = input<string>(
    'Paste or type your conversation text (one message per line or your export format). Max 50,000 characters. We’ll create the conversation and start sentiment, clarity, and behavioral analysis—then take you to the analysis page.'
  );
  /** Show bullet tips */
  showTips = input<boolean>(true);
}
