/**
 * Sentiment pipeline: local lexicon-based scoring, no external API.
 * Each message gets a score in [-1, 1]; emotional labels come from keyword groups.
 * Never log input.
 */

import type { SentimentResult } from '../types';

const POSITIVE_WORDS = new Set(
  `good great happy love thanks thank amazing wonderful excellent positive yes glad hope best
  appreciate appreciated awesome nice helpful clear easy excited fixed passing loved enjoy
  welcome perfect fantastic brilliant pleased congrats congratulations`.split(/\s+/)
);
const NEGATIVE_WORDS = new Set(
  `bad terrible hate sad angry frustrated frustrating awful poor negative no not worst fail
  failed broke broken problem issue worried worry blocked late slipped miss missed unclear
  confusing confusion annoyed upset disappointed sorry`.split(/\s+/)
);

const EMOTIONS: Record<string, string[]> = {
  grateful: ['thanks', 'thank', 'appreciate', 'appreciated', 'grateful'],
  excited: ['excited', 'amazing', 'awesome', 'loved', 'love', 'fantastic'],
  frustrated: ['frustrated', 'frustrating', 'annoyed', 'broke', 'broken', 'slipped'],
  anxious: ['worried', 'worry', 'deadline', 'blocked', 'urgent'],
  apologetic: ['sorry', 'apologize', 'apologies'],
  inquisitive: ['question', 'can', 'could', 'review'],
};

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

function scoreMessage(words: string[]): number {
  let pos = 0;
  let neg = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) pos++;
    if (NEGATIVE_WORDS.has(w)) neg++;
  }
  const total = pos + neg;
  return total === 0 ? 0 : Math.round(((pos - neg) / total) * 100) / 100;
}

function toLabel(score: number): 'positive' | 'negative' | 'neutral' {
  if (score > 0.1) return 'positive';
  if (score < -0.1) return 'negative';
  return 'neutral';
}

export function runSentimentPipeline(messages: string[]): SentimentResult {
  const tokenized = messages.map(tokenize);
  const scores = tokenized.map((words, i) => {
    const score = scoreMessage(words);
    return { message_index: i, label: toLabel(score), score };
  });

  const mean = scores.length ? scores.reduce((s, x) => s + x.score, 0) / scores.length : 0;
  const allWords = new Set(tokenized.flat());
  const emotional_labels = Object.entries(EMOTIONS)
    .filter(([, keys]) => keys.some((k) => allWords.has(k)))
    .map(([label]) => label);

  return {
    scores,
    aggregate: toLabel(mean),
    emotional_labels,
  };
}
