/**
 * Conversation model — aligns with backend /v1/conversations contract.
 * No raw content or PII in list/detail responses beyond what user consented to.
 */
export interface Conversation {
  id: string;
  user_id: string;
  source: 'manual' | 'slack' | 'gmail' | string;
  metadata?: {
    timestamps?: string[];
    participants?: string[];
  };
  created_at: string;
  /** First line of the conversation, when raw content is stored. */
  preview?: string;
}

export interface CreateConversationRequest {
  content: string;
}
