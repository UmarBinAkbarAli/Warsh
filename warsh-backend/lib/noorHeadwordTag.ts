// The Noor reply card (Noor redesign, owner-approved 2026-10-22) shows the one
// Arabic word a reply is about, large, with Listen and Save word. The model names
// that word in a trailing tag; the tag stays in the stored reply so history can
// rebuild the card, and is stripped before any text reaches the app.

export const HEADWORD_INSTRUCTION =
  "\n\nWhen your reply is mainly about ONE specific Arabic word, end it with a final line exactly in this form: " +
  "⟦word: <that word in Arabic script with full harakat>⟧ — nothing after it. If the reply is about a rule, " +
  "a phrase, an ayah or several words, do not add this line.";

const TAG = /\s*⟦word:\s*([^⟧\n]{1,40})⟧\s*$/u;
const ARABIC_LETTER = /[ء-يٱ-ۓ]/u;
// Same marks load-core-500 strips to build VocabularyWord.arabicPlain.
const HARAKAT = /[ً-ْٰـ۟-۪ۨ-ۭ]/gu;

export function splitHeadword(reply: string): { content: string; headword: string | null } {
  const match = reply.match(TAG);
  if (!match) return { content: reply, headword: null };
  const content = reply.slice(0, match.index).trimEnd();
  const headword = match[1].trim();
  // A tag with no Arabic in it is the model misreading the instruction; drop it.
  return { content: content || reply, headword: ARABIC_LETTER.test(headword) ? headword : null };
}

const ARABIC_WORD = /[ء-ْٰٱ-ۓ]+/gu;

/** The one Arabic word in a learner's question, or null when there are none or several. */
export function singleArabicWord(text: string | null): string | null {
  const words = text?.match(ARABIC_WORD) ?? [];
  return words.length === 1 ? words[0] : null;
}

export function toArabicPlain(arabic: string): string {
  return arabic.replace(HARAKAT, "").trim();
}

/** arabicPlain keeps the definite article, so try the word with and without it. */
export function plainCandidates(arabic: string): string[] {
  const plain = toArabicPlain(arabic);
  const bare = plain.startsWith("ال") ? plain.slice(2) : plain;
  return Array.from(new Set([plain, bare, `ال${bare}`])).filter(Boolean);
}
