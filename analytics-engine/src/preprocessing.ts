/**
 * Preprocessing: normalize text and split into segments (messages/sentences).
 */

export interface PreprocessedInput {
  segments: string[];
  rawLength: number;
}

const DEFAULT_SPLIT = /\n+/;

/**
 * Normalize and segment text. If segments provided, use them; else split by newlines.
 */
export function preprocess(text: string, segments?: string[]): PreprocessedInput {
  const normalized = text.trim().replace(/\r\n/g, '\n');
  const rawLength = normalized.length;

  if (segments != null && segments.length > 0) {
    const trimmed = segments.map((s) => s.trim()).filter((s) => s.length > 0);
    return { segments: trimmed.length > 0 ? trimmed : [normalized || '(empty)'], rawLength };
  }

  const parts = normalized.split(DEFAULT_SPLIT).map((s) => s.trim()).filter((s) => s.length > 0);
  const segmentsOut = parts.length > 0 ? parts : [normalized || '(empty)'];
  return { segments: segmentsOut, rawLength };
}
