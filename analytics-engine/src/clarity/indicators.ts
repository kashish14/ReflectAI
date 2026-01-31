/**
 * Clarity indicators: readability, complexity, jargon, ambiguity.
 * No external API; no logging of content.
 */

import type { ClarityIndicators } from '../types';

const JARGON_PATTERNS = /\b(synergy|leverage|bandwidth|circle back|move the needle|low-hanging fruit|touch base|reach out|pivot|disrupt)\b/gi;
const AMBIGUITY_PATTERNS = [
  /\b(maybe|perhaps|might|could|possibly)\b/gi,
  /\b(it depends|unclear|not sure)\b/gi,
  /\?\s*$/m,
];

function countSentences(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  const matches = trimmed.match(/[.!?]+/g);
  return matches ? matches.length : 1;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

/** Readability: 0–10, higher = easier to read. */
function readabilityScore(words: number, sentences: number): number {
  if (sentences === 0) return 5;
  const avgWordsPerSentence = words / sentences;
  if (avgWordsPerSentence <= 10) return 10;
  if (avgWordsPerSentence <= 15) return 8;
  if (avgWordsPerSentence <= 20) return 6;
  return Math.max(1, 6 - (avgWordsPerSentence - 20) / 5);
}

/** Complexity: 0–10, higher = more complex (long sentences, jargon). */
function complexityScore(
  avgSentenceLength: number,
  jargonCount: number,
  wordCount: number
): number {
  let score = 0;
  if (avgSentenceLength > 20) score += 3;
  if (avgSentenceLength > 30) score += 2;
  const jargonRatio = wordCount > 0 ? jargonCount / wordCount : 0;
  if (jargonRatio > 0.02) score += 3;
  if (jargonRatio > 0.05) score += 2;
  return Math.min(10, score);
}

function countJargon(text: string): number {
  const lower = text.toLowerCase();
  let count = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(JARGON_PATTERNS.source, 'gi');
  while ((m = re.exec(lower)) !== null) count++;
  return count;
}

function collectAmbiguityFlags(text: string): string[] {
  const flags: string[] = [];
  if (new RegExp(AMBIGUITY_PATTERNS[0].source, 'gi').test(text)) flags.push('hedging_language');
  if (new RegExp(AMBIGUITY_PATTERNS[1].source, 'gi').test(text)) flags.push('uncertainty_phrases');
  if (AMBIGUITY_PATTERNS[2].test(text)) flags.push('question_ending');
  return [...new Set(flags)];
}

/**
 * Generate clarity indicators for a list of segments (joined as full text).
 */
export function generateClarityIndicators(segments: string[]): ClarityIndicators {
  const fullText = segments.join(' ');
  const wordCount = countWords(fullText);
  const sentenceCount = Math.max(1, countSentences(fullText));
  const avgSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10;
  const readability = Math.round(readabilityScore(wordCount, sentenceCount) * 10) / 10;
  const jargonCount = countJargon(fullText);
  const complexity = Math.round(
    complexityScore(avgSentenceLength, jargonCount, wordCount) * 10
  ) / 10;
  const ambiguityFlags = collectAmbiguityFlags(fullText);

  const longSentences = wordCount / sentenceCount > 25;
  const longMessages = segments.some((s) => s.length > 500);
  if (longSentences) ambiguityFlags.push('long_sentences');
  if (longMessages) ambiguityFlags.push('long_messages');

  return {
    readability,
    avgSentenceLength,
    complexityScore: complexity,
    jargonCount,
    ambiguityFlags: [...new Set(ambiguityFlags)],
    sentenceCount,
    wordCount,
  };
}
