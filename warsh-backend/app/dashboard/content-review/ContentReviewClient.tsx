"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./content-review.module.css";

type ReviewStatus = "NOT_REVIEWED" | "NEEDS_CORRECTION" | "APPROVED";
type IssueStatus = "OPEN" | "RESOLVED" | "DISMISSED";
type Filter = "ALL" | ReviewStatus | "OPEN_ISSUES";

type ReviewIndexLesson = {
  id: string;
  order: number;
  title: string;
  titleUr: string | null;
  titleAr: string;
  template: string;
  status: string;
  updatedAt: string;
  review: {
    status: ReviewStatus;
    reviewedAt: string | null;
    openIssueCount: number;
  };
};

type ReviewChapter = {
  id: string;
  order: number;
  title: string;
  titleUr: string | null;
  titleAr: string;
  imageUrl: string | null;
  status: string;
  lessons: ReviewIndexLesson[];
};

type ReviewSummary = {
  totalChapters: number;
  totalLessons: number;
  approvedLessons: number;
  needsCorrection: number;
  notReviewed: number;
  openIssues: number;
};

type ReviewIssue = {
  id: string;
  blockPath: string;
  blockLabel: string;
  issueType: string;
  note: string;
  mediaUrl: string | null;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

type LessonDetail = {
  id: string;
  order: number;
  title: string;
  titleUr: string | null;
  titleAr: string;
  template: string;
  xpReward: number;
  content: Record<string, unknown>;
  status: string;
  updatedAt: string;
  chapter: {
    id: string;
    order: number;
    title: string;
    titleUr: string | null;
    titleAr: string;
    description: string;
    descriptionUr: string | null;
    imageUrl: string | null;
  };
  review: {
    id: string | null;
    status: ReviewStatus;
    reviewerNote: string | null;
    reviewedAt: string | null;
    updatedAt: string | null;
    issues: ReviewIssue[];
  };
};

type FlagTarget = {
  blockPath: string;
  blockLabel: string;
  mediaUrl?: string;
  suggestedType?: string;
};

const EMPTY_SUMMARY: ReviewSummary = {
  totalChapters: 0,
  totalLessons: 0,
  approvedLessons: 0,
  needsCorrection: 0,
  notReviewed: 0,
  openIssues: 0,
};

const ISSUE_TYPES = [
  ["ARABIC_INCORRECT", "Arabic is incorrect"],
  ["TRANSLATION_INCORRECT", "Translation is incorrect"],
  ["ANSWER_INCORRECT", "Answer or validation is incorrect"],
  ["INSTRUCTION_UNCLEAR", "Instruction is unclear"],
  ["DUPLICATE_CONTENT", "Duplicate content"],
  ["MISSING_CONTENT", "Content is missing"],
  ["FORMATTING_DISPLAY", "Formatting or display problem"],
  ["WRONG_IMAGE", "Wrong image"],
  ["IMAGE_QUALITY", "Image quality or meaning"],
  ["IMAGE_MISSING_BROKEN", "Image missing or broken"],
  ["WRONG_PRONUNCIATION", "Wrong pronunciation"],
  ["AUDIO_UNCLEAR", "Audio unclear or distorted"],
  ["AUDIO_MISMATCH", "Audio belongs to different text"],
  ["AUDIO_MISSING_BROKEN", "Audio missing or broken"],
  ["AUDIO_TIMING", "Audio duration, timing, or silence"],
  ["OTHER", "Other"],
] as const;

const SECTION_LABELS: Record<string, string> = {
  _meta: "Authored metadata",
  hook: "Opening hook",
  discover_cards: "Discover cards",
  spoken_phrases: "Spoken phrases",
  conjugation_table: "Conjugation table",
  exercises: "Exercises",
  reveal: "Quranic reveal",
  close: "Lesson close",
};

function prettyKey(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusLabel(status: ReviewStatus): string {
  if (status === "APPROVED") return "Approved";
  if (status === "NEEDS_CORRECTION") return "Needs correction";
  return "Not reviewed";
}

function issueLabel(type: string): string {
  return ISSUE_TYPES.find(([value]) => value === type)?.[1] ?? prettyKey(type);
}

function isMediaKey(key: string, kind: "image" | "audio"): boolean {
  const compact = key.toLowerCase().replace(/_/g, "");
  return compact.includes(kind) && compact.includes("url");
}

function isArabicKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return normalized === "ar" || normalized === "ar_plain" || normalized.includes("arabic");
}

function isUrduKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return normalized === "ur" || normalized.includes("urdu");
}

async function adminFetch(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (response.status === 401 || response.status === 403) {
    window.location.href = "/dashboard/login";
    throw new Error("Your admin session has expired.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error ?? "The request failed.");
  return payload;
}

export default function ContentReviewClient() {
  const [chapters, setChapters] = useState<ReviewChapter[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>(EMPTY_SUMMARY);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<LessonDetail | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flagTarget, setFlagTarget] = useState<FlagTarget | null>(null);

  const loadIndex = useCallback(async (preferredLessonId?: string | null) => {
    setLoadingIndex(true);
    try {
      const payload = await adminFetch("/api/admin/content-review");
      const nextChapters = payload.data.chapters as ReviewChapter[];
      setChapters(nextChapters);
      setSummary(payload.data.summary as ReviewSummary);

      const urlLesson = new URLSearchParams(window.location.search).get("lesson");
      const nextLessonId =
        preferredLessonId ??
        selectedLessonId ??
        urlLesson ??
        nextChapters.flatMap((chapter) => chapter.lessons)[0]?.id ??
        null;
      if (nextLessonId) {
        setSelectedLessonId(nextLessonId);
        const owner = nextChapters.find((chapter) =>
          chapter.lessons.some((lesson) => lesson.id === nextLessonId),
        );
        if (owner) {
          setExpandedChapterIds((current) => new Set([...current, owner.id]));
        }
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the curriculum.");
    } finally {
      setLoadingIndex(false);
    }
  }, [selectedLessonId]);

  const loadLesson = useCallback(async (lessonId: string) => {
    setLoadingDetail(true);
    try {
      const payload = await adminFetch(`/api/admin/content-review/lessons/${lessonId}`);
      setDetail(payload.data.lesson as LessonDetail);
      setError(null);
    } catch (err) {
      setDetail(null);
      setError(err instanceof Error ? err.message : "Could not load this lesson.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    void loadIndex();
    // Index load is intentionally once on mount; mutations call it explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedLessonId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("lesson", selectedLessonId);
    window.history.replaceState(null, "", url);
    void loadLesson(selectedLessonId);
  }, [loadLesson, selectedLessonId]);

  const filteredChapters = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return chapters
      .map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.filter((lesson) => {
          const matchesFilter =
            filter === "ALL" ||
            (filter === "OPEN_ISSUES"
              ? lesson.review.openIssueCount > 0
              : lesson.review.status === filter);
          const haystack = [
            chapter.order,
            chapter.title,
            chapter.titleAr,
            chapter.titleUr,
            lesson.order,
            lesson.title,
            lesson.titleAr,
            lesson.titleUr,
            lesson.template,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return matchesFilter && (!normalized || haystack.includes(normalized));
        }),
      }))
      .filter((chapter) => chapter.lessons.length > 0);
  }, [chapters, filter, query]);

  function selectLesson(chapterId: string, lessonId: string) {
    setExpandedChapterIds((current) => new Set([...current, chapterId]));
    setSelectedLessonId(lessonId);
  }

  function toggleChapter(chapterId: string) {
    setExpandedChapterIds((current) => {
      const next = new Set(current);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  }

  async function refreshCurrent(message?: string) {
    if (!selectedLessonId) return;
    await Promise.all([loadIndex(selectedLessonId), loadLesson(selectedLessonId)]);
    if (message) {
      setNotice(message);
      window.setTimeout(() => setNotice(null), 3200);
    }
  }

  return (
    <div className={styles.reviewDesk}>
      <header className={styles.masthead}>
        <div>
          <p className={styles.eyebrow}>Warsh Studio · Curriculum assurance</p>
          <h1>Content Review Desk</h1>
          <p className={styles.intro}>
            Read every lesson as a complete document, test its media, and leave a precise correction trail without changing live content.
          </p>
        </div>
        <div className={styles.progressSeal} aria-label={`${summary.approvedLessons} of ${summary.totalLessons} lessons approved`}>
          <strong>{summary.approvedLessons}</strong>
          <span>of {summary.totalLessons}</span>
          <small>approved</small>
        </div>
      </header>

      <section className={styles.summaryStrip} aria-label="Review summary">
        <SummaryButton label="All lessons" value={summary.totalLessons} active={filter === "ALL"} onClick={() => setFilter("ALL")} />
        <SummaryButton label="Not reviewed" value={summary.notReviewed} active={filter === "NOT_REVIEWED"} onClick={() => setFilter("NOT_REVIEWED")} />
        <SummaryButton label="Needs correction" value={summary.needsCorrection} active={filter === "NEEDS_CORRECTION"} onClick={() => setFilter("NEEDS_CORRECTION")} />
        <SummaryButton label="Approved" value={summary.approvedLessons} active={filter === "APPROVED"} onClick={() => setFilter("APPROVED")} />
        <SummaryButton label="Open issues" value={summary.openIssues} active={filter === "OPEN_ISSUES"} onClick={() => setFilter("OPEN_ISSUES")} />
      </section>

      {notice ? <div className={styles.notice}>{notice}</div> : null}
      {error ? <div className={styles.errorBanner}>{error}</div> : null}

      <div className={styles.workspace}>
        <aside className={styles.courseRail}>
          <div className={styles.railHeading}>
            <div>
              <p className={styles.eyebrow}>Course index</p>
              <h2>{summary.totalChapters} chapters</h2>
            </div>
            <span className={styles.filterBadge}>{filter === "ALL" ? "All" : prettyKey(filter)}</span>
          </div>
          <label className={styles.searchBox}>
            <span>Search lessons</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Arabic, English, Urdu, template…"
              type="search"
            />
          </label>
          <div className={styles.chapterList}>
            {loadingIndex ? <RailSkeleton /> : null}
            {!loadingIndex && filteredChapters.length === 0 ? (
              <div className={styles.emptyRail}>No lessons match this view.</div>
            ) : null}
            {filteredChapters.map((chapter) => {
              const expanded = expandedChapterIds.has(chapter.id) || Boolean(query) || filter !== "ALL";
              const approved = chapter.lessons.filter((lesson) => lesson.review.status === "APPROVED").length;
              return (
                <section className={styles.chapterGroup} key={chapter.id}>
                  <button className={styles.chapterToggle} type="button" onClick={() => toggleChapter(chapter.id)}>
                    <span className={styles.chapterNumber}>{String(chapter.order).padStart(2, "0")}</span>
                    <span className={styles.chapterNames}>
                      <strong>{chapter.title}</strong>
                      <small dir="rtl">{chapter.titleAr}</small>
                    </span>
                    <span className={styles.chapterProgress}>{approved}/{chapter.lessons.length}</span>
                    <span aria-hidden="true" className={styles.chevron}>{expanded ? "−" : "+"}</span>
                  </button>
                  {expanded ? (
                    <div className={styles.lessonList}>
                      {chapter.lessons.map((lesson) => (
                        <button
                          className={`${styles.lessonRow} ${selectedLessonId === lesson.id ? styles.lessonRowActive : ""}`}
                          key={lesson.id}
                          type="button"
                          onClick={() => selectLesson(chapter.id, lesson.id)}
                        >
                          <span className={styles.lessonOrder}>L{lesson.order}</span>
                          <span className={styles.lessonNames}>
                            <strong>{lesson.title}</strong>
                            <small dir="rtl">{lesson.titleAr}</small>
                          </span>
                          <StatusDot status={lesson.review.status} openIssues={lesson.review.openIssueCount} />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </aside>

        <section className={styles.documentPane}>
          {loadingDetail ? <DocumentSkeleton /> : null}
          {!loadingDetail && !detail ? (
            <div className={styles.blankDocument}>
              <span>١</span>
              <h2>Select a lesson to begin reviewing</h2>
              <p>The complete authored content and every media asset will appear here.</p>
            </div>
          ) : null}
          {!loadingDetail && detail ? (
            <LessonDocument lesson={detail} onFlag={setFlagTarget} />
          ) : null}
        </section>

        <aside className={styles.reviewRail}>
          {detail ? (
            <ReviewLedger
              lesson={detail}
              onChanged={(message) => void refreshCurrent(message)}
            />
          ) : (
            <div className={styles.reviewPlaceholder}>
              <p className={styles.eyebrow}>Review ledger</p>
              <h2>No lesson selected</h2>
              <p>Choose a lesson to record approval, notes, and individual issues.</p>
            </div>
          )}
        </aside>
      </div>

      {flagTarget && detail ? (
        <IssueDialog
          lessonId={detail.id}
          target={flagTarget}
          onClose={() => setFlagTarget(null)}
          onCreated={async () => {
            setFlagTarget(null);
            await refreshCurrent("Issue added to the review ledger.");
          }}
        />
      ) : null}
    </div>
  );
}

function SummaryButton({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`${styles.summaryItem} ${active ? styles.summaryItemActive : ""}`} type="button" onClick={onClick}>
      <strong>{value}</strong>
      <span>{label}</span>
    </button>
  );
}

function StatusDot({ status, openIssues }: { status: ReviewStatus; openIssues: number }) {
  return (
    <span
      className={`${styles.statusDot} ${styles[`status${status}`]}`}
      title={`${statusLabel(status)}${openIssues ? ` · ${openIssues} open issue${openIssues === 1 ? "" : "s"}` : ""}`}
    >
      {openIssues > 0 ? openIssues : status === "APPROVED" ? "✓" : ""}
    </span>
  );
}

function LessonDocument({ lesson, onFlag }: { lesson: LessonDetail; onFlag: (target: FlagTarget) => void }) {
  const sections = Object.entries(lesson.content).filter(([key]) => !["schema_version", "template"].includes(key));

  return (
    <article className={styles.lessonDocument}>
      <header className={styles.documentHeader}>
        <div className={styles.breadcrumb}>
          Chapter {lesson.chapter.order} · Lesson {lesson.order}
        </div>
        <div className={styles.documentTitleRow}>
          <div>
            <h2>{lesson.title}</h2>
            <p dir="rtl">{lesson.titleAr}</p>
            {lesson.titleUr ? <small dir="rtl">{lesson.titleUr}</small> : null}
          </div>
          <span className={`${styles.reviewStatusPill} ${styles[`pill${lesson.review.status}`]}`}>
            {statusLabel(lesson.review.status)}
          </span>
        </div>
        <div className={styles.documentMeta}>
          <span>{lesson.template.replace(/_/g, " ")}</span>
          <span>{lesson.xpReward} XP</span>
          <span>{lesson.status.toLowerCase()}</span>
          <span>Updated {new Date(lesson.updatedAt).toLocaleDateString()}</span>
          <a href={`/dashboard/curriculum?chapter=${lesson.chapter.id}&lesson=${lesson.id}`}>Open in editor ↗</a>
        </div>
      </header>

      {lesson.chapter.imageUrl ? (
        <section className={styles.chapterContext}>
          <MediaPreview
            kind="image"
            url={lesson.chapter.imageUrl}
            label={`Chapter ${lesson.chapter.order} cover image`}
            path="chapter.imageUrl"
            onFlag={onFlag}
          />
          <div>
            <p className={styles.eyebrow}>Chapter context</p>
            <h3>{lesson.chapter.title}</h3>
            <p>{lesson.chapter.description}</p>
            {lesson.chapter.descriptionUr ? <p dir="rtl">{lesson.chapter.descriptionUr}</p> : null}
          </div>
        </section>
      ) : null}

      <div className={styles.contentSections}>
        {sections.map(([key, value]) => (
          <ContentSection
            key={key}
            sectionKey={key}
            value={value}
            onFlag={onFlag}
          />
        ))}
      </div>
    </article>
  );
}

function ContentSection({
  sectionKey,
  value,
  onFlag,
}: {
  sectionKey: string;
  value: unknown;
  onFlag: (target: FlagTarget) => void;
}) {
  const label = SECTION_LABELS[sectionKey] ?? prettyKey(sectionKey);
  const count = Array.isArray(value) ? value.length : null;

  if (value === undefined) return null;

  return (
    <section className={styles.contentSection}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionNumber}>{sectionKey}</p>
          <h3>{label}</h3>
        </div>
        <div className={styles.sectionActions}>
          {count !== null ? <span>{count} item{count === 1 ? "" : "s"}</span> : null}
          <button
            type="button"
            onClick={() => onFlag({ blockPath: sectionKey, blockLabel: label })}
          >
            Mark section
          </button>
        </div>
      </header>
      <div className={styles.sectionBody}>
        <ValueView value={value} path={sectionKey} label={label} onFlag={onFlag} depth={0} />
      </div>
    </section>
  );
}

function ValueView({
  value,
  path,
  label,
  onFlag,
  depth,
}: {
  value: unknown;
  path: string;
  label: string;
  onFlag: (target: FlagTarget) => void;
  depth: number;
}) {
  if (value === null || value === undefined) {
    return <span className={styles.missingValue}>Not provided</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className={styles.emptyValue}>No items</span>;
    return (
      <div className={styles.arrayList}>
        {value.map((item, index) => {
          const itemObject = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : null;
          const descriptor = itemObject?.type ?? itemObject?.id ?? `${prettyKey(label)} ${index + 1}`;
          return (
            <article className={styles.contentCard} key={`${path}.${index}`}>
              <header className={styles.cardHeader}>
                <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{String(descriptor)}</strong>
                  {itemObject?.id && itemObject?.type ? <small>{String(itemObject.id)}</small> : null}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onFlag({
                      blockPath: `${path}.${index}`,
                      blockLabel: `${label} · ${String(descriptor)}`,
                    })
                  }
                >
                  Mark issue
                </button>
              </header>
              <ValueView
                value={item}
                path={`${path}.${index}`}
                label={`${label} ${index + 1}`}
                onFlag={onFlag}
                depth={depth + 1}
              />
            </article>
          );
        })}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span className={styles.emptyValue}>Empty object</span>;
    return (
      <div className={depth > 1 ? styles.nestedObject : styles.fieldList}>
        {entries.map(([key, child]) => {
          const childPath = `${path}.${key}`;
          if (typeof child === "string" && isMediaKey(key, "image")) {
            return (
              <MediaPreview
                key={childPath}
                kind="image"
                url={child}
                label={prettyKey(key)}
                path={childPath}
                onFlag={onFlag}
              />
            );
          }
          if (typeof child === "string" && isMediaKey(key, "audio")) {
            return (
              <MediaPreview
                key={childPath}
                kind="audio"
                url={child}
                label={prettyKey(key)}
                path={childPath}
                onFlag={onFlag}
              />
            );
          }
          const isLeaf = child === null || ["string", "number", "boolean"].includes(typeof child);
          return (
            <div className={isLeaf ? styles.fieldRow : styles.objectGroup} key={childPath}>
              <div className={styles.fieldHeading}>
                <span>{prettyKey(key)}</span>
                {isLeaf ? (
                  <button
                    type="button"
                    onClick={() =>
                      onFlag({
                        blockPath: childPath,
                        blockLabel: `${label} · ${prettyKey(key)}`,
                        suggestedType: isArabicKey(key)
                          ? "ARABIC_INCORRECT"
                          : isUrduKey(key) || key.toLowerCase() === "en"
                            ? "TRANSLATION_INCORRECT"
                            : undefined,
                      })
                    }
                  >
                    Flag
                  </button>
                ) : null}
              </div>
              {isLeaf ? (
                <PrimitiveValue value={child} fieldKey={key} />
              ) : (
                <ValueView
                  value={child}
                  path={childPath}
                  label={`${label} · ${prettyKey(key)}`}
                  onFlag={onFlag}
                  depth={depth + 1}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return <PrimitiveValue value={value} fieldKey={label} />;
}

function PrimitiveValue({ value, fieldKey }: { value: unknown; fieldKey: string }) {
  if (value === null || value === undefined || value === "") {
    return <span className={styles.missingValue}>Not provided</span>;
  }
  if (typeof value === "boolean") {
    return <span className={value ? styles.booleanTrue : styles.booleanFalse}>{value ? "Yes" : "No"}</span>;
  }
  const rtl = isArabicKey(fieldKey) || isUrduKey(fieldKey);
  const arabic = isArabicKey(fieldKey);
  return (
    <div
      className={`${styles.primitive} ${rtl ? styles.rtlText : ""} ${arabic ? styles.arabicText : ""}`}
      dir={rtl ? "rtl" : "ltr"}
    >
      {String(value)}
    </div>
  );
}

function MediaPreview({
  kind,
  url,
  label,
  path,
  onFlag,
}: {
  kind: "image" | "audio";
  url: string;
  label: string;
  path: string;
  onFlag: (target: FlagTarget) => void;
}) {
  const [broken, setBroken] = useState(false);
  const shortSource = (() => {
    try {
      const parsed = new URL(url);
      return `${parsed.hostname}${parsed.pathname}`;
    } catch {
      return url;
    }
  })();

  return (
    <figure className={`${styles.mediaCard} ${broken ? styles.mediaBroken : ""}`}>
      <figcaption>
        <span className={styles.mediaKind}>{kind}</span>
        <strong>{label}</strong>
        <button
          type="button"
          onClick={() =>
            onFlag({
              blockPath: path,
              blockLabel: `${label} (${kind})`,
              mediaUrl: url,
              suggestedType: broken
                ? kind === "image"
                  ? "IMAGE_MISSING_BROKEN"
                  : "AUDIO_MISSING_BROKEN"
                : kind === "image"
                  ? "WRONG_IMAGE"
                  : "AUDIO_MISMATCH",
            })
          }
        >
          Mark media issue
        </button>
      </figcaption>
      {kind === "image" ? (
        // The dashboard must render arbitrary curriculum URLs, including R2 and legacy sources.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={`Review preview for ${label}`} onError={() => setBroken(true)} onLoad={() => setBroken(false)} />
      ) : (
        <audio controls preload="metadata" src={url} onError={() => setBroken(true)} onCanPlay={() => setBroken(false)}>
          Your browser cannot play this audio.
        </audio>
      )}
      {broken ? <div className={styles.brokenWarning}>This media could not be loaded. Mark it for correction.</div> : null}
      <a href={url} target="_blank" rel="noreferrer" className={styles.mediaSource} title={url}>
        {shortSource} ↗
      </a>
    </figure>
  );
}

function ReviewLedger({
  lesson,
  onChanged,
}: {
  lesson: LessonDetail;
  onChanged: (message: string) => void;
}) {
  const [status, setStatus] = useState<ReviewStatus>(lesson.review.status);
  const [note, setNote] = useState(lesson.review.reviewerNote ?? "");
  const [saving, setSaving] = useState(false);
  const [issueView, setIssueView] = useState<"OPEN" | "HISTORY">("OPEN");

  useEffect(() => {
    setStatus(lesson.review.status);
    setNote(lesson.review.reviewerNote ?? "");
  }, [lesson]);

  const openIssues = lesson.review.issues.filter((issue) => issue.status === "OPEN");
  const visibleIssues =
    issueView === "OPEN"
      ? openIssues
      : lesson.review.issues.filter((issue) => issue.status !== "OPEN");

  async function saveReview() {
    if (status === "APPROVED" && openIssues.length > 0) {
      window.alert("Resolve or dismiss every open issue before approving this lesson.");
      return;
    }
    setSaving(true);
    try {
      await adminFetch(`/api/admin/content-review/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewerNote: note || null }),
      });
      onChanged(status === "APPROVED" ? "Lesson approved." : "Review saved.");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not save the review.");
    } finally {
      setSaving(false);
    }
  }

  async function updateIssue(issueId: string, nextStatus: IssueStatus) {
    try {
      await adminFetch(`/api/admin/content-review/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      onChanged(nextStatus === "OPEN" ? "Issue reopened." : `Issue ${nextStatus.toLowerCase()}.`);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not update the issue.");
    }
  }

  return (
    <div className={styles.ledger}>
      <header className={styles.ledgerHeader}>
        <p className={styles.eyebrow}>Review ledger</p>
        <h2>Decision & notes</h2>
        <p>Review state is private to Warsh Studio and does not edit the lesson.</p>
      </header>

      <label className={styles.ledgerField}>
        <span>Lesson status</span>
        <select value={status} onChange={(event) => setStatus(event.target.value as ReviewStatus)}>
          <option value="NOT_REVIEWED">Not reviewed</option>
          <option value="NEEDS_CORRECTION">Needs correction</option>
          <option value="APPROVED" disabled={openIssues.length > 0}>Approved</option>
        </select>
      </label>

      <label className={styles.ledgerField}>
        <span>Reviewer note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Overall observations, correction priorities, or approval rationale…"
          rows={5}
        />
      </label>

      <button className={styles.saveReviewButton} type="button" disabled={saving} onClick={() => void saveReview()}>
        {saving ? "Saving…" : status === "APPROVED" ? "Approve lesson" : "Save review"}
      </button>

      <div className={styles.issueDivider}>
        <div>
          <p className={styles.eyebrow}>Issue queue</p>
          <strong>{openIssues.length} open</strong>
        </div>
        <div className={styles.issueTabs}>
          <button className={issueView === "OPEN" ? styles.issueTabActive : ""} type="button" onClick={() => setIssueView("OPEN")}>Open</button>
          <button className={issueView === "HISTORY" ? styles.issueTabActive : ""} type="button" onClick={() => setIssueView("HISTORY")}>History</button>
        </div>
      </div>

      <div className={styles.issueList}>
        {visibleIssues.length === 0 ? (
          <div className={styles.noIssues}>
            <span>{issueView === "OPEN" ? "✓" : "—"}</span>
            <p>{issueView === "OPEN" ? "No open issues for this lesson." : "No resolved or dismissed issues."}</p>
          </div>
        ) : null}
        {visibleIssues.map((issue) => (
          <article className={styles.issueCard} key={issue.id}>
            <div className={styles.issueCardTop}>
              <span className={`${styles.issueState} ${styles[`issue${issue.status}`]}`}>{issue.status}</span>
              <time>{new Date(issue.createdAt).toLocaleDateString()}</time>
            </div>
            <strong>{issueLabel(issue.issueType)}</strong>
            <small>{issue.blockLabel}</small>
            <code>{issue.blockPath}</code>
            <p>{issue.note}</p>
            {issue.mediaUrl ? <a href={issue.mediaUrl} target="_blank" rel="noreferrer">Open flagged media ↗</a> : null}
            <div className={styles.issueActions}>
              {issue.status === "OPEN" ? (
                <>
                  <button type="button" onClick={() => void updateIssue(issue.id, "RESOLVED")}>Resolve</button>
                  <button type="button" onClick={() => void updateIssue(issue.id, "DISMISSED")}>Dismiss</button>
                </>
              ) : (
                <button type="button" onClick={() => void updateIssue(issue.id, "OPEN")}>Reopen</button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function IssueDialog({
  lessonId,
  target,
  onClose,
  onCreated,
}: {
  lessonId: string;
  target: FlagTarget;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [issueType, setIssueType] = useState(target.suggestedType ?? "OTHER");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await adminFetch("/api/admin/content-review/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          blockPath: target.blockPath,
          blockLabel: target.blockLabel,
          issueType,
          note,
          mediaUrl: target.mediaUrl ?? null,
        }),
      });
      await onCreated();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not create the issue.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={styles.issueDialog} role="dialog" aria-modal="true" aria-labelledby="issue-dialog-title">
        <header>
          <div>
            <p className={styles.eyebrow}>Mark content issue</p>
            <h2 id="issue-dialog-title">{target.blockLabel}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </header>
        <code>{target.blockPath}</code>
        {target.mediaUrl ? <a href={target.mediaUrl} target="_blank" rel="noreferrer">Open media source ↗</a> : null}
        <label>
          <span>Issue category</span>
          <select value={issueType} onChange={(event) => setIssueType(event.target.value)}>
            {ISSUE_TYPES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <label>
          <span>What is wrong?</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Be specific enough that the correction can be made without rediscovering the problem."
            rows={6}
            autoFocus
          />
        </label>
        <footer>
          <button type="button" onClick={onClose}>Cancel</button>
          <button className={styles.dialogPrimary} type="button" disabled={!note.trim() || saving} onClick={() => void submit()}>
            {saving ? "Adding…" : "Add to issue queue"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function RailSkeleton() {
  return (
    <div className={styles.skeletonStack}>
      {[1, 2, 3, 4].map((item) => <div className={styles.skeletonLine} key={item} />)}
    </div>
  );
}

function DocumentSkeleton() {
  return (
    <div className={styles.documentSkeleton}>
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}
