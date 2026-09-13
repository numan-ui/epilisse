import type { FaqChatEntry } from './parseFaqChat';

const STOPWORDS = new Set([
  'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer',
  'und', 'oder', 'ist', 'sind', 'wie', 'was', 'wo', 'wann', 'kann', 'ich', 'sie', 'es',
  'mit', 'für', 'von', 'zu', 'im', 'in', 'auf', 'bei', 'auch', 'nicht', 'gibt', 'man',
]);

/** Lowercase, fold German/Turkish diacritics, strip punctuation, collapse whitespace. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äàáâ]/g, 'a').replace(/[öò]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/ß/g, 'ss').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(text: string): string[] {
  return normalize(text).split(' ').filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/** Word-overlap score between the user's input and one FAQ entry's question. */
export function scoreMatch(userInput: string, entry: FaqChatEntry): number {
  const inputWords = new Set(tokens(userInput));
  if (inputWords.size === 0) return 0;
  const questionWords = tokens(entry.question);
  let hits = 0;
  for (const w of questionWords) {
    if (inputWords.has(w)) hits += 1;
  }
  return hits;
}

/** Best-scoring entry, or null if nothing clears the minimum-overlap threshold. */
export function findBestAnswer(userInput: string, entries: FaqChatEntry[]): FaqChatEntry | null {
  let best: FaqChatEntry | null = null;
  let bestScore = 0;
  for (const entry of entries) {
    const score = scoreMatch(userInput, entry);
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  return bestScore >= 1 ? best : null;
}
