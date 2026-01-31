import { NgModule } from '@angular/core';
import { ConversationInputComponent } from './components/conversation-input/conversation-input.component';

/**
 * Conversation input module — encapsulates upload/paste UI for conversation text.
 * Import in feature or app module for lazy-loaded or modular use.
 */
@NgModule({
  imports: [ConversationInputComponent],
  exports: [ConversationInputComponent],
})
export class ConversationInputModule {}
