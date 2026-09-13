export type FaqChatEntry = { question: string; answer: string };

/**
 * Parses admin-authored free text into Q&A pairs. Format (one or more blocks):
 *   F: <question>
 *   A: <answer, can span multiple lines until the next "F:">
 * Blocks with no F: or no A: are skipped. Case-insensitive on the "F:"/"A:" markers.
 */
export function parseFaqBlocks(raw: string): FaqChatEntry[] {
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  const entries: FaqChatEntry[] = [];
  let question: string | null = null;
  let answerLines: string[] = [];

  const flush = () => {
    const answer = answerLines.join('\n').trim();
    if (question && answer) entries.push({ question: question.trim(), answer });
    question = null;
    answerLines = [];
  };

  for (const line of lines) {
    const fMatch = line.match(/^\s*F\s*:\s*(.*)$/i);
    const aMatch = line.match(/^\s*A\s*:\s*(.*)$/i);
    if (fMatch) {
      flush();
      question = fMatch[1];
    } else if (aMatch) {
      answerLines = [aMatch[1]];
    } else if (question !== null && answerLines.length > 0) {
      answerLines.push(line);
    }
  }
  flush();

  return entries;
}
