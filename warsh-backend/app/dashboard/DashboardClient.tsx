"use client";

import { useState, useCallback, useMemo } from "react";
import styles from "./dashboard.module.css";
import type {
  LessonContent,
  DiscoverCard,
  Exercise,
  DiscoverCardType,
  ExerciseType,
} from "../../lib/content-schema";
import {
  parseLenient,
  createStarterCard,
  createStarterExercise,
  discoverCardFormConfig,
  exerciseFormConfig,
} from "../../lib/content-schema";

// ============================================================================
// TYPES
// ============================================================================

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type DashboardLesson = {
  id: string;
  order: number;
  title: string;
  titleAr: string;
  template: string;
  xpReward: number;
  content: JsonValue;
};

export type DashboardChapter = {
  id: string;
  order: number;
  title: string;
  titleAr: string;
  description: string;
  worldMapX: number;
  worldMapY: number;
  isLocked: boolean;
  lessons: DashboardLesson[];
};

type ChapterDraft = Pick<DashboardChapter, "title" | "titleAr" | "description" | "worldMapX" | "worldMapY" | "isLocked">;
type LessonDraft = {
  title: string;
  titleAr: string;
  template: string;
  xpReward: number;
  updatedAt?: number; // Unix ms
  content: string;
  originalContent: JsonValue;
};

const LESSON_TEMPLATES = ["STANDARD", "SPOKEN_PHRASES", "REVIEW", "VERB_PATTERN"];

// ============================================================================
// ARABIC TEXT EDITOR
// ============================================================================

function ArabicTextEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span>{label}</span>
      <input
        dir="rtl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ direction: "rtl", textAlign: "right" }}
      />
    </label>
  );
}

// ============================================================================
// CARD EDIT FORM
// ============================================================================

function CardEditForm({
  card,
  index,
  onSave,
  onCancel,
}: {
  card: DiscoverCard;
  index: number;
  onSave: (updated: DiscoverCard) => void;
  onCancel: () => void;
}) {
  // Cast to any to handle discriminated union where TypeScript can't narrow the
  // union member inside useState / JSX conditional blocks
  const [draft, setDraft] = useState<DiscoverCard>(card as unknown as DiscoverCard);
  const config = discoverCardFormConfig[card.type];

  function updateField(path: string, value: unknown) {
    setDraft((prev) => {
      const next = { ...prev } as unknown as Record<string, unknown>;
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!obj[p]) obj[p] = {};
        obj = obj[p] as Record<string, unknown>;
      }
      obj[parts[parts.length - 1]] = value;
      return next as unknown as DiscoverCard;
    });
  }

  function save() {
    onSave(draft);
  }

  // We access via `card` prop (typed precisely) rather than `draft` for reads
  const c = card as unknown as Record<string, unknown>;

  return (
    <div className={styles.editPanel}>
      <div className={styles.editPanelHeader}>
        <h4>Edit {config?.label?.en ?? card.type} — card {index + 1}</h4>
        <div className={styles.editPanelActions}>
          <button className={styles.cancelBtn} onClick={onCancel} type="button">Cancel</button>
          <button className={styles.saveBtn} onClick={save} type="button">Save card</button>
        </div>
      </div>

      <div className={styles.fieldGrid}>
        {card.type === "WORD" && (
          <>
            <label>
              <span>Arabic (with harakat)</span>
              <input dir="rtl" value={(c.text as Record<string, string>)?.ar ?? ""} onChange={(e) => updateField("text.ar", e.target.value)} />
            </label>
            <label>
              <span>Arabic (plain)</span>
              <input dir="rtl" value={(c.text as Record<string, string>)?.ar_plain ?? ""} onChange={(e) => updateField("text.ar_plain", e.target.value)} />
            </label>
            <label>
              <span>Transliteration</span>
              <input value={(c.text as Record<string, string>)?.translit ?? ""} onChange={(e) => updateField("text.translit", e.target.value)} />
            </label>
            <label>
              <span>English</span>
              <input value={(c.text as Record<string, string>)?.en ?? ""} onChange={(e) => updateField("text.en", e.target.value)} />
            </label>
            <label>
              <span>Urdu</span>
              <input value={(c.text as Record<string, string>)?.ur ?? ""} onChange={(e) => updateField("text.ur", e.target.value)} />
            </label>
            <label>
              <span>Image URL</span>
              <input value={(c.image_url as string) ?? ""} onChange={(e) => updateField("image_url", e.target.value)} />
            </label>
            <label>
              <span>Audio URL</span>
              <input value={(c.audio_url as string) ?? ""} onChange={(e) => updateField("audio_url", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Explanation (EN)</span>
              <textarea rows={2} value={(c.explanation as Record<string, string>)?.en ?? ""} onChange={(e) => updateField("explanation.en", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Explanation (UR)</span>
              <textarea rows={2} value={(c.explanation as Record<string, string>)?.ur ?? ""} onChange={(e) => updateField("explanation.ur", e.target.value)} />
            </label>
          </>
        )}

        {(card.type === "CONCEPT" || card.type === "CONTRAST" || card.type === "AYAH_PREVIEW") && (
          <>
            <label>
              <span>Concept (EN)</span>
              <input value={(c.concept as Record<string, string>)?.en ?? ""} onChange={(e) => updateField("concept.en", e.target.value)} />
            </label>
            <label>
              <span>Concept (AR)</span>
              <input dir="rtl" value={(c.concept as Record<string, string>)?.ar ?? ""} onChange={(e) => updateField("concept.ar", e.target.value)} />
            </label>
            <label>
              <span>Concept (UR)</span>
              <input value={(c.concept as Record<string, string>)?.ur ?? ""} onChange={(e) => updateField("concept.ur", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Explanation (EN)</span>
              <textarea rows={2} value={(c.explanation as Record<string, string>)?.en ?? ""} onChange={(e) => updateField("explanation.en", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Explanation (UR)</span>
              <textarea rows={2} value={(c.explanation as Record<string, string>)?.ur ?? ""} onChange={(e) => updateField("explanation.ur", e.target.value)} />
            </label>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EXERCISE EDIT FORM
// ============================================================================

function ExerciseEditForm({
  exercise,
  index,
  onSave,
  onCancel,
}: {
  exercise: Exercise;
  index: number;
  onSave: (updated: Exercise) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Exercise>(exercise as unknown as Exercise);

  function updateField(path: string, value: unknown) {
    setDraft((prev) => {
      const next = { ...prev } as unknown as Record<string, unknown>;
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!obj[p]) obj[p] = {};
        obj = obj[p] as Record<string, unknown>;
      }
      obj[parts[parts.length - 1]] = value;
      return next as unknown as Exercise;
    });
  }

  function save() {
    onSave(draft);
  }

  // Access via exercise prop for reads to avoid union narrowing issues
  const ex = exercise as unknown as Record<string, unknown>;

  return (
    <div className={styles.editPanel}>
      <div className={styles.editPanelHeader}>
        <h4>Edit {exercise.type} — exercise {index + 1}</h4>
        <div className={styles.editPanelActions}>
          <button className={styles.cancelBtn} onClick={onCancel} type="button">Cancel</button>
          <button className={styles.saveBtn} onClick={save} type="button">Save exercise</button>
        </div>
      </div>

      <div className={styles.fieldGrid}>
        <label className={styles.fullWidth}>
          <span>Exercise ID</span>
          <code style={{ fontSize: 12 }}>{exercise.id}</code>
        </label>

        {/* ---- TRUE_FALSE ---- */}
        {exercise.type === "TRUE_FALSE" && (
          <>
            <label className={styles.fullWidth}>
              <span>Statement (EN)</span>
              <textarea rows={2} value={exercise.statement?.en ?? ""} onChange={(e) => updateField("statement.en", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Statement (UR)</span>
              <textarea rows={2} value={exercise.statement?.ur ?? ""} onChange={(e) => updateField("statement.ur", e.target.value)} />
            </label>
            <label>
              <span>Correct answer</span>
              <select
                value={String(exercise.correct_answer ?? "true")}
                onChange={(e) => updateField("correct_answer", e.target.value === "true")}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </label>
            <label className={styles.fullWidth}>
              <span>Explanation on wrong (EN)</span>
              <textarea rows={2} value={exercise.explanation_on_wrong?.en ?? ""} onChange={(e) => updateField("explanation_on_wrong.en", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Explanation on wrong (UR)</span>
              <textarea rows={2} value={exercise.explanation_on_wrong?.ur ?? ""} onChange={(e) => updateField("explanation_on_wrong.ur", e.target.value)} />
            </label>
          </>
        )}

        {/* ---- TAP_TRANSLATION ---- */}
        {exercise.type === "TAP_TRANSLATION" && (
          <>
            <label>
              <span>Arabic prompt</span>
              <input dir="rtl" value={exercise.prompt?.ar ?? ""} onChange={(e) => updateField("prompt.ar", e.target.value)} />
            </label>
            <label>
              <span>Arabic (plain)</span>
              <input dir="rtl" value={exercise.prompt?.ar_plain ?? ""} onChange={(e) => updateField("prompt.ar_plain", e.target.value)} />
            </label>
            <label>
              <span>Transliteration</span>
              <input value={exercise.prompt?.translit ?? ""} onChange={(e) => updateField("prompt.translit", e.target.value)} />
            </label>
            <label>
              <span>English</span>
              <input value={exercise.prompt?.en ?? ""} onChange={(e) => updateField("prompt.en", e.target.value)} />
            </label>
            <label>
              <span>Correct option index (0–3)</span>
              <input type="number" min={0} max={3} value={exercise.correct_index ?? 0} onChange={(e) => updateField("correct_index", parseInt(e.target.value, 10))} />
            </label>
            <label className={styles.fullWidth}>
              <span>Explanation on wrong (EN)</span>
              <textarea rows={2} value={exercise.explanation_on_wrong?.en ?? ""} onChange={(e) => updateField("explanation_on_wrong.en", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Explanation on wrong (UR)</span>
              <textarea rows={2} value={exercise.explanation_on_wrong?.ur ?? ""} onChange={(e) => updateField("explanation_on_wrong.ur", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>4 Options (EN)</span>
              <div className={styles.optionsGrid}>
                {((exercise as unknown as {options: Array<{en: string, ur?: string}>}).options ?? []).map((opt, i) => (
                  <div key={i} className={styles.optionRow}>
                    <span className={styles.optionIndex}>{i}</span>
                    <input value={opt.en} onChange={(e) => {
                      const ex = exercise as unknown as {options: Array<{en: string, ur?: string}>};
                      const newOpts = [...ex.options];
                      newOpts[i] = { ...newOpts[i], en: e.target.value };
                      updateField("options", newOpts);
                    }} />
                    <input value={opt.ur ?? ""} placeholder="UR" onChange={(e) => {
                      const ex = exercise as unknown as {options: Array<{en: string, ur?: string}>};
                      const newOpts = [...ex.options];
                      newOpts[i] = { ...newOpts[i], ur: e.target.value };
                      updateField("options", newOpts);
                    }} />
                  </div>
                ))}
              </div>
            </label>
          </>
        )}

        {/* ---- FILL_BLANK ---- */}
        {exercise.type === "FILL_BLANK" && (
          <>
            <label>
              <span>Mode</span>
              <select value={exercise.mode ?? "TAP"} onChange={(e) => updateField("mode", e.target.value)}>
                <option value="TAP">TAP</option>
                <option value="TYPE">TYPE</option>
              </select>
            </label>
            <label className={styles.fullWidth}>
              <span>Sentence with ___ for blank</span>
              <input dir="rtl" value={exercise.sentence_ar ?? ""} onChange={(e) => updateField("sentence_ar", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Hint (EN)</span>
              <input value={exercise.hint?.en ?? ""} onChange={(e) => updateField("hint.en", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Hint (UR)</span>
              <input value={exercise.hint?.ur ?? ""} onChange={(e) => updateField("hint.ur", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Correct Arabic answer</span>
              <input dir="rtl" value={exercise.correct_answer?.ar ?? ""} onChange={(e) => updateField("correct_answer.ar", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>4 Tap options (ar/en pairs)</span>
              <div style={{ display: "grid", gap: 6 }}>
                {((exercise as unknown as {options: Array<{ar: string, ar_plain?: string, translit?: string, en: string}>}).options ?? []).map((opt, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr", gap: 6, alignItems: "center" }}>
                    <span className={styles.optionIndex}>{i}</span>
                    <input dir="rtl" placeholder="Arabic" value={opt.ar ?? ""} onChange={(e) => {
                      const ex = exercise as unknown as {options: Array<{ar: string, ar_plain?: string, translit?: string, en: string}>};
                      const newOpts = [...ex.options];
                      newOpts[i] = { ...newOpts[i], ar: e.target.value };
                      updateField("options", newOpts);
                    }} />
                    <input placeholder="English" value={opt.en ?? ""} onChange={(e) => {
                      const ex = exercise as unknown as {options: Array<{ar: string, ar_plain?: string, translit?: string, en: string}>};
                      const newOpts = [...ex.options];
                      newOpts[i] = { ...newOpts[i], en: e.target.value };
                      updateField("options", newOpts);
                    }} />
                  </div>
                ))}
              </div>
            </label>
          </>
        )}

        {/* ---- MATCHING ---- */}
        {exercise.type === "MATCHING" && (
          <>
            <label className={styles.fullWidth}>
              <span>Left column — Arabic/English pairs</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {((exercise as unknown as {left_column: Array<{ar: string, ar_plain?: string, translit?: string, en: string}>}).left_column ?? []).map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 1fr", gap: 6, alignItems: "center" }}>
                    <span className={styles.optionIndex}>{i}</span>
                    <input dir="rtl" placeholder="Arabic" value={item.ar} onChange={(e) => {
                      const ex = exercise as unknown as {left_column: Array<{ar: string, ar_plain?: string, translit?: string, en: string}>};
                      const col = [...ex.left_column];
                      col[i] = { ...col[i], ar: e.target.value };
                      updateField("left_column", col);
                    }} />
                    <input placeholder="Translit" value={item.translit ?? ""} onChange={(e) => {
                      const ex = exercise as unknown as {left_column: Array<{ar: string, ar_plain?: string, translit?: string, en: string}>};
                      const col = [...ex.left_column];
                      col[i] = { ...col[i], translit: e.target.value };
                      updateField("left_column", col);
                    }} />
                    <input placeholder="English" value={item.en} onChange={(e) => {
                      const ex = exercise as unknown as {left_column: Array<{ar: string, ar_plain?: string, translit?: string, en: string}>};
                      const col = [...ex.left_column];
                      col[i] = { ...col[i], en: e.target.value };
                      updateField("left_column", col);
                    }} />
                  </div>
                ))}
              </div>
            </label>
            <label className={styles.fullWidth}>
              <span>Right column — English/Urdu pairs</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {((exercise as unknown as {right_column: Array<{en: string, ur?: string}>}).right_column ?? []).map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr", gap: 6, alignItems: "center" }}>
                    <span className={styles.optionIndex}>{i}</span>
                    <input placeholder="English" value={item.en} onChange={(e) => {
                      const ex = exercise as unknown as {right_column: Array<{en: string, ur?: string}>};
                      const col = [...ex.right_column];
                      col[i] = { ...col[i], en: e.target.value };
                      updateField("right_column", col);
                    }} />
                    <input placeholder="Urdu" value={item.ur ?? ""} onChange={(e) => {
                      const ex = exercise as unknown as {right_column: Array<{en: string, ur?: string}>};
                      const col = [...ex.right_column];
                      col[i] = { ...col[i], ur: e.target.value };
                      updateField("right_column", col);
                    }} />
                  </div>
                ))}
              </div>
            </label>
            <label className={styles.fullWidth}>
              <span>Correct pairs (e.g. [[0,0],[1,1]])</span>
              <textarea
                rows={2}
                value={JSON.stringify(exercise.correct_pairs ?? [])}
                onChange={(e) => {
                  try {
                    updateField("correct_pairs", JSON.parse(e.target.value));
                  } catch {}
                }}
              />
            </label>
          </>
        )}

        {/* ---- GRAMMAR_PARSE ---- */}
        {exercise.type === "GRAMMAR_PARSE" && (
          <>
            <label className={styles.fullWidth}>
              <span>Sentence (AR)</span>
              <input dir="rtl" value={exercise.sentence_ar ?? ""} onChange={(e) => updateField("sentence_ar", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Words (Arabic / translit / English per row)</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {((exercise as unknown as {words: Array<{ar: string, ar_plain?: string, translit?: string, en: string}>}).words ?? []).map((w, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 1fr", gap: 4, alignItems: "center" }}>
                    <span className={styles.optionIndex}>{i}</span>
                    <input dir="rtl" placeholder="Arabic" value={w.ar} onChange={(e) => {
                      const ex = exercise as unknown as {words: Array<{ar: string, ar_plain?: string, translit?: string, en: string}>};
                      const wds = [...ex.words]; wds[i] = { ...wds[i], ar: e.target.value }; updateField("words", wds);
                    }} />
                    <input placeholder="Translit" value={w.translit ?? ""} onChange={(e) => {
                      const ex = exercise as unknown as {words: Array<{ar: string, ar_plain?: string, translit?: string, en: string}>};
                      const wds = [...ex.words]; wds[i] = { ...wds[i], translit: e.target.value }; updateField("words", wds);
                    }} />
                    <input placeholder="English" value={w.en} onChange={(e) => {
                      const ex = exercise as unknown as {words: Array<{ar: string, ar_plain?: string, translit?: string, en: string}>};
                      const wds = [...ex.words]; wds[i] = { ...wds[i], en: e.target.value }; updateField("words", wds);
                    }} />
                  </div>
                ))}
              </div>
            </label>
            <label className={styles.fullWidth}>
              <span>Available roles (comma-separated)</span>
              <input value={((exercise as unknown as {available_roles: string[]}).available_roles ?? []).join(", ")} onChange={(e) => updateField("available_roles", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} />
            </label>
            <label className={styles.fullWidth}>
              <span>Correct roles (comma-separated)</span>
              <input value={((exercise as unknown as {correct_roles: string[]}).correct_roles ?? []).join(", ")} onChange={(e) => updateField("correct_roles", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} />
            </label>
            <label className={styles.fullWidth}>
              <span>Explanation on wrong (EN)</span>
              <textarea rows={2} value={exercise.explanation_on_wrong?.en ?? ""} onChange={(e) => updateField("explanation_on_wrong.en", e.target.value)} />
            </label>
          </>
        )}

        {/* ---- CONVERSATION_BUILDER ---- */}
        {exercise.type === "CONVERSATION_BUILDER" && (
          <>
            <label>
              <span>Prompt Arabic</span>
              <input dir="rtl" value={((exercise as unknown as {prompt_line?: {ar:string}}).prompt_line?.ar) ?? ""} onChange={(e) => updateField("prompt_line.ar", e.target.value)} />
            </label>
            <label>
              <span>Prompt (plain)</span>
              <input dir="rtl" value={((exercise as unknown as {prompt_line?: {ar_plain:string}}).prompt_line?.ar_plain) ?? ""} onChange={(e) => updateField("prompt_line.ar_plain", e.target.value)} />
            </label>
            <label>
              <span>Prompt translit</span>
              <input value={((exercise as unknown as {prompt_line?: {translit:string}}).prompt_line?.translit) ?? ""} onChange={(e) => updateField("prompt_line.translit", e.target.value)} />
            </label>
            <label>
              <span>Prompt English</span>
              <input value={((exercise as unknown as {prompt_line?: {en:string}}).prompt_line?.en) ?? ""} onChange={(e) => updateField("prompt_line.en", e.target.value)} />
            </label>
            <label>
              <span>Response mode</span>
              <select value={((exercise as unknown as {response_mode?: string}).response_mode) ?? "PICK"} onChange={(e) => updateField("response_mode", e.target.value)}>
                <option value="PICK">PICK</option>
                <option value="BUILD">BUILD</option>
              </select>
            </label>
            <label>
              <span>Correct option index</span>
              <input type="number" min={0} value={((exercise as unknown as {correct_option_index?: number}).correct_option_index) ?? 0} onChange={(e) => updateField("correct_option_index", parseInt(e.target.value, 10))} />
            </label>
            <label className={styles.fullWidth}>
              <span>Options (Arabic/en pairs)</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {((exercise as unknown as {options?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>}).options ?? []).map((opt, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr", gap: 4, alignItems: "center" }}>
                    <span className={styles.optionIndex}>{i}</span>
                    <input dir="rtl" placeholder="Arabic" value={opt.ar} onChange={(e) => {
                      const ex = exercise as unknown as {options?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>};
                      const opts = [...(ex.options ?? [])]; opts[i] = { ...opts[i], ar: e.target.value }; updateField("options", opts);
                    }} />
                    <input placeholder="English" value={opt.en} onChange={(e) => {
                      const ex = exercise as unknown as {options?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>};
                      const opts = [...(ex.options ?? [])]; opts[i] = { ...opts[i], en: e.target.value }; updateField("options", opts);
                    }} />
                  </div>
                ))}
              </div>
            </label>
          </>
        )}

        {/* ---- SHADOW_REPEAT ---- */}
        {exercise.type === "SHADOW_REPEAT" && (
          <>
            <label>
              <span>Phrase (AR)</span>
              <input dir="rtl" value={((exercise as unknown as {phrase?: {ar:string}}).phrase?.ar) ?? ""} onChange={(e) => updateField("phrase.ar", e.target.value)} />
            </label>
            <label>
              <span>Phrase (plain)</span>
              <input dir="rtl" value={((exercise as unknown as {phrase?: {ar_plain:string}}).phrase?.ar_plain) ?? ""} onChange={(e) => updateField("phrase.ar_plain", e.target.value)} />
            </label>
            <label>
              <span>Transliteration</span>
              <input value={((exercise as unknown as {phrase?: {translit:string}}).phrase?.translit) ?? ""} onChange={(e) => updateField("phrase.translit", e.target.value)} />
            </label>
            <label>
              <span>English</span>
              <input value={((exercise as unknown as {phrase?: {en:string}}).phrase?.en) ?? ""} onChange={(e) => updateField("phrase.en", e.target.value)} />
            </label>
            <label>
              <span>Audio URL</span>
              <input value={exercise.audio_url ?? ""} onChange={(e) => updateField("audio_url", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Self-grading</span>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={((exercise as unknown as {self_grading?: boolean}).self_grading) ?? true} onChange={(e) => updateField("self_grading", e.target.checked)} />
                <span>Learner grades their own pronunciation</span>
              </label>
            </label>
          </>
        )}

        {/* ---- AUDIO_RECOGNITION ---- */}
        {exercise.type === "AUDIO_RECOGNITION" && (
          <>
            <label className={styles.fullWidth}>
              <span>Audio URL</span>
              <input value={exercise.audio_url ?? ""} onChange={(e) => updateField("audio_url", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>4 options (ar/en pairs)</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {((exercise as unknown as {options?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>}).options ?? []).map((opt, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 1fr", gap: 4, alignItems: "center" }}>
                    <span className={styles.optionIndex}>{i}</span>
                    <input dir="rtl" placeholder="Arabic" value={opt.ar} onChange={(e) => {
                      const ex = exercise as unknown as {options?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>};
                      const opts = [...(ex.options ?? [])]; opts[i] = { ...opts[i], ar: e.target.value }; updateField("options", opts);
                    }} />
                    <input placeholder="Translit" value={opt.translit ?? ""} onChange={(e) => {
                      const ex = exercise as unknown as {options?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>};
                      const opts = [...(ex.options ?? [])]; opts[i] = { ...opts[i], translit: e.target.value }; updateField("options", opts);
                    }} />
                    <input placeholder="English" value={opt.en} onChange={(e) => {
                      const ex = exercise as unknown as {options?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>};
                      const opts = [...(ex.options ?? [])]; opts[i] = { ...opts[i], en: e.target.value }; updateField("options", opts);
                    }} />
                  </div>
                ))}
              </div>
            </label>
            <label>
              <span>Correct index (0–3)</span>
              <input type="number" min={0} max={3} value={exercise.correct_index ?? 0} onChange={(e) => updateField("correct_index", parseInt(e.target.value, 10))} />
            </label>
          </>
        )}

        {/* ---- WRITE_ARABIC ---- */}
        {exercise.type === "WRITE_ARABIC" && (
          <>
            <label className={styles.fullWidth}>
              <span>Prompt (EN)</span>
              <input value={((exercise as unknown as {prompt?: {en:string}}).prompt?.en) ?? ""} onChange={(e) => updateField("prompt.en", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Prompt (UR)</span>
              <input value={((exercise as unknown as {prompt?: {ur?:string}}).prompt?.ur) ?? ""} onChange={(e) => updateField("prompt.ur", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Correct answer (AR)</span>
              <input dir="rtl" value={((exercise as unknown as {correct_answer?: {ar:string}}).correct_answer?.ar) ?? ""} onChange={(e) => updateField("correct_answer.ar", e.target.value)} />
            </label>
            <label>
              <span>Correct (plain)</span>
              <input dir="rtl" value={((exercise as unknown as {correct_answer?: {ar_plain:string}}).correct_answer?.ar_plain) ?? ""} onChange={(e) => updateField("correct_answer.ar_plain", e.target.value)} />
            </label>
            <label>
              <span>Transliteration</span>
              <input value={((exercise as unknown as {correct_answer?: {translit:string}}).correct_answer?.translit) ?? ""} onChange={(e) => updateField("correct_answer.translit", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Hint available</span>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={((exercise as unknown as {hint_available?: boolean}).hint_available) ?? true} onChange={(e) => updateField("hint_available", e.target.checked)} />
                <span>Allow hint</span>
              </label>
            </label>
          </>
        )}

        {/* ---- HARAKAH_PLACEMENT ---- */}
        {exercise.type === "HARAKAH_PLACEMENT" && (
          <>
            <label className={styles.fullWidth}>
              <span>Unvowelled word</span>
              <input dir="rtl" value={exercise.word_unvowelled ?? ""} onChange={(e) => updateField("word_unvowelled", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Correct vowelled form</span>
              <input dir="rtl" value={exercise.correct_vowelled ?? ""} onChange={(e) => updateField("correct_vowelled", e.target.value)} />
            </label>
            <label>
              <span>Hint (EN)</span>
              <input value={((exercise as unknown as {hint?: {en:string}}).hint?.en) ?? ""} onChange={(e) => updateField("hint.en", e.target.value)} />
            </label>
            <label>
              <span>Hint (UR)</span>
              <input value={((exercise as unknown as {hint?: {ur?:string}}).hint?.ur) ?? ""} onChange={(e) => updateField("hint.ur", e.target.value)} />
            </label>
          </>
        )}

        {/* ---- WORD_ORDER ---- */}
        {exercise.type === "WORD_ORDER" && (
          <>
            <label className={styles.fullWidth}>
              <span>Context (EN)</span>
              <input value={((exercise as unknown as {context?: {en:string}}).context?.en) ?? ""} onChange={(e) => updateField("context.en", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Context (UR)</span>
              <input value={((exercise as unknown as {context?: {ur?:string}}).context?.ur) ?? ""} onChange={(e) => updateField("context.ur", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Tiles (ar/translit/en per row)</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {((exercise as unknown as {tiles?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>}).tiles ?? []).map((tile, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 1fr", gap: 4, alignItems: "center" }}>
                    <span className={styles.tileOrder}>{i}</span>
                    <input dir="rtl" placeholder="Arabic" value={tile.ar} onChange={(e) => {
                      const ex = exercise as unknown as {tiles?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>};
                      const tls = [...(ex.tiles ?? [])]; tls[i] = { ...tls[i], ar: e.target.value }; updateField("tiles", tls);
                    }} />
                    <input placeholder="Translit" value={tile.translit ?? ""} onChange={(e) => {
                      const ex = exercise as unknown as {tiles?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>};
                      const tls = [...(ex.tiles ?? [])]; tls[i] = { ...tls[i], translit: e.target.value }; updateField("tiles", tls);
                    }} />
                    <input placeholder="English" value={tile.en} onChange={(e) => {
                      const ex = exercise as unknown as {tiles?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>};
                      const tls = [...(ex.tiles ?? [])]; tls[i] = { ...tls[i], en: e.target.value }; updateField("tiles", tls);
                    }} />
                  </div>
                ))}
              </div>
            </label>
            <label className={styles.fullWidth}>
              <span>Correct order (e.g. [0,1])</span>
              <textarea rows={1} value={JSON.stringify(exercise.correct_order ?? [])} onChange={(e) => {
                try { updateField("correct_order", JSON.parse(e.target.value)); } catch {}
              }} />
            </label>
          </>
        )}

        {/* ---- TRANSLATE_TO_ARABIC ---- */}
        {exercise.type === "TRANSLATE_TO_ARABIC" && (
          <>
            <label className={styles.fullWidth}>
              <span>Source (EN)</span>
              <input value={((exercise as unknown as {source?: {en:string}}).source?.en) ?? ""} onChange={(e) => updateField("source.en", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Source (UR)</span>
              <input value={((exercise as unknown as {source?: {ur?:string}}).source?.ur) ?? ""} onChange={(e) => updateField("source.ur", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Acceptable answers (ar/en per row)</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {((exercise as unknown as {acceptable_answers?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>}).acceptable_answers ?? []).map((a, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 1fr", gap: 4, alignItems: "center" }}>
                    <span className={styles.optionIndex}>{i}</span>
                    <input dir="rtl" placeholder="Arabic" value={a.ar} onChange={(e) => {
                      const ex = exercise as unknown as {acceptable_answers?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>};
                      const ans = [...(ex.acceptable_answers ?? [])]; ans[i] = { ...ans[i], ar: e.target.value }; updateField("acceptable_answers", ans);
                    }} />
                    <input placeholder="Translit" value={a.translit ?? ""} onChange={(e) => {
                      const ex = exercise as unknown as {acceptable_answers?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>};
                      const ans = [...(ex.acceptable_answers ?? [])]; ans[i] = { ...ans[i], translit: e.target.value }; updateField("acceptable_answers", ans);
                    }} />
                    <input placeholder="English" value={a.en} onChange={(e) => {
                      const ex = exercise as unknown as {acceptable_answers?: Array<{ar:string,ar_plain?:string,translit?:string,en:string}>};
                      const ans = [...(ex.acceptable_answers ?? [])]; ans[i] = { ...ans[i], en: e.target.value }; updateField("acceptable_answers", ans);
                    }} />
                  </div>
                ))}
              </div>
            </label>
          </>
        )}

        {/* ---- IDENTIFY_ROOT ---- */}
        {exercise.type === "IDENTIFY_ROOT" && (
          <>
            <label>
              <span>Word (AR)</span>
              <input dir="rtl" value={((exercise as unknown as {word?: {ar:string}}).word?.ar) ?? ""} onChange={(e) => updateField("word.ar", e.target.value)} />
            </label>
            <label>
              <span>Word (plain)</span>
              <input dir="rtl" value={((exercise as unknown as {word?: {ar_plain:string}}).word?.ar_plain) ?? ""} onChange={(e) => updateField("word.ar_plain", e.target.value)} />
            </label>
            <label>
              <span>Transliteration</span>
              <input value={((exercise as unknown as {word?: {translit:string}}).word?.translit) ?? ""} onChange={(e) => updateField("word.translit", e.target.value)} />
            </label>
            <label>
              <span>English</span>
              <input value={((exercise as unknown as {word?: {en:string}}).word?.en) ?? ""} onChange={(e) => updateField("word.en", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Root options (4 Arabic roots)</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {((exercise as unknown as {options?: string[]}).options ?? []).map((opt, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 4, alignItems: "center" }}>
                    <span className={styles.optionIndex}>{i}</span>
                    <input dir="rtl" value={opt} onChange={(e) => {
                      const ex = exercise as unknown as {options?: string[]};
                      const opts = [...(ex.options ?? [])]; opts[i] = e.target.value; updateField("options", opts);
                    }} />
                  </div>
                ))}
              </div>
            </label>
            <label>
              <span>Correct index (0–3)</span>
              <input type="number" min={0} max={3} value={exercise.correct_index ?? 0} onChange={(e) => updateField("correct_index", parseInt(e.target.value, 10))} />
            </label>
          </>
        )}

        {/* ---- MATCH_AYAH ---- */}
        {exercise.type === "MATCH_AYAH" && (
          <>
            <label>
              <span>Ayah fragment (AR)</span>
              <input dir="rtl" value={((exercise as unknown as {ayah_fragment?: {ar:string}}).ayah_fragment?.ar) ?? ""} onChange={(e) => updateField("ayah_fragment.ar", e.target.value)} />
            </label>
            <label>
              <span>Surah reference</span>
              <input value={((exercise as unknown as {ayah_fragment?: {surah_ref:string}}).ayah_fragment?.surah_ref) ?? ""} onChange={(e) => updateField("ayah_fragment.surah_ref", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>4 options (EN/UR pairs)</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {((exercise as unknown as {options?: Array<{en:string,ur?:string}>}).options ?? []).map((opt, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr", gap: 4, alignItems: "center" }}>
                    <span className={styles.optionIndex}>{i}</span>
                    <input placeholder="English" value={opt.en} onChange={(e) => {
                      const ex = exercise as unknown as {options?: Array<{en:string,ur?:string}>};
                      const opts = [...(ex.options ?? [])]; opts[i] = { ...opts[i], en: e.target.value }; updateField("options", opts);
                    }} />
                    <input placeholder="Urdu" value={opt.ur ?? ""} onChange={(e) => {
                      const ex = exercise as unknown as {options?: Array<{en:string,ur?:string}>};
                      const opts = [...(ex.options ?? [])]; opts[i] = { ...opts[i], ur: e.target.value }; updateField("options", opts);
                    }} />
                  </div>
                ))}
              </div>
            </label>
            <label>
              <span>Correct index (0–3)</span>
              <input type="number" min={0} max={3} value={exercise.correct_index ?? 0} onChange={(e) => updateField("correct_index", parseInt(e.target.value, 10))} />
            </label>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HOOK / REVEAL / CLOSE EDITOR
// ============================================================================

interface HookRevealCloseEditorProps {
  parsedContent: LessonContent;
  onUpdate: (updated: LessonContent) => void;
}

function HookRevealCloseEditor({ parsedContent, onUpdate }: HookRevealCloseEditorProps) {
  function updateHookField(path: string, value: unknown) {
    const hook = parsedContent.hook ?? {
      ayah: { surah: 1, ayah: 1, label: "", ar: "", en: "", ur: "", audio_url: "" },
      noor_intro: { en: "", ur: "" },
      autoplay: false,
    };
    const updated = { ...hook };
    const parts = path.split(".");
    let obj = updated as unknown as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!obj[p]) obj[p] = {};
      obj = obj[p] as Record<string, unknown>;
    }
    obj[parts[parts.length - 1]] = value;
    onUpdate({ ...parsedContent, hook: updated as typeof hook });
  }

  function updateRevealField(path: string, value: unknown) {
    const reveal = parsedContent.reveal ?? {
      concept_name: { en: "", ar: "", ur: "" },
      ayah: { surah: 1, ayah: 1, label: "", ar: "", en: "", ur: "", audio_url: "" },
      highlighted_word_indices: [],
      noor_explanation: { en: "", ur: "" },
    };
    const updated = { ...reveal };
    const parts = path.split(".");
    let obj = updated as unknown as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!obj[p]) obj[p] = {};
      obj = obj[p] as Record<string, unknown>;
    }
    obj[parts[parts.length - 1]] = value;
    onUpdate({ ...parsedContent, reveal: updated as typeof reveal });
  }

  function updateCloseField(path: string, value: unknown) {
    const close = parsedContent.close ?? { noor_message: { en: "", ur: "" } };
    const updated = { ...close };
    const parts = path.split(".");
    let obj = updated as unknown as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!obj[p]) obj[p] = {};
      obj = obj[p] as Record<string, unknown>;
    }
    obj[parts[parts.length - 1]] = value;
    onUpdate({ ...parsedContent, close: updated as typeof close });
  }

  const hook = parsedContent.hook;
  const reveal = parsedContent.reveal;
  const close = parsedContent.close;

  return (
    <div className={styles.builderSection}>
      <div className={styles.sectionHeader}>
        <h3>Hook / Reveal / Close</h3>
      </div>

      {/* ---- HOOK ---- */}
      <div className={styles.fieldSection}>
        <h5>Hook</h5>
        <div className={styles.fieldGrid}>
          <label>
            <span>Surah #</span>
            <input type="number" min={1} max={114} value={hook?.ayah?.surah ?? 1} onChange={(e) => updateHookField("ayah.surah", parseInt(e.target.value, 10))} />
          </label>
          <label>
            <span>Ayah #</span>
            <input type="number" min={1} value={hook?.ayah?.ayah ?? 1} onChange={(e) => updateHookField("ayah.ayah", parseInt(e.target.value, 10))} />
          </label>
          <label>
            <span>Label (e.g. Al-Baqarah 2:3)</span>
            <input value={hook?.ayah?.label ?? ""} onChange={(e) => updateHookField("ayah.label", e.target.value)} />
          </label>
          <label>
            <span>Audio URL</span>
            <input value={hook?.ayah?.audio_url ?? ""} onChange={(e) => updateHookField("ayah.audio_url", e.target.value)} />
          </label>
          <label className={styles.fullWidth}>
            <span>Ayah (AR) — RTL</span>
            <input dir="rtl" value={hook?.ayah?.ar ?? ""} onChange={(e) => updateHookField("ayah.ar", e.target.value)} />
          </label>
          <label className={styles.fullWidth}>
            <span>Ayah (EN)</span>
            <input value={hook?.ayah?.en ?? ""} onChange={(e) => updateHookField("ayah.en", e.target.value)} />
          </label>
          <label className={styles.fullWidth}>
            <span>Ayah (UR)</span>
            <input value={hook?.ayah?.ur ?? ""} onChange={(e) => updateHookField("ayah.ur", e.target.value)} />
          </label>
          <label className={styles.fullWidth}>
            <span>Noor intro (EN)</span>
            <input value={hook?.noor_intro?.en ?? ""} onChange={(e) => updateHookField("noor_intro.en", e.target.value)} />
          </label>
          <label className={styles.fullWidth}>
            <span>Noor intro (UR)</span>
            <input value={hook?.noor_intro?.ur ?? ""} onChange={(e) => updateHookField("noor_intro.ur", e.target.value)} />
          </label>
          <label className={styles.fullWidth} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={hook?.autoplay ?? false} onChange={(e) => updateHookField("autoplay", e.target.checked)} />
            <span>Autoplay audio on lesson open</span>
          </label>
        </div>
      </div>

      {/* ---- REVEAL ---- */}
      {reveal && (
        <div className={styles.fieldSection}>
          <h5>Reveal</h5>
          <div className={styles.fieldGrid}>
            <label>
              <span>Concept name (EN)</span>
              <input value={reveal.concept_name?.en ?? ""} onChange={(e) => updateRevealField("concept_name.en", e.target.value)} />
            </label>
            <label>
              <span>Concept name (AR)</span>
              <input dir="rtl" value={reveal.concept_name?.ar ?? ""} onChange={(e) => updateRevealField("concept_name.ar", e.target.value)} />
            </label>
            <label>
              <span>Concept name (UR)</span>
              <input value={reveal.concept_name?.ur ?? ""} onChange={(e) => updateRevealField("concept_name.ur", e.target.value)} />
            </label>
            <label>
              <span>Highlighted word indices (e.g. [1])</span>
              <input value={JSON.stringify(reveal.highlighted_word_indices ?? [])} onChange={(e) => {
                try { updateRevealField("highlighted_word_indices", JSON.parse(e.target.value)); } catch {}
              }} />
            </label>
            <label className={styles.fullWidth}>
              <span>Noor explanation (EN)</span>
              <input value={reveal.noor_explanation?.en ?? ""} onChange={(e) => updateRevealField("noor_explanation.en", e.target.value)} />
            </label>
            <label className={styles.fullWidth}>
              <span>Noor explanation (UR)</span>
              <input value={reveal.noor_explanation?.ur ?? ""} onChange={(e) => updateRevealField("noor_explanation.ur", e.target.value)} />
            </label>
          </div>
        </div>
      )}

      {/* ---- CLOSE ---- */}
      <div className={styles.fieldSection}>
        <h5>Close</h5>
        <div className={styles.fieldGrid}>
          <label className={styles.fullWidth}>
            <span>Noor message (EN)</span>
            <input value={close?.noor_message?.en ?? ""} onChange={(e) => updateCloseField("noor_message.en", e.target.value)} />
          </label>
          <label className={styles.fullWidth}>
            <span>Noor message (UR)</span>
            <input value={close?.noor_message?.ur ?? ""} onChange={(e) => updateCloseField("noor_message.ur", e.target.value)} />
          </label>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DISCOVER CARD LIST ITEM
// ============================================================================

function DiscoverCardItem({
  card,
  index,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
}: {
  card: DiscoverCard;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (targetIndex: number) => void;
  isDragOver: boolean;
}) {
  const config = discoverCardFormConfig[card.type];
  const title =
    card.type === "WORD"
      ? card.text?.ar ?? "(no Arabic)"
      : card.type === "CONCEPT" || card.type === "CONTRAST" || card.type === "AYAH_PREVIEW"
      ? card.concept?.en ?? card.concept?.ar ?? "(no title)"
      : card.text?.ar ?? "(no text)";

  return (
    <div
      className={`${styles.cardItem}${isDragOver ? " " + styles.dragOver : ""}`}
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(index); }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onDragOver(index); }}
      onDrop={(e) => { e.preventDefault(); onDrop(index); }}
    >
      <div className={styles.cardSummary}>
        <span className={styles.dragHandle} title="Drag to reorder">⋮⋮</span>
        <span className={styles.cardIndex}>{index + 1}</span>
        <span className={styles.cardType}>{card.type}</span>
        <strong className={styles.cardTitle} dir="rtl">
          {title}
        </strong>
      </div>
      <div className={styles.cardActions}>
        <button onClick={onEdit} type="button">Edit</button>
        <button onClick={onDuplicate} type="button">Dup</button>
        <button onClick={onMoveUp} disabled={!canMoveUp} type="button">↑</button>
        <button onClick={onMoveDown} disabled={!canMoveDown} type="button">↓</button>
        <button onClick={onDelete} type="button" style={{ color: "#b04040" }}>Del</button>
      </div>
    </div>
  );
}

// ============================================================================
// EXERCISE LIST ITEM
// ============================================================================

function ExerciseItem({
  exercise,
  index,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
}: {
  exercise: Exercise;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (targetIndex: number) => void;
  isDragOver: boolean;
}) {
  const config = exerciseFormConfig[exercise.type];
  const prompt =
    exercise.type === "TAP_TRANSLATION"
      ? exercise.prompt?.ar
      : exercise.type === "FILL_BLANK"
      ? exercise.sentence_ar
      : exercise.type === "TRUE_FALSE"
      ? exercise.statement?.en
      : exercise.type === "BUILD_SENTENCE"
      ? exercise.target_translation?.en
      : null;

  return (
    <div
      className={`${styles.cardExerciseItem}${isDragOver ? " " + styles.dragOver : ""}`}
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(index); }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onDragOver(index); }}
      onDrop={(e) => { e.preventDefault(); onDrop(index); }}
    >
      <div className={styles.cardSummary}>
        <span className={styles.dragHandle} title="Drag to reorder">⋮⋮</span>
        <span className={styles.cardIndex}>{index + 1}</span>
        <code className={styles.exerciseId}>{exercise.id}</code>
        <span className={styles.cardType}>{exercise.type}</span>
        <span className={styles.cardPrompt}>{prompt ?? ""}</span>
        {exercise.xp_value != null && (
          <span className={styles.xpChip}>{exercise.xp_value}XP</span>
        )}
      </div>
      <div className={styles.cardActions}>
        <button onClick={onEdit} type="button">Edit</button>
        <button onClick={onDuplicate} type="button">Dup</button>
        <button onClick={onMoveUp} disabled={!canMoveUp} type="button">↑</button>
        <button onClick={onMoveDown} disabled={!canMoveDown} type="button">↓</button>
        <button onClick={onDelete} type="button" style={{ color: "#b04040" }}>Del</button>
      </div>
    </div>
  );
}

// ============================================================================
// EDITOR STATE
// ============================================================================

type EditorMode = "view" | "edit-card" | "edit-exercise" | "add-card" | "add-exercise" | "json";

interface EditorState {
  mode: EditorMode;
  editingIndex: number | null;
  dirty: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DashboardClient({
  initialChapters,
}: {
  initialChapters: DashboardChapter[];
}) {
  const [chapters, setChapters] = useState(initialChapters);
  const [query, setQuery] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapters[0]?.id ?? "");
  const [selectedLessonId, setSelectedLessonId] = useState(
    initialChapters[0]?.lessons[0]?.id ?? ""
  );
  const [adminToken, setAdminToken] = useState("");
  const [status, setStatus] = useState("Ready");

  const [editorState, setEditorState] = useState<EditorState>({
    mode: "view",
    editingIndex: null,
    dirty: false,
  });

  const selectedChapter = chapters.find((c) => c.id === selectedChapterId) ?? chapters[0];
  const selectedLesson =
    selectedChapter?.lessons.find((l) => l.id === selectedLessonId) ??
    selectedChapter?.lessons[0];

  // ---- Draft state ----
  const [lessonDraft, setLessonDraft] = useState<LessonDraft | null>(
    selectedLesson
      ? {
          title: selectedLesson.title,
          titleAr: selectedLesson.titleAr,
          template: selectedLesson.template,
          xpReward: selectedLesson.xpReward,
          updatedAt: undefined,
          content: JSON.stringify(selectedLesson.content ?? null, null, 2),
          originalContent: selectedLesson.content,
        }
      : null
  );

  // ---- Parsed content ----
  const parsedContent: LessonContent | null = useMemo(() => {
    if (!lessonDraft) return null;
    return parseLenient(lessonDraft.originalContent) as LessonContent | null;
  }, [lessonDraft?.originalContent]);

  // ---- Draft content (mutable) ----
  // We track discover_cards and exercises arrays directly from parsedContent
  const [draftDiscoverCards, setDraftDiscoverCards] = useState<DiscoverCard[]>([]);
  const [draftExercises, setDraftExercises] = useState<Exercise[]>([]);

  // Hook / Reveal / Close — tracked separately for editing
  const [draftHRC, setDraftHRC] = useState<{
    hook?: LessonContent["hook"];
    reveal?: NonNullable<LessonContent["reveal"]>;
    close?: LessonContent["close"];
  }>({});

  // ---- Drag-and-drop state ----
  const [dragCardIndex, setDragCardIndex] = useState<number | null>(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState<number | null>(null);
  const [dragExerciseIndex, setDragExerciseIndex] = useState<number | null>(null);
  const [dragOverExerciseIndex, setDragOverExerciseIndex] = useState<number | null>(null);

  function applyHRCFromParsed(parsed: LessonContent) {
    setDraftHRC({
      hook: parsed.hook,
      reveal: parsed.reveal,
      close: parsed.close,
    });
  }

  // When a new lesson is selected, reset draft from parsed content
  const resetDraftFromParsed = useCallback(
    (lesson: DashboardLesson) => {
      const parsed = parseLenient(lesson.content) as LessonContent | null;
      if (!parsed) return;
      setDraftDiscoverCards(parsed.discover_cards ?? []);
      setDraftExercises(parsed.exercises ?? []);
      applyHRCFromParsed(parsed);
      setLessonDraft({
        title: lesson.title,
        titleAr: lesson.titleAr,
        template: lesson.template,
        xpReward: lesson.xpReward,
        updatedAt: undefined,
        content: JSON.stringify(lesson.content ?? null, null, 2),
        originalContent: lesson.content,
      });
      setEditorState({ mode: "view", editingIndex: null, dirty: false });
    },
    []
  );

  // Filter chapters/lessons
  const filteredChapters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.titleAr.includes(query.trim()) ||
        c.lessons.some(
          (l) =>
            l.title.toLowerCase().includes(q) || l.titleAr.includes(query.trim())
        )
    );
  }, [chapters, query]);

  function selectLesson(lesson: DashboardLesson) {
    if (!lessonDraft?.content) return;
    setSelectedLessonId(lesson.id);
    resetDraftFromParsed(lesson);
  }

  async function saveLesson() {
    if (!selectedLesson || !lessonDraft) return;

    setStatus("Saving lesson...");

    // Round-trip preservation: merge draft arrays into the original content object
    // Per PRD Section 8.2 Decision 3 — originalContent is the immutable reference;
    // only discover_cards and exercises are swapped in; hook/reveal/close are also merged.
    const savedContent = {
      ...(lessonDraft.originalContent as Record<string, unknown>),
      discover_cards: draftDiscoverCards,
      exercises: draftExercises,
      ...(draftHRC.hook !== undefined ? { hook: draftHRC.hook } : {}),
      ...(draftHRC.reveal !== undefined ? { reveal: draftHRC.reveal } : {}),
      ...(draftHRC.close !== undefined ? { close: draftHRC.close } : {}),
    };

    const body = {
      title: lessonDraft.title,
      titleAr: lessonDraft.titleAr,
      template: lessonDraft.template,
      xpReward: lessonDraft.xpReward,
      content: savedContent,
      updatedAt: lessonDraft.updatedAt,
    };

    try {
      const res = await fetch(`/api/admin/lessons/${selectedLesson.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify(body),
      });
      const payload = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setStatus("⚠️ Lesson was changed by another author. Please re-open.");
          return;
        }
        setStatus(payload.error ?? "Save failed.");
        return;
      }

      // Update local state
      const updated = payload.data.lesson;
      setChapters((ch) =>
        ch.map((c) =>
          c.id === selectedChapter?.id
            ? {
                ...c,
                lessons: c.lessons.map((l) =>
                  l.id === selectedLesson.id
                    ? {
                        ...l,
                        title: updated.title,
                        titleAr: updated.titleAr,
                        template: updated.template,
                        xpReward: updated.xpReward,
                        content: updated.content,
                      }
                    : l
                ),
              }
            : c
        )
      );
      setLessonDraft((d) =>
        d
          ? {
              ...d,
              content: JSON.stringify(updated.content, null, 2),
              originalContent: updated.content,
              updatedAt: updated.updatedAt
                ? new Date(updated.updatedAt).getTime()
                : d.updatedAt,
            }
          : d
      );
      setEditorState((s) => ({ ...s, dirty: false }));
      setStatus("Lesson saved ✓");
    } catch {
      setStatus("Network error — is the server running?");
    }
  }

  // ---- JSON view state ----
  const [showJsonView, setShowJsonView] = useState(false);
  const [jsonBuffer, setJsonBuffer] = useState("");
  const [validationResult, setValidationResult] = useState<{ok: boolean; errors?: string} | null>(null);

  // ---- Preview panel state ----
  const [showPreview, setShowPreview] = useState(false);

  // Initialize jsonBuffer when switching to JSON view
  function openJsonView() {
    if (!lessonDraft) return;
    setJsonBuffer(JSON.stringify(lessonDraft.originalContent, null, 2));
    setValidationResult(null);
    setShowJsonView(true);
  }

  // Build the current content for validation / apply
  function buildCurrentContent(): unknown {
    if (!lessonDraft) return null;
    return {
      ...(lessonDraft.originalContent as Record<string, unknown>),
      discover_cards: draftDiscoverCards,
      exercises: draftExercises,
    };
  }

  async function handleValidate() {
    const content = buildCurrentContent();
    if (!content) return;
    const json = JSON.stringify(content, null, 2);
    setJsonBuffer(json);
    setShowJsonView(true);
    setValidationResult(null);
    // Call the server-side validate endpoint
    try {
      const res = await fetch("/api/admin/lessons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const payload = await res.json();
      if (res.ok) {
        setValidationResult({ ok: true });
      } else {
        setValidationResult({ ok: false, errors: JSON.stringify(payload.details ?? payload.error, null, 2) });
      }
    } catch {
      // Fallback to local parse using the already-imported parseLenient
      const parsed = parseLenient(content);
      setValidationResult(parsed ? { ok: true } : { ok: false, errors: "Local parse failed" });
    }
  }

  function applyJsonView() {
    try {
      const parsed = JSON.parse(jsonBuffer);
      const lenient = parseLenient(parsed);
      if (!lenient) {
        setValidationResult({ ok: false, errors: "JSON is not a valid lesson content structure." });
        return;
      }
      // Re-sync draft arrays from the parsed content
      setDraftDiscoverCards(lenient.discover_cards ?? []);
      setDraftExercises(lenient.exercises ?? []);
      setLessonDraft((d) => d ? {
        ...d,
        content: JSON.stringify(parsed, null, 2),
        originalContent: parsed,
      } : d);
      setEditorState((s) => ({ ...s, dirty: true }));
      setShowJsonView(false);
      setValidationResult(null);
    } catch (err) {
      setValidationResult({ ok: false, errors: `JSON parse error: ${err}` });
    }
  }

  function handleAddCard(type: DiscoverCardType) {
    const starter = createStarterCard(type);
    setDraftDiscoverCards((prev) => [...prev, starter]);
    setEditorState({ mode: "view", editingIndex: null, dirty: true });
  }

  function handleDeleteCard(index: number) {
    setDraftDiscoverCards((prev) => prev.filter((_, i) => i !== index));
    setEditorState({ mode: "view", editingIndex: null, dirty: true });
  }

  function handleDuplicateCard(index: number) {
    const card = draftDiscoverCards[index];
    if (!card) return;
    const dup = { ...card };
    setDraftDiscoverCards((prev) => [
      ...prev.slice(0, index + 1),
      dup,
      ...prev.slice(index + 1),
    ]);
    setEditorState({ mode: "view", editingIndex: null, dirty: true });
  }

  function handleMoveCard(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= draftDiscoverCards.length) return;
    const cards = [...draftDiscoverCards];
    [cards[index], cards[newIndex]] = [cards[newIndex], cards[index]];
    setDraftDiscoverCards(cards);
    setEditorState({ mode: "view", editingIndex: null, dirty: true });
  }

  function handleAddExercise(type: ExerciseType) {
    const starter = createStarterExercise(type);
    setDraftExercises((prev) => [...prev, starter]);
    setEditorState({ mode: "view", editingIndex: null, dirty: true });
  }

  function handleDeleteExercise(index: number) {
    setDraftExercises((prev) => prev.filter((_, i) => i !== index));
    setEditorState({ mode: "view", editingIndex: null, dirty: true });
  }

  function handleDuplicateExercise(index: number) {
    const ex = draftExercises[index];
    if (!ex) return;
    const dup = createStarterExercise(ex.type);
    setDraftExercises((prev) => [
      ...prev.slice(0, index + 1),
      dup,
      ...prev.slice(index + 1),
    ]);
    setEditorState({ mode: "view", editingIndex: null, dirty: true });
  }

  function handleMoveExercise(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= draftExercises.length) return;
    const exs = [...draftExercises];
    [exs[index], exs[newIndex]] = [exs[newIndex], exs[index]];
    setDraftExercises(exs);
    setEditorState({ mode: "view", editingIndex: null, dirty: true });
  }

  if (!selectedChapter || !lessonDraft) {
    return (
      <main className={styles.empty}>
        No curriculum content. Run the seed first.
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      {/* ---- SIDEBAR ---- */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>Warsh</span>
          <span className={styles.brandArabic}>وَرْش</span>
        </div>
        <input
          className={styles.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search content"
        />
        <div className={styles.rail}>
          {filteredChapters.map((chapter) => (
            <button
              className={`${styles.chapterButton} ${
                chapter.id === selectedChapter?.id ? styles.active : ""
              }`}
              key={chapter.id}
              onClick={() => {
                setSelectedChapterId(chapter.id);
                setSelectedLessonId(chapter.lessons[0]?.id ?? "");
                resetDraftFromParsed(chapter.lessons[0]);
              }}
              type="button"
            >
              <span>Ch {chapter.order}</span>
              <strong>{chapter.title}</strong>
              <small>{chapter.lessons.length} lessons</small>
            </button>
          ))}
        </div>
      </aside>

      {/* ---- MAIN WORKSPACE ---- */}
      <section className={styles.workspace}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Content Dashboard</p>
            <h1>Manage Warsh curriculum</h1>
          </div>
          <div className={styles.statusGroup}>
            <span>{chapters.length} chapters</span>
            <span>
              {chapters.reduce((s, c) => s + c.lessons.length, 0)} lessons
            </span>
          </div>
        </header>

        <div className={styles.topbar}>
          <label>
            Admin token
            <input
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Required only if configured"
              type="password"
            />
          </label>
          <span className={styles.saveStatus}>{status}</span>
        </div>

        {/* ---- LESSON BUILDER ---- */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.kicker}>
                Lesson {selectedLesson?.order} — {lessonDraft.title}
              </p>
              <h2>Lesson Builder</h2>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {editorState.dirty && (
                <span style={{ color: "#b04040", fontSize: 13 }}>
                  Unsaved changes
                </span>
              )}
              <button
                className={styles.validateBtn}
                onClick={handleValidate}
                type="button"
              >
                Validate
              </button>
              <button
                className={styles.cancelBtn}
                style={{ borderColor: "#8a651f", color: "#8a651f" }}
                onClick={showJsonView ? () => setShowJsonView(false) : openJsonView}
                type="button"
              >
                {showJsonView ? "Structured view" : "JSON view"}
              </button>
              <button
                className={styles.cancelBtn}
                style={{ borderColor: "#2e7d32", color: "#2e7d32" }}
                onClick={() => setShowPreview((v) => !v)}
                type="button"
              >
                {showPreview ? "Hide preview" : "Preview"}
              </button>
              <button
                className={styles.primaryButton}
                onClick={saveLesson}
                type="button"
              >
                Save lesson
              </button>
            </div>
          </div>

          {/* ---- ADVANCED JSON VIEW ---- */}
          {showJsonView && (
            <div className={styles.jsonViewSection}>
              <div className={styles.jsonViewHeader}>
                <h3>Advanced JSON Editor</h3>
                <div className={styles.jsonViewActions}>
                  {validationResult && (
                    <span style={{
                      color: validationResult.ok ? "#2e7d32" : "#b04040",
                      fontSize: 13,
                      fontWeight: 600,
                    }}>
                      {validationResult.ok ? "✓ Valid" : "✗ Invalid"}
                    </span>
                  )}
                  <button
                    className={styles.jsonApplyBtn}
                    onClick={applyJsonView}
                    type="button"
                  >
                    Apply
                  </button>
                  <button
                    className={styles.jsonCancelBtn}
                    onClick={() => { setShowJsonView(false); setValidationResult(null); }}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {editorState.dirty && (
                <div className={styles.jsonWarning}>
                  ⚠️ You have unsaved structured changes. Applying JSON will replace the current
                  discover cards and exercises with the JSON content.
                </div>
              )}

              {validationResult && !validationResult.ok && (
                <div className={styles.jsonWarning} style={{ color: "#b04040", background: "#ffe0e0", borderColor: "#f5c6c6" }}>
                  <strong>Validation errors:</strong>
                  <pre style={{ margin: "4px 0 0", whiteSpace: "pre-wrap", fontSize: 12 }}>
                    {validationResult.errors}
                  </pre>
                </div>
              )}

              {validationResult && validationResult.ok && (
                <div style={{ background: "#f0fff0", border: "1px solid #a5d6a7", borderRadius: 6, padding: "8px 12px", fontSize: 13, color: "#2e7d32" }}>
                  ✓ Content is structurally valid. Ready to apply.
                </div>
              )}

              <textarea
                className={styles.jsonTextarea}
                value={jsonBuffer}
                onChange={(e) => setJsonBuffer(e.target.value)}
                spellCheck={false}
              />
            </div>
          )}

          {/* Lesson metadata */}
          {showPreview && (
            <div className={styles.previewPanel}>
              <div className={styles.previewHeader}>
                <h3>Lesson Preview — {lessonDraft.title}</h3>
                <button className={styles.cancelBtn} onClick={() => setShowPreview(false)} type="button">Close</button>
              </div>
              <div className={styles.previewBody}>
                {/* Hook */}
                {parsedContent?.hook?.ayah?.ar && (
                  <div className={styles.previewSection}>
                    <div className={styles.previewSectionTitle}>Hook</div>
                    <div style={{ direction: "rtl", fontSize: 20, fontFamily: "Amiri, serif", color: "#1e211b" }}>
                      {parsedContent.hook.ayah.ar}
                    </div>
                    {parsedContent.hook.ayah.en && (
                      <div style={{ fontSize: 13, color: "#6f725f" }}>{parsedContent.hook.ayah.en}</div>
                    )}
                    {parsedContent.hook.noor_intro?.en && (
                      <div style={{ fontSize: 12, color: "#8a651f", marginTop: 4 }}>Noor: {parsedContent.hook.noor_intro.en}</div>
                    )}
                  </div>
                )}

                {/* Discover Cards */}
                {draftDiscoverCards.length > 0 && (
                  <div className={styles.previewSection}>
                    <div className={styles.previewSectionTitle}>Discover Cards ({draftDiscoverCards.length})</div>
                    {draftDiscoverCards.map((card, i) => {
                      const title = card.type === "WORD"
                        ? card.text?.ar
                        : card.type === "CONCEPT" || card.type === "CONTRAST" || card.type === "AYAH_PREVIEW"
                        ? card.concept?.en
                        : card.text?.ar;
                      return (
                        <div key={i} className={styles.previewCard}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span className={styles.previewCardType}>{card.type}</span>
                            <span style={{ fontSize: 11, color: "#8a651f" }}>#{i + 1}</span>
                          </div>
                          {title && <div className={styles.previewCardTitle}>{title}</div>}
                          {card.type === "WORD" && card.text?.en && (
                            <div className={styles.previewCardSubtitle}>{card.text.en}</div>
                          )}
                          {(card.type === "CONCEPT" || card.type === "CONTRAST" || card.type === "AYAH_PREVIEW") && (
                            <div className={styles.previewCardSubtitle}>{card.concept?.ar}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Exercises */}
                {draftExercises.length > 0 && (
                  <div className={styles.previewSection}>
                    <div className={styles.previewSectionTitle}>Practice Exercises ({draftExercises.length})</div>
                    {draftExercises.map((ex, i) => {
                      const prompt = ex.type === "TAP_TRANSLATION" ? ex.prompt?.ar
                        : ex.type === "FILL_BLANK" ? ex.sentence_ar
                        : ex.type === "TRUE_FALSE" ? ex.statement?.en
                        : ex.type === "BUILD_SENTENCE" ? ex.target_translation?.en
                        : ex.type === "GRAMMAR_PARSE" ? ex.sentence_ar
                        : ex.type === "MATCHING" ? `${ex.left_column?.length ?? 0} pairs`
                        : ex.type === "SHADOW_REPEAT" ? ex.phrase?.ar
                        : ex.type === "CONVERSATION_BUILDER" ? ex.prompt_line?.en
                        : ex.type === "AUDIO_RECOGNITION" ? `[Audio ${ex.audio_url ? "URL set" : "no URL"}]`
                        : ex.type === "WRITE_ARABIC" ? ex.prompt?.en
                        : ex.type === "HARAKAH_PLACEMENT" ? ex.word_unvowelled
                        : ex.type === "WORD_ORDER" ? ex.context?.en
                        : ex.type === "TRANSLATE_TO_ARABIC" ? ex.source?.en
                        : ex.type === "IDENTIFY_ROOT" ? ex.word?.ar
                        : ex.type === "MATCH_AYAH" ? ex.ayah_fragment?.ar
                        : null;
                      return (
                        <div key={ex.id} className={styles.previewExercise}>
                          <div className={styles.previewExerciseMeta}>
                            <span className={styles.previewExerciseType}>{ex.type}</span>
                            <span className={styles.previewExerciseId}>{ex.id}</span>
                            {ex.xp_value != null && (
                              <span className={styles.xpChip}>{ex.xp_value}XP</span>
                            )}
                          </div>
                          {prompt && (
                            <div className={styles.previewExercisePrompt} dir="rtl">{prompt}</div>
                          )}
                          {/* TAP_TRANSLATION options preview */}
                          {ex.type === "TAP_TRANSLATION" && ex.options && (
                            <div className={styles.previewExerciseOptions}>
                              {ex.options.map((opt, oi) => (
                                <div key={oi} className={styles.previewOptionItem}>
                                  {oi}: {opt.en}
                                </div>
                              ))}
                            </div>
                          )}
                          {/* MATCHING pairs preview */}
                          {ex.type === "MATCHING" && ex.left_column && (
                            <div style={{ fontSize: 11, color: "#6f725f" }}>
                              {ex.left_column.length} left · {ex.right_column?.length ?? 0} right · {ex.correct_pairs?.length ?? 0} pairs
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reveal */}
                {parsedContent?.reveal && (
                  <div className={styles.previewSection}>
                    <div className={styles.previewSectionTitle}>Reveal</div>
                    <div style={{ fontSize: 13, color: "#5c4a1e" }}>
                      {parsedContent.reveal.concept_name?.en}
                    </div>
                    {parsedContent.reveal.noor_explanation?.en && (
                      <div style={{ fontSize: 12, color: "#6f725f" }}>{parsedContent.reveal.noor_explanation.en}</div>
                    )}
                  </div>
                )}

                {/* Close */}
                {parsedContent?.close?.noor_message?.en && (
                  <div className={styles.previewSection}>
                    <div className={styles.previewSectionTitle}>Close</div>
                    <div style={{ fontSize: 13, color: "#5c4a1e", fontStyle: "italic" }}>
                      {parsedContent.close.noor_message.en}
                    </div>
                  </div>
                )}

                {draftDiscoverCards.length === 0 && draftExercises.length === 0 && (
                  <div className={styles.noPreviewContent}>
                    No discover cards or exercises yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lesson metadata */}
          <div className={styles.grid}>
            <label>
              English title
              <input
                value={lessonDraft.title}
                onChange={(e) =>
                  setLessonDraft((d) => d && { ...d, title: e.target.value })
                }
              />
            </label>
            <label>
              Arabic title
              <input
                dir="rtl"
                value={lessonDraft.titleAr}
                onChange={(e) =>
                  setLessonDraft((d) => d && { ...d, titleAr: e.target.value })
                }
              />
            </label>
            <label>
              Template
              <select
                value={lessonDraft.template}
                onChange={(e) =>
                  setLessonDraft((d) => d && { ...d, template: e.target.value })
                }
              >
                {LESSON_TEMPLATES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              XP reward
              <input
                type="number"
                min={0}
                value={lessonDraft.xpReward}
                onChange={(e) =>
                  setLessonDraft((d) =>
                    d && { ...d, xpReward: Number(e.target.value) }
                  )
                }
              />
            </label>
          </div>

          {/* ---- DISCOVER CARDS ---- */}
          <div className={styles.builderSection}>
            <div className={styles.sectionHeader}>
              <h3>Discover Cards ({draftDiscoverCards.length})</h3>
              <div className={styles.addButtons}>
                {(["WORD", "CONCEPT", "EXAMPLE", "CONTRAST", "AYAH_PREVIEW"] as DiscoverCardType[])
                  .filter((t) => discoverCardFormConfig[t]?.authoringScope)
                  .map((t) => (
                    <button
                      key={t}
                      onClick={() => handleAddCard(t)}
                      type="button"
                      className={styles.addBtn}
                    >
                      + {discoverCardFormConfig[t]?.label?.en ?? t}
                    </button>
                  ))}
              </div>
            </div>
            <div className={styles.cardList}>
              {draftDiscoverCards.map((card, i) => (
                <DiscoverCardItem
                  key={i}
                  card={card}
                  index={i}
                  onEdit={() => {
                    setEditorState({ mode: "edit-card", editingIndex: i, dirty: true });
                  }}
                  onDelete={() => handleDeleteCard(i)}
                  onDuplicate={() => handleDuplicateCard(i)}
                  onMoveUp={() => handleMoveCard(i, -1)}
                  onMoveDown={() => handleMoveCard(i, 1)}
                  canMoveUp={i > 0}
                  canMoveDown={i < draftDiscoverCards.length - 1}
                  onDragStart={(idx) => setDragCardIndex(idx)}
                  onDragOver={(idx) => setDragOverCardIndex(idx)}
                  onDrop={(targetIdx) => {
                    if (dragCardIndex !== null && dragCardIndex !== targetIdx) {
                      const cards = [...draftDiscoverCards];
                      const [moved] = cards.splice(dragCardIndex, 1);
                      cards.splice(targetIdx, 0, moved);
                      setDraftDiscoverCards(cards);
                      setEditorState({ mode: "view", editingIndex: null, dirty: true });
                    }
                    setDragCardIndex(null);
                    setDragOverCardIndex(null);
                  }}
                  isDragOver={dragOverCardIndex === i}
                />
              ))}
              {draftDiscoverCards.length === 0 && (
                <p style={{ color: "#8a651f", fontSize: 13, padding: "8px 0" }}>
                  No discover cards yet. Click "+ Word" or other types above to add.
                </p>
              )}
            </div>
          </div>

          {/* ---- PRACTICE EXERCISES ---- */}
          <div className={styles.builderSection}>
            <div className={styles.sectionHeader}>
              <h3>Practice Exercises ({draftExercises.length})</h3>
              <div className={styles.addButtons}>
                {(
                  [
                    "TRUE_FALSE",
                    "TAP_TRANSLATION",
                    "FILL_BLANK",
                    "BUILD_SENTENCE",
                    "MATCHING",
                  ] as ExerciseType[]
                ).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleAddExercise(t)}
                    type="button"
                    className={styles.addBtn}
                  >
                    + {exerciseFormConfig[t]?.label?.en ?? t}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.cardList}>
              {draftExercises.map((ex, i) => (
                <ExerciseItem
                  key={ex.id}
                  exercise={ex}
                  index={i}
                  onEdit={() => {
                    setEditorState({ mode: "edit-exercise", editingIndex: i, dirty: true });
                  }}
                  onDelete={() => handleDeleteExercise(i)}
                  onDuplicate={() => handleDuplicateExercise(i)}
                  onMoveUp={() => handleMoveExercise(i, -1)}
                  onMoveDown={() => handleMoveExercise(i, 1)}
                  canMoveUp={i > 0}
                  canMoveDown={i < draftExercises.length - 1}
                  onDragStart={(idx) => setDragExerciseIndex(idx)}
                  onDragOver={(idx) => setDragOverExerciseIndex(idx)}
                  onDrop={(targetIdx) => {
                    if (dragExerciseIndex !== null && dragExerciseIndex !== targetIdx) {
                      const exs = [...draftExercises];
                      const [moved] = exs.splice(dragExerciseIndex, 1);
                      exs.splice(targetIdx, 0, moved);
                      setDraftExercises(exs);
                      setEditorState({ mode: "view", editingIndex: null, dirty: true });
                    }
                    setDragExerciseIndex(null);
                    setDragOverExerciseIndex(null);
                  }}
                  isDragOver={dragOverExerciseIndex === i}
                />
              ))}
              {draftExercises.length === 0 && (
                <p style={{ color: "#8a651f", fontSize: 13, padding: "8px 0" }}>
                  No exercises yet. Click "+ True/False" or other types above to add.
                </p>
              )}
            </div>
          </div>

          {/* ---- CARD EDIT FORM ---- */}
          {editorState.mode === "edit-card" && editorState.editingIndex !== null && (
            <CardEditForm
              card={draftDiscoverCards[editorState.editingIndex]}
              index={editorState.editingIndex}
              onSave={(updated) => {
                setDraftDiscoverCards((prev) => {
                  const next = [...prev];
                  next[editorState.editingIndex!] = updated;
                  return next;
                });
                setEditorState({ mode: "view", editingIndex: null, dirty: true });
              }}
              onCancel={() =>
                setEditorState({ mode: "view", editingIndex: null, dirty: true })
              }
            />
          )}

          {/* ---- EXERCISE EDIT FORM ---- */}
          {editorState.mode === "edit-exercise" && editorState.editingIndex !== null && (
            <ExerciseEditForm
              exercise={draftExercises[editorState.editingIndex]}
              index={editorState.editingIndex}
              onSave={(updated) => {
                setDraftExercises((prev) => {
                  const next = [...prev];
                  next[editorState.editingIndex!] = updated;
                  return next;
                });
                setEditorState({ mode: "view", editingIndex: null, dirty: true });
              }}
              onCancel={() =>
                setEditorState({ mode: "view", editingIndex: null, dirty: true })
              }
            />
          )}

          {/* ---- HOOK / REVEAL / CLOSE EDITOR ---- */}
          {parsedContent && (
            <HookRevealCloseEditor
              parsedContent={{
                ...parsedContent,
                hook: draftHRC.hook ?? parsedContent.hook,
                reveal: draftHRC.reveal ?? parsedContent.reveal,
                close: draftHRC.close ?? parsedContent.close,
              }}
              onUpdate={(updated) => {
                setDraftHRC({
                  hook: updated.hook,
                  reveal: updated.reveal,
                  close: updated.close,
                });
                setEditorState((s) => ({ ...s, dirty: true }));
              }}
            />
          )}

          {/* ---- RAW JSON FALLBACK ---- */}
          {parsedContent === null && lessonDraft.originalContent !== null && (
            <div className={styles.jsonGrid}>
              <div className={styles.jsonField} style={{ background: "#fff3cd" }}>
                <p style={{ fontSize: 13, color: "#856404", margin: 0 }}>
                  ⚠️ This lesson could not be parsed structurally. Edits will use raw JSON mode.
                </p>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
