import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-upload-hint',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './upload-hint.component.html',
  styleUrl: './upload-hint.component.scss',
})
export class UploadHintComponent {
  /** Hint text (can include placeholder for link) */
  text = input<string>(
    'After you click “Analyze conversation”, we save your text and run analysis. Results usually appear within a few seconds. You can also go to'
  );
  /** Link text (e.g. "Conversations") */
  linkText = input<string>('Conversations');
  /** Route for the link */
  linkRoute = input<string>('/conversations');
  /** Text after the link */
  textAfter = input<string>('and open any item to run analysis from there.');
}
