// Automatic lesson checks for Warsh Studio's review screen.
//
// Every check here finds a mistake a reviewer would otherwise have to spot by
// reading each card: a card with no picture, Urdu that is a copy of the
// English, a noun after a preposition that keeps its ḍamma, a word that is
// only taught in a later lesson, and so on. Pure functions: the Studio runs
// them live while editing, and the server runs the same code to list problems
// on the review checklist and to refuse an approval while problems remain.

export type VocabIntro = {
  plain: string;
  lessonId: string;
  chapter: number;
  lesson: number;
  review: boolean;
};

export type CheckContext = {
  lessonId: string;
  chapter: number;
  lesson: number;
  template: string;
  intros: VocabIntro[];
};

export type ProblemTarget =
  | { kind: "hook" | "reveal" | "close" }
  | { kind: "card" | "exercise"; index: number };

export type ProblemFix = { path: (string | number)[]; value: string; label: string };

export type LessonProblem = {
  key: string;
  code: string;
  target: ProblemTarget;
  where: string;
  text: string;
  fix?: ProblemFix;
};

type Rec = Record<string, unknown>;
type Path = (string | number)[];

const HARAKAT = /[ً-ٰٟۖ-ۭـ]/g;
const DAMMA_END = /[ٌُ][ّ]?$/;
const TANWEEN_END = /[ًٌٍ]/;
const ARABIC_LETTER = /[ء-يٱ]/;
const TRAILING_PUNCT = /[؟?.!،,:;»«"“”()]+$/;

// Words that put the noun after them in the genitive (kasra). Plain spelling.
const GENITIVE_WORDS = new Set(["في", "على", "من", "الى", "عن", "امام", "خلف", "فوق", "تحت", "مع", "عند"]);
const ATTACHED_PREFIXES = new Set(["ب", "ل", "ك"]);
const JOINING_LETTERS = new Set(["ب", "ل", "ك", "و", "ف"]);

/** Arabic without harakat, with the hamza seats on alif folded and ى read as ي. */
export function plainArabic(s: string): string {
  return s
    .replace(HARAKAT, "")
    .replace(/[ٱأإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .trim();
}

function isObj(v: unknown): v is Rec {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function rec(v: unknown): Rec {
  return isObj(v) ? v : {};
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function targetOf(path: Path): ProblemTarget | null {
  const [head, index] = path;
  if (head === "discover_cards" && typeof index === "number") return { kind: "card", index };
  if (head === "exercises" && typeof index === "number") return { kind: "exercise", index };
  if (head === "hook" || head === "reveal" || head === "close") return { kind: head };
  return null;
}

function whereOf(t: ProblemTarget): string {
  switch (t.kind) {
    case "card":
      return `Card ${t.index + 1}`;
    case "exercise":
      return `Practice ${t.index + 1}`;
    case "hook":
      return "Opening ayah";
    case "reveal":
      return "Closing ayah";
    case "close":
      return "Noor’s goodbye";
  }
}

function targetKey(t: ProblemTarget): string {
  return "index" in t ? `${t.kind}${t.index}` : t.kind;
}

/** Visits every string in the lesson with its path, skipping Quran text. */
function walkStrings(value: unknown, path: Path, visit: (s: string, path: Path) => void) {
  if (typeof value === "string") {
    visit(value, path);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walkStrings(v, [...path, i], visit));
    return;
  }
  if (!isObj(value)) return;
  for (const [k, v] of Object.entries(value)) {
    if (k === "ayah" || k === "_meta") continue;
    walkStrings(v, [...path, k], visit);
  }
}

/** Visits every object in the lesson with its path, skipping Quran text. */
function walkObjects(value: unknown, path: Path, visit: (o: Rec, path: Path) => void) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => walkObjects(v, [...path, i], visit));
    return;
  }
  if (!isObj(value)) return;
  visit(value, path);
  for (const [k, v] of Object.entries(value)) {
    if (k === "ayah" || k === "_meta") continue;
    walkObjects(v, [...path, k], visit);
  }
}

function lastHarakaIsDamma(word: string): boolean {
  return DAMMA_END.test(word.replace(TRAILING_PUNCT, ""));
}

function toKasra(word: string): string {
  const m = word.match(TRAILING_PUNCT);
  const tail = m ? m[0] : "";
  const body = tail ? word.slice(0, -tail.length) : word;
  return body.replace(/ُ(ّ?)$/, "ِ$1").replace(/ٌ(ّ?)$/, "ٍ$1") + tail;
}

function isGenitiveWord(token: string): boolean {
  if (token.includes("ـ")) return false;
  const plain = plainArabic(token);
  // مَنْ (who) and مِنْ (from) share a spelling; only the kasra one is a preposition.
  if (plain === "من") return /^مّ?ِ/.test(token);
  return GENITIVE_WORDS.has(plain) || ATTACHED_PREFIXES.has(plain);
}

/** True when the word really starts with ال (not أَلِيمٌ or آلِهَةٌ). */
function hasDefiniteArticle(token: string): boolean {
  return /^[اٱ]ل/.test(token.replace(HARAKAT, ""));
}

function isOptionPath(path: Path): boolean {
  return path.includes("options");
}

// ---------------------------------------------------------------------------

export function checkLesson(content: unknown, ctx: CheckContext): LessonProblem[] {
  const lesson = rec(content);
  const problems: LessonProblem[] = [];
  const seen = new Set<string>();

  function add(code: string, target: ProblemTarget, detail: string, text: string, fix?: ProblemFix) {
    const key = `${code}:${targetKey(target)}:${detail}`;
    if (seen.has(key)) return;
    seen.add(key);
    problems.push({ key, code, target, where: whereOf(target), text, ...(fix ? { fix } : {}) });
  }

  const cards = arr(lesson.discover_cards);
  const exercises = arr(lesson.exercises);
  const isReview = ctx.template === "REVIEW";

  // Words this lesson introduces (WORD/CONCEPT/EXAMPLE cards).
  const ownWords = new Map<string, string>();
  cards.forEach((c) => {
    const card = rec(c);
    const plain = str(rec(card.introduces_vocab).ar_plain);
    if (!plain) return;
    const shown = str(rec(card.text).ar) || str(rec(card.concept).ar) || plain;
    ownWords.set(plainArabic(plain), shown);
  });

  // 1. Every discover card needs a picture.
  cards.forEach((c, index) => {
    if (!str(rec(c).image_url).trim()) add("no_image", { kind: "card", index }, "", "No image.");
  });

  // 2–4. Urdu missing / copied from English, and placeholder text — one line per item.
  const sections: { value: unknown; path: Path }[] = [
    ...cards.map((v, i) => ({ value: v, path: ["discover_cards", i] as Path })),
    ...exercises.map((v, i) => ({ value: v, path: ["exercises", i] as Path })),
    ...(["hook", "reveal", "close"] as const).map((k) => ({ value: lesson[k], path: [k] as Path })),
  ];
  for (const { value, path } of sections) {
    const target = targetOf(path);
    if (!target || value === undefined) continue;
    let missing = 0;
    let copied = 0;
    walkObjects(value, path, (o) => {
      const en = str(o.en).trim();
      if (!en) return;
      const ur = str(o.ur).trim();
      if (!ur) missing += 1;
      else if (ur === en && /[A-Za-z]/.test(en)) copied += 1;
    });
    if (missing) add("urdu_missing", target, "", missing === 1 ? "Urdu missing." : `Urdu missing in ${missing} places.`);
    if (copied) add("urdu_copied", target, "", copied === 1 ? "The Urdu is a copy of the English." : `The Urdu is a copy of the English in ${copied} places.`);
    walkStrings(value, path, (s) => {
      const m = s.match(/short practice phrase|use this word in a short phrase|lorem ipsum|\bTODO\b|\bTBD\b|\[YOUR [^\]]*\]/i);
      if (m) add("placeholder", target, "", `Placeholder text: “${m[0]}”.`);
    });
  }

  // 5. The opening ayah should contain a word this lesson teaches.
  const hookAyah = str(rec(rec(lesson.hook).ayah).ar);
  // Phrase lessons (رَبُّ الْعَالَمِينَ) teach a pattern, not a word to find in the ayah.
  const singleWords = [...ownWords.keys()].filter((w) => !/\s/.test(w));
  if (hookAyah && singleWords.length > 0 && singleWords.length === ownWords.size && !isReview) {
    const skeleton = (s: string) => plainArabic(s).replace(/^ال/, "").replace(/[اۥۦ]/g, "");
    const tokens = hookAyah.split(/\s+/).map((t) => plainArabic(t));
    const found = singleWords.some((word) => {
      if (word.length === 1) return tokens.some((t) => t.startsWith(word));
      const w = skeleton(word);
      return tokens.some((t) => {
        const tk = skeleton(t);
        return tk === w || (w.length >= 2 && (tk.startsWith(w) || tk.includes(w)));
      });
    });
    if (!found) {
      const label = str(rec(rec(lesson.hook).ayah).label) || "The opening ayah";
      const words = [...ownWords.values()].slice(0, 3).join("، ");
      const which = ownWords.size === 1 ? "the word this lesson teaches" : "or any other word this lesson teaches";
      add("ayah_missing_word", { kind: "hook" }, "", `${label} does not contain ${words}, ${which}.`);
    }
  }

  // 6. The closing ayah should highlight something.
  const reveal = rec(lesson.reveal);
  if (str(rec(reveal.ayah).ar) && arr(reveal.highlighted_word_indices).length === 0 && arr(reveal.highlighted_words).length === 0) {
    add("reveal_no_highlight", { kind: "reveal" }, "", "No word is highlighted in the closing ayah.");
  }

  // 7–10. Arabic grammar in the lesson's own Arabic (`ar` and `sentence_ar`).
  walkStrings(lesson, [], (s, path) => {
    const key = path[path.length - 1];
    if (key !== "ar" && key !== "sentence_ar") return;
    const target = targetOf(path);
    // Hook, reveal and close mix ayah fragments and grammar labels (لِـ) into
    // their Arabic, so the grammar checks run only on cards and practice.
    if (!target || (target.kind !== "card" && target.kind !== "exercise") || !ARABIC_LETTER.test(s)) return;
    const tokens = s.split(/\s+/).filter(Boolean);

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      const next = tokens[i + 1];
      const plain = plainArabic(tok);

      // A one-letter word that must be joined to the next word (بِ الْبَيْتِ).
      if (next && JOINING_LETTERS.has(plain) && !tok.includes("ـ") && ARABIC_LETTER.test(next)) {
        const fixable = !(plain === "ل" && hasDefiniteArticle(next));
        const joined = tok + next;
        const fixedNext = ATTACHED_PREFIXES.has(plain) && lastHarakaIsDamma(next) ? tok + toKasra(next) : joined;
        add(
          "prefix_apart",
          target,
          `${plain}:${plainArabic(next)}`,
          `${tok} is written apart from its word: “${tok} ${next}” should be “${fixedNext}”.`,
          fixable ? { path, value: s.replace(`${tok} ${next}`, fixedNext), label: `Use ${fixedNext}` } : undefined,
        );
      }

      // A noun after a preposition keeps its ḍamma (فِي الْبَيْتُ).
      if (next && isGenitiveWord(tok) && lastHarakaIsDamma(next) && !isOptionPath(path)) {
        const fixed = toKasra(next);
        add(
          "harf_damma",
          target,
          `${plain}:${plainArabic(next)}`,
          `After ${tok} the noun ends in kasra: “${tok} ${fixed}”, not “${tok} ${next}”.`,
          { path, value: s.replace(`${tok} ${next}`, `${tok} ${fixed}`), label: `Use ${fixed}` },
        );
      }
      // The same, with the preposition already joined (بِالْمَسْجِدُ).
      if (/^[بلك]ِ?ال/.test(tok.replace(/[َُّْ]/g, "")) && lastHarakaIsDamma(tok) && !isOptionPath(path)) {
        const fixed = toKasra(tok);
        add("harf_damma", target, plain, `After ${tok[0]}ِ the noun ends in kasra: “${fixed}”, not “${tok}”.`, {
          path,
          value: s.replace(tok, fixed),
          label: `Use ${fixed}`,
        });
      }

      // مِنْ before ال is read مِنَ.
      if (next && isGenitiveWord(tok) && plain === "من" && tok.includes("ْ") && hasDefiniteArticle(next)) {
        const fixedTok = tok.replace("ْ", "َ");
        add("min_before_al", target, plainArabic(next), `مِنْ before ال is read مِنَ: “${fixedTok} ${next}”.`, {
          path,
          value: s.replace(`${tok} ${next}`, `${fixedTok} ${next}`),
          label: `Use ${fixedTok}`,
        });
      }

      // ال and tanween on the same word (الْكِتَابٌ). Wrong options are allowed to show it.
      if (hasDefiniteArticle(tok) && plain.length > 2 && TANWEEN_END.test(tok) && !isOptionPath(path)) {
        const fixed = tok.replace(/ٌ/, "ُ").replace(/ٍ/, "ِ").replace(/ًا?/, "َ");
        add("al_tanween", target, plain, `ال and tanween together in “${tok}”. With ال it is “${fixed}”.`, {
          path,
          value: s.replace(tok, fixed),
          label: `Use ${fixed}`,
        });
      }
    }
  });

  // 8b. Build-the-sentence tiles: a preposition tile followed by a ḍamma tile.
  exercises.forEach((e, index) => {
    const ex = rec(e);
    if (ex.type !== "BUILD_SENTENCE") return;
    const tiles = arr(ex.tiles).map(rec);
    const order = arr(ex.correct_order).filter((n): n is number => typeof n === "number");
    const seq = order.length ? order : tiles.map((_, i) => i);
    for (let i = 0; i + 1 < seq.length; i++) {
      const a = str(tiles[seq[i]]?.ar);
      const b = str(tiles[seq[i + 1]]?.ar);
      if (a && b && isGenitiveWord(a) && lastHarakaIsDamma(b)) {
        const fixed = toKasra(b);
        add("harf_damma", { kind: "exercise", index }, `tile:${plainArabic(b)}`, `After ${a} the noun ends in kasra: “${fixed}”, not “${b}”.`, {
          path: ["exercises", index, "tiles", seq[i + 1], "ar"],
          value: fixed,
          label: `Use ${fixed}`,
        });
      }
    }
  });

  // 11. Practice uses a word that is first taught in a later lesson.
  const firstIntro = new Map<string, VocabIntro>();
  for (const intro of [...ctx.intros].sort((a, b) => a.chapter - b.chapter || a.lesson - b.lesson)) {
    const p = plainArabic(intro.plain);
    if (!firstIntro.has(p)) firstIntro.set(p, intro);
  }
  // Same chapter only: earlier chapters teach some words without tagging them,
  // so a cross-chapter match is not proof the learner has not met the word.
  const isLater = (i: VocabIntro) => i.chapter === ctx.chapter && i.lesson > ctx.lesson;
  exercises.forEach((e, index) => {
    walkObjects(e, ["exercises", index], (o) => {
      const plain = plainArabic(str(o.ar_plain));
      if (!plain || ownWords.has(plain)) return;
      const intro = firstIntro.get(plain);
      if (intro && isLater(intro)) {
        add("untaught_word", { kind: "exercise", index }, plain, `${str(o.ar) || plain} is taught in Lesson ${intro.lesson}.`);
      }
    });
  });

  // 12. A word introduced here is also introduced by another lesson in this chapter.
  if (!isReview) {
    cards.forEach((c, index) => {
      const plain = plainArabic(str(rec(rec(c).introduces_vocab).ar_plain));
      // Phrases (عَبْدُ اللَّهِ) are revisited on purpose; only single words count.
      if (!plain || /\s/.test(plain)) return;
      const other = ctx.intros.find(
        (i) => i.chapter === ctx.chapter && i.lessonId !== ctx.lessonId && !i.review && plainArabic(i.plain) === plain,
      );
      if (other) {
        add(
          "taught_twice",
          { kind: "card", index },
          plain,
          `${ownWords.get(plain) ?? plain} is also introduced in Lesson ${other.lesson}. Teach it in one lesson.`,
        );
      }
    });
  }

  // 13. Two practice questions that are the same apart from their id.
  const fingerprints = new Map<string, number>();
  exercises.forEach((e, index) => {
    const { id: _id, xp_value: _xp, ...rest } = rec(e);
    const fp = JSON.stringify(rest);
    const first = fingerprints.get(fp);
    if (first === undefined) fingerprints.set(fp, index);
    else add("duplicate_exercise", { kind: "exercise", index }, String(first), `Same question as Practice ${first + 1}.`);
  });

  return problems;
}

/** "4 cards without an image, Urdu copied from English, +2" */
export function summarizeProblems(problems: LessonProblem[], max = 3): string {
  const groups = new Map<string, number>();
  for (const p of problems) groups.set(p.code, (groups.get(p.code) ?? 0) + 1);
  const phrase = (code: string, n: number): string => {
    switch (code) {
      case "no_image":
        return n === 1 ? "a card without an image" : `${n} cards without an image`;
      case "urdu_missing":
        return "Urdu missing";
      case "urdu_copied":
        return "Urdu copied from English";
      case "placeholder":
        return "placeholder text";
      case "ayah_missing_word":
        return "opening ayah lacks the lesson word";
      case "reveal_no_highlight":
        return "closing ayah not highlighted";
      case "prefix_apart":
        return "a prefix written apart";
      case "harf_damma":
        return "ḍamma after a preposition";
      case "min_before_al":
        return "مِنْ before ال";
      case "al_tanween":
        return "ال with tanween";
      case "untaught_word":
        return n === 1 ? "a word from a later lesson" : `${n} words from later lessons`;
      case "taught_twice":
        return "a word taught twice";
      case "duplicate_exercise":
        return "a repeated question";
      default:
        return code;
    }
  };
  const parts = [...groups.entries()].map(([code, n]) => phrase(code, n));
  const shown = parts.slice(0, max);
  const rest = problems.length - shown.reduce((n, _, i) => n + [...groups.values()][i], 0);
  return rest > 0 ? `${shown.join(", ")}, +${rest}` : shown.join(", ");
}

/** Returns a copy of `content` with `fix.value` written at `fix.path`. */
export function applyFix<T>(content: T, fix: ProblemFix): T {
  const copy = JSON.parse(JSON.stringify(content)) as T;
  let node: unknown = copy;
  for (const step of fix.path.slice(0, -1)) {
    node = (node as Record<string | number, unknown>)?.[step];
    if (node === undefined || node === null) return content;
  }
  (node as Record<string | number, unknown>)[fix.path[fix.path.length - 1]] = fix.value;
  return copy;
}
