import type { FaqChatEntry } from './parseFaqChat';

// Covers all 3 content languages (de/en/tr) since entries are pooled together
// regardless of the visitor's language — a shared filler word (e.g. English
// "the") must never by itself count as a topical match between two otherwise
// unrelated questions.
const STOPWORDS = new Set([
  // German
  'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer',
  'und', 'oder', 'ist', 'sind', 'wie', 'was', 'wo', 'wann', 'kann', 'ich', 'sie', 'es',
  'mit', 'für', 'von', 'zu', 'im', 'in', 'auf', 'bei', 'auch', 'nicht', 'gibt', 'man',
  'sich', 'euch', 'eure', 'euer', 'ihr', 'wir', 'werden', 'haben', 'einer',
  // English
  'the', 'and', 'for', 'are', 'you', 'your', 'can', 'get', 'does', 'do', 'what',
  'where', 'when', 'how', 'much', 'many', 'about', 'with', 'that', 'this', 'have',
  'has', 'will', 'would', 'could', 'should', 'need', 'want', 'like', 'also', 'not',
  'from', 'into', 'our', 'their', 'there', 'here', 'i', 'me', 'my', 'we', 'us', 'is',
  // Turkish
  'bir', 've', 'veya', 'için', 'nasıl', 'nedir', 'ne', 'mi', 'mı', 'mu', 'mü',
  'ile', 'daha', 'kadar', 'olur', 'olan', 'siz', 'ben', 'bu', 'şu', 'de', 'da',
  'gibi', 'kaç', 'var', 'yok', 'çok', 'her',
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

/**
 * Best-scoring entry, or null if nothing clears the minimum-overlap
 * threshold. Requires at least 2 shared meaningful words for most questions
 * — a single shared word (even after stopword filtering) is too weak a
 * signal and previously caused false matches (e.g. a generic "services"
 * question landing on an unrelated FAQ entry). Very short questions (<=2
 * content words) only need to fully match, since demanding 2 would make them
 * unreachable.
 */
export function findBestAnswer(userInput: string, entries: FaqChatEntry[]): FaqChatEntry | null {
  let best: FaqChatEntry | null = null;
  let bestScore = 0;
  let bestQuestionWordCount = 0;

  for (const entry of entries) {
    const score = scoreMatch(userInput, entry);
    if (score > bestScore) {
      best = entry;
      bestScore = score;
      bestQuestionWordCount = tokens(entry.question).length;
    }
  }

  const threshold = bestQuestionWordCount <= 2 ? bestQuestionWordCount : 2;
  return bestScore >= Math.max(1, threshold) ? best : null;
}
