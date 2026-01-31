/**
 * Preprocessing: normalize content, split into messages.
 * No logging of content; in-memory only.
 */

import type { ConversationInput } from './types';

export function preprocess(content: string): ConversationInput {
  const normalized = content.trim().replace(/\r\n/g, '\n');
  const messages = normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (messages.length === 0) {
    messages.push(normalized || '(empty)');
  }

  return { messages };
}
