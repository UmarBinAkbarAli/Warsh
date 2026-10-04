// Corpus uses Uthmani spelling and sometimes joins a vocative to its word.
// Imlaei Arabic separates those tokens. Align the whole surface, never a root.
export function alignmentLetters(text: string) {
  return text.replace(/ٱلَّيْل/g, "ٱللَّيْل").normalize("NFC").replace(/_#/g, "ء").replace(/[اي]@/g, "").replace(/هِ\./g, "هِ").replace(/\./g, "ي")
    .replace(/ىٰ/g, "ا").replace(/وٰ/g, "ا").replace(/ٰ/g, "ا")
    .replace(/[\u064B-\u065F\u06D6-\u06EDـ^_#@,\[\]\s]/g, "")
    .replace(/[ٱآ]/g, "ا").replace(/ى/g, "ي").replace(/[أإئؤ]/g, "ء").replace(/ءا/g, "ا").replace(/وا$/g, "و");
}
export function alignCorpusOccurrence(arabic: string, corpusSurface: string, segment: string, corpusPosition: number): number {
  const tokens = arabic.split(/\s+/);
  const needle = alignmentLetters(corpusSurface);
  const matches: { start: number; end: number }[] = [];
  for (let start = 0; start < tokens.length; start++) {
    for (let size = 1; size <= 3 && start + size <= tokens.length; size++) {
      if (alignmentLetters(tokens.slice(start, start + size).join("")) === needle) matches.push({ start, end: start + size });
    }
  }
  matches.sort((a, b) => Math.abs(a.start + 1 - corpusPosition) - Math.abs(b.start + 1 - corpusPosition));
  const best = matches[0];
  if (!best) throw new Error(`Cannot align corpus surface ${corpusSurface} in ${arabic}`);
  const stem = alignmentLetters(segment);
  for (let i = best.start; i < best.end; i++) if (alignmentLetters(tokens[i]).includes(stem)) return i + 1;
  throw new Error(`Cannot locate segment ${segment} in aligned surface ${corpusSurface}`);
}
