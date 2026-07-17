# Warsh Comprehensive App QA Issues

**Test date:** 16 July 2026  
**Test target:** Production Android release `1.0.3` (`versionCode` 4) on the `Warsh_API_34` emulator  
**Production API:** `https://api.warsh.app`  
**Purpose:** Working issue list from the complete app-journey test. Check an item only after its fix has been verified in the running app.

## Status legend

- [ ] Open
- [~] Fixed in code, runtime/browser verification still pending
- [x] Fixed and verified
- **High:** Release-critical or substantially misleading/broken functionality
- **Medium:** User-facing functional defect with a workaround
- **Low:** Incorrect or confusing presentation that does not block the main journey

## Summary

| ID | Severity | Area | Issue | Status |
| --- | --- | --- | --- | --- |
| QA-001 | High | Lesson audio | All authored lesson audio URLs return 404; generated speech silently masks the failure | [~] Code fixed; words/phrases R2 upload + runtime verify pending |
| QA-002 | High | Public website | Landing-page Privacy Policy and Terms links return 404 | [~] Fixed, pending browser verify |
| QA-003 | Medium | Noor | Noor responds in Urdu while both language settings are English | [~] Fixed, pending runtime verify |
| QA-004 | Medium | Noor | Daily message-usage counter does not update after sending a message | [~] Fixed, pending runtime verify |
| QA-005 | Medium | Noor | First-question reward redirects away before the user can read the reply | [~] Fixed, pending runtime verify |
| QA-006 | Medium | Lesson images | Jannah discovery image returns 404 | [~] Fixed (repointed to hosted garden image), pending re-seed/verify |
| QA-007 | Low | Settings | App displays version 1.0.0 instead of installed version 1.0.3 | [~] Fixed, pending runtime verify |
| QA-008 | Low | Learn progress | Progress labels communicate two different-looking lesson counts | [~] Fixed, pending runtime verify |
| QA-009 | Low | Vocabulary | Profile and Vocabulary screens use the same label for different word counts | [~] Fixed, pending runtime verify |

---

## QA-001 — Authored lesson audio URLs are broken and silently replaced by generated speech

- [x] Fixed in code (ayah recitation + no-TTS-fallback + batch tooling)
- [ ] Verified on Android
- [ ] Verified with Quran recitation
- [ ] Verified after a fresh install/cache clear

**Severity:** High  
**Area:** Lessons, Quran connection, audio playback  
**Observed result:** All 514 unique `audio_url` values found in the current 391 lesson fixtures returned HTTP 404. Audio buttons can still produce sound because the client silently falls back to generated text-to-speech when remote audio fails. This makes the authored recording failure difficult for users and testers to detect.  
**Expected result:** Every authored audio URL should return the intended recording. Quran recitation must use the approved human recitation, not generated speech.

**Relevant code:**

- `warsh-app/components/PlayButton.tsx:44-55` catches a remote-audio failure and falls back to vocabulary audio or generated TTS.
- Lesson fixture files under `warsh-backend/prisma/fixtures/` contain the affected remote URLs.

**Reproduction:**

1. Collect every unique `audio_url` from the lesson fixtures.
2. Request each URL directly.
3. Observe HTTP 404 for all 514 URLs.
4. Open a lesson in the Android app and press an audio button.
5. Sound may still play because the failed request is replaced with generated speech.

**Acceptance criteria:**

1. Every fixture audio URL returns HTTP 200 and a valid playable audio asset.
2. The app plays the authored recording rather than generated speech.
3. Quran ayah playback is confirmed to use a human recitation.
4. A validator or deployment check detects unreachable fixture media before release.
5. The app surfaces an audio error instead of silently disguising a missing required recording.

**Fix/verification notes:**

> **Clarified design (from product owner):** there are no human recordings. Word/phrase audio is
> TTS **by design**; Quran ayahs use the **open-source reciter** (Mishary Alafasy on everyayah.com),
> same as the onboarding preview. Premium reciter files on the R2 `audio/quran/…` path are a future
> addition. So the audio splits into two tracks, fixed separately.
>
> **A) Quran ayahs → open-source reciter (done in code).**
> - `warsh-backend/scripts/repoint-ayah-audio-to-everyayah.cjs` rewrote **all 736** ayah `audio_url`s
>   from the dead `…r2.dev/audio/quran/*-mishary.mp3` to
>   `https://everyayah.com/data/Alafasy_128kbps/SSSAAA.mp3`, derived from each object's `surah`/`ayah`
>   (11 legacy slug-only refs handled via an override map). Run with `npm run audio:repoint-ayahs`.
>   Verified: **202/202** unique everyayah URLs return HTTP 200 (`npm run media:check-fixtures -- --audio --quran-only`).
> - `PlayButton.tsx` now **never** substitutes TTS for recitation: any `everyayah.com` or
>   `/audio/quran/` URL that fails surfaces the error state instead of falling back (AC-2/3/5).
> - The R2 `audio/quran/…` path is left untouched for the future premium reciter set.
>
> **B) Word/phrase TTS → generate-once, serve from R2 CDN (tooling done; upload pending).**
> - `warsh-backend/scripts/prebuild-fixture-audio.ts` (`npm run audio:prebuild-fixtures`) batch-
>   generates the TTS for every non-Quran `audio_url` (vocab/phrases/spoken/dua) and uploads it to
>   the exact R2 key the fixture references, so one generation serves all users (no per-device cost).
>   Dry-run confirms **280/280** unique files resolve to Arabic text (0 unmatched). **Still needs to
>   be run once with `OPENAI_API_KEY` + `R2_*` creds** to populate the bucket — I can't run it here.
>
> **C) Guardrail (done).** `warsh-backend/scripts/check-fixture-media.cjs`
> (`npm run media:check-fixtures`) HEAD-checks every fixture `audio_url`/`image_url` and exits
> non-zero on any non-200 — wire into CI/pre-release (AC-4).
>
> **Static verification:** backend + app typecheck clean; 391 fixtures still validate; Urdu audit passes.
>
> **Pending:** (1) run `npm run audio:prebuild-fixtures` with creds to populate word/phrase audio;
> (2) `npm run db:seed` so the DB serves the new URLs; (3) redeploy web (`npm run deploy:web`);
> (4) device verification — tap word/phrase audio (TTS) and an ayah (reciter, no TTS fallback).

---

## QA-002 — Landing-page Privacy Policy and Terms links return 404

- [x] Fixed
- [ ] Verified in a browser
- [ ] Verified from the landing-page footer

**Severity:** High  
**Area:** Public website, legal/release compliance  
**Observed result:** The landing page links to `/privacy` and `/terms`, but both public routes return HTTP 404:

- `https://warsh.app/privacy` → 404
- `https://warsh.app/terms` → 404

The API-hosted legal routes work:

- `https://api.warsh.app/privacy` → 200
- `https://api.warsh.app/terms` → 200

**Expected result:** Privacy Policy and Terms links on the public landing page should open live legal pages successfully.

**Relevant code:**

- `landing/index.html:995-996` links to `/privacy` and `/terms`.
- The protected privacy source is `Docs/privacy-policy.html`.

**Reproduction:**

1. Open `https://warsh.app`.
2. Select **Privacy Policy** in the footer.
3. Observe a 404 response.
4. Return and select **Terms of Service**.
5. Observe a 404 response.

**Acceptance criteria:**

1. Both landing-page footer links return HTTP 200.
2. The URLs satisfy the Google Play listing/legal requirements.
3. The in-app Settings, onboarding and paywall legal links also open successfully.
4. The protected public page URLs are preserved.

**Fix/verification notes:**

> **Fixed in code.** `landing/index.html:995-996` footer links repointed from relative `/privacy`
> and `/terms` (which 404 on the static warsh.app host) to the working absolute
> `https://api.warsh.app/privacy` and `https://api.warsh.app/terms`. These were the only two
> occurrences in the file. In-app Settings/paywall links already use `${API_BASE_URL}/terms`
> (`settings.tsx:490`) so they were unaffected (AC-3). `Docs/privacy-policy.html` untouched (AC-4).
>
> Cleaner long-term alternative (not done): a host-level rewrite `warsh.app/privacy` →
> `api.warsh.app/privacy` to keep the apex-domain URL.
>
> **Pending:** load `https://warsh.app` in a browser and click both footer links to confirm 200.

---

## QA-003 — Noor responds in Urdu while the selected languages are English

- [x] Fixed
- [ ] Verified in English mode
- [ ] Verified in Urdu mode

**Severity:** Medium  
**Area:** Noor AI tutor, localization  
**Observed result:** With both the app language and meaning language set to English, the question `What is rahim` received a response written entirely in Urdu.  
**Expected result:** Noor should use the configured response/meaning language unless the user explicitly requests another language.

**Reproduction:**

1. Set app language to English.
2. Set meaning language to English.
3. Open Noor.
4. Send `What is rahim`.
5. Observe that the response is in Urdu.

**Acceptance criteria:**

1. English settings produce an English explanation.
2. Urdu settings produce an Urdu explanation.
3. Arabic learning content remains Arabic in both modes.
4. The selected language is enforced by the backend/prompt rather than inferred unreliably.

**Fix/verification notes:**

> **Fixed in code.** Root cause: `warsh-backend/lib/openai.ts` only injected an explicit language
> instruction when `responseLanguage === "ur"`. For English it appended nothing, leaving the model
> to infer language from a soft system-prompt line — so an Islamic term like *rahim* nudged the
> South-Asian-scholar persona into Urdu. Now the target language is stated explicitly for both
> branches ("Always respond in English…" / "Always respond in Urdu…"), keeping Arabic terms in
> Arabic script (AC-3). The plumbing (`resolveContentLanguage` → `translationLanguage`) was already
> correct, so no client change was needed. Language-resolution unit tests still pass (9/9).
>
> **Pending:** send `What is rahim` with both languages set to English (expect English) and to Urdu
> (expect Urdu) against a running backend.

---

## QA-004 — Noor daily message counter does not update

- [x] Fixed
- [ ] Verified immediately after sending
- [ ] Verified after reopening Noor
- [ ] Verified after restarting the app

**Severity:** Medium  
**Area:** Noor usage allowance  
**Observed result:** The header continued to display `0 of 5 messages used today` after a message was sent successfully. Returning to Noor did not correct the displayed count.  
**Expected result:** After the first successful message, the counter should display `1 of 5 messages used today` and remain accurate after navigation or reload.

**Reproduction:**

1. Open Noor when the counter shows `0 of 5`.
2. Send a message and wait for the reply.
3. Check the counter.
4. Navigate away and return to Noor.
5. Observe that it still shows `0 of 5`.

**Acceptance criteria:**

1. The count updates immediately after the backend accepts a message.
2. The count remains correct after tab navigation and app restart.
3. The displayed counter and backend enforcement use the same source of truth.

**Fix/verification notes:**

> **Fixed in code.** Root cause: the counter was only ever set inside `sendMessage`
> (`chat.tsx`); on open, `loadHistory` fetched messages but not usage, and `GET /api/chat/history`
> didn't return usage — so every fresh mount / tab-refocus reset to the initial `{used:0, limit:5}`.
> Fixes:
> 1. `warsh-backend/app/api/chat/history/route.ts` now computes and returns `messagesUsedToday`,
>    `messagesLimit`, and `noorOverageBalance` using the same PKT-day count as `POST /api/chat`
>    (single source of truth — AC-3).
> 2. `warsh-app/app/(app)/(tabs)/chat.tsx` `loadHistory` now `setUsage(...)` from that response, so
>    the header reflects server truth on every open, tab switch, and app restart (AC-1/2).
>
> **Pending:** send a message and confirm `0 of 5` → `1 of 5`, then switch tabs / restart and
> confirm it stays correct.

---

## QA-005 — First-question reward interrupts the Noor response journey

- [x] Fixed
- [ ] Verified for a new user's first question
- [ ] Verified that the reply remains visible

**Severity:** Medium  
**Area:** Noor, milestones, navigation  
**Observed result:** After the first Noor question succeeded, the first-question milestone appeared. Pressing **Continue** on the reward redirected to the Learn tab. The Noor reply was not shown until Noor was opened manually again.  
**Expected result:** The reward should return the user to the Noor conversation, with the reply visible and preserved.

**Reproduction:**

1. Use an account that has never completed the first-Noor-question milestone.
2. Send a valid question.
3. Wait for the reward screen.
4. Press **Continue**.
5. Observe that the app opens Learn instead of returning to the Noor answer.

**Acceptance criteria:**

1. Continue returns to the originating Noor conversation.
2. The answer is visible without extra navigation.
3. The message and reward are not duplicated after reopening the app.

**Fix/verification notes:**

> **Fixed in code.** Root cause: `chat.tsx` pushed the milestone screen with `nextRoute: "tabs"`,
> and `milestone-celebration.tsx` treated anything but `"streak-celebration"` as
> `router.replace("/(app)/(tabs)")` → the default (Learn) tab. Fixes:
> 1. `chat.tsx` now passes `nextRoute: "chat"`.
> 2. `milestone-celebration.tsx handleContinue` adds a `nextRoute === "chat"` branch →
>    `router.replace("/(app)/(tabs)/chat")`.
>
> The reply is persisted server-side and `loadHistory` runs on focus, so returning to Noor shows the
> answer with no duplication (AC-1/2/3). Depends on the QA-004 `loadHistory` change so the returned
> screen also shows the right counter.
>
> **Pending:** with a fresh account, ask the first Noor question and confirm Continue returns to the
> Noor conversation with the reply visible.

---

## QA-006 — Jannah lesson discovery image returns 404

- [x] Fixed in code
- [ ] Verified in the lesson
- [ ] Verified by direct asset request

**Severity:** Medium  
**Area:** Lesson imagery  
**Observed result:** One of the 27 unique fixture image URLs returned HTTP 404: `images/discover/janna.png`. The other 26 image URLs returned HTTP 200.  
**Expected result:** Every image referenced by a lesson should load successfully.

**Relevant code:**

- `warsh-backend/prisma/fixtures/chapter-01-lesson-03.json:120`

**Reproduction:**

1. Request the `janna.png` URL from the Chapter 1 Lesson 3 fixture.
2. Observe HTTP 404.
3. Open the corresponding discovery card in the running app.
4. Observe the missing/broken illustration behavior.

**Acceptance criteria:**

1. The URL returns HTTP 200 with the correct image.
2. The image renders correctly on Android and web.
3. Fixture validation checks media reachability.

**Fix/verification notes:**

> **Fixed in code.** Confirmed against the live bucket: `images/discover/janna.png` is genuinely
> missing (404 under both `janna.png` and `jannah.png`), and there is **no `janna` source image** in
> the repo — the nearest asset is `hadiqa-garden` (garden), already uploaded as
> `images/discover/hadiqa.png` (HTTP 200) and unused by any fixture. Since the janna card literally
> teaches "**garden / paradise**", repointed `chapter-01-lesson-03.json:120` `image_url` →
> `images/discover/hadiqa.png` rather than block on new art. Verified: all **27/27** fixture images
> now return 200 (`npm run media:check-fixtures -- --images`). Replace with a dedicated paradise
> illustration later if desired.
>
> Guardrail: `check-fixture-media.cjs` now covers images too (AC-3).
>
> **Pending:** `npm run db:seed` so the DB serves the new URL; confirm the card renders in-app.

---

## QA-007 — Settings displays the wrong app version

- [x] Fixed
- [ ] Verified against Android package metadata

**Severity:** Low  
**Area:** Settings → About  
**Observed result:** Settings displays `1.0.0`, while the tested installed release and `app.json` are version `1.0.3` with Android `versionCode` 4.  
**Expected result:** Settings should display the installed build's actual version.

**Relevant code:**

- `warsh-app/app/(app)/settings.tsx:507` hardcodes `1.0.0`.
- `warsh-app/app.json:6` defines `1.0.3`.
- `warsh-app/app.json:33` defines Android version code 4.

**Acceptance criteria:**

1. The UI reads the version from application metadata instead of a hardcoded string.
2. The displayed value matches the installed APK/AAB version.

**Fix/verification notes:**

> **Fixed in code.** `settings.tsx:507` no longer hardcodes `1.0.0`; it now renders
> `Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? ""` (added `import Constants from
> "expo-constants"`, already a dependency). This tracks `app.json` automatically, so future version
> bumps won't drift (AC-1/2). Typecheck clean.
>
> **Pending:** open Settings → About in the installed build and confirm it reads `1.0.3`.

---

## QA-008 — Learn progress labels appear inconsistent

- [x] Fixed
- [ ] Verified before and after completing a lesson

**Severity:** Low  
**Area:** Learn dashboard, chapter journey  
**Observed result:** The Learn card displayed `Progress 2 of 4` while the chapter screen displayed `1/4 lessons completed`. The first value appears to mean the current lesson position, but the word “Progress” makes it look like a conflicting completion count.  
**Expected result:** Current lesson position and completed-lesson count should be clearly distinguished.

**Reproduction:**

1. Open Learn while Chapter 2 Lesson 2 is current and only Lesson 1 is complete.
2. Compare the main Learn card with **View chapter**.
3. Observe `Progress 2 of 4` versus `1/4 lessons completed`.

**Acceptance criteria:**

1. Use wording such as `Lesson 2 of 4` for position.
2. Use `1 of 4 lessons completed` only for completion count.
3. Both screens update correctly after lesson completion.

**Fix/verification notes:**

> **Fixed in code.** The Learn card's value (`index.tsx`, `lessonProgress` = `activeLessonIndex + 1`
> of total) is a *position*, but it sat under the label "Progress", which read like a completion
> count and clashed with the chapter screen's "X / Y lessons completed". Renamed the `learn.progress`
> label: en "Current lesson", ur "موجودہ سبق" (`i18n/en.ts`, `i18n/ur.ts`). Card now reads
> "Current lesson … 2 of 4"; chapter screen keeps "1 / 4 lessons completed" — clearly distinct
> (AC-1/2). No data change, so both still update on completion (AC-3).
>
> **Pending:** eyeball both screens before/after completing a lesson.

---

## QA-009 — “Words in bank” represents different counts on different screens

- [x] Fixed
- [ ] Verified on Profile and Vocabulary

**Severity:** Low  
**Area:** Profile, Vocabulary  
**Observed result:** Profile showed `182 words in bank`, while Vocabulary showed `585 words in bank`. The numbers may represent learned words versus the complete vocabulary catalog, but both screens use the same label.  
**Expected result:** Each count should have a label that explains what it measures.

**Reproduction:**

1. Open Vocabulary and note the `585 words in bank` count.
2. Open the You/Profile tab and note the `182 words in bank` count.
3. Compare the identical labels.

**Acceptance criteria:**

1. Confirm the intended meaning of each value.
2. Use distinct labels, such as `Words learned` and `Words available`, if they represent different datasets.
3. If they are intended to represent the same value, correct the data source so the counts match.

**Fix/verification notes:**

> **Fixed in code.** The two counts are genuinely different datasets sharing one label: Vocabulary
> shows `allWords.length` (full catalog, 585) and Profile shows `data.vocabTotal` (words the user has
> learned, 182). Gave them distinct labels (AC-2) rather than forcing a match: Vocabulary
> `vocabulary.wordsInBank` → en "words available" / ur "دستیاب الفاظ"; Profile `profile.wordsInBank`
> → en "words learned" / ur "سیکھے گئے الفاظ" (`i18n/en.ts`, `i18n/ur.ts`). The 585 figure is
> confirmed by the Urdu audit ("585 vocabulary words"), validating the catalog semantics.
>
> **Pending:** confirm the two labels render correctly on Profile and Vocabulary.

---

## Verification still required outside this emulator test

These are not confirmed defects. They remain release-test requirements because completing them requires a Play-installed build, physical-device capability, credentials or a destructive/account-changing action.

- [ ] Complete a real Google Play test subscription purchase.
- [ ] Restore a Google Play subscription from a Play-installed build.
- [ ] Verify microphone/speaking exercises on a physical Android device.
- [ ] Verify notification permission, scheduling and delivery on a physical Android device.
- [ ] Verify clean registration, login, logout, forgot-password and session restoration with dedicated QA credentials.
- [ ] Verify the final password-change submission.
- [ ] Verify final account deletion using a disposable QA account.
- [ ] Verify Android sharing by sending to a controlled test destination.

## Features verified as working during this test

- Production Android release startup and signed-in session restoration
- Learn dashboard, chapters and lesson locking presentation
- Complete Chapter 2 lesson journey and persisted completion
- Correct-answer and incorrect-answer feedback
- Matching, true/false and sentence-construction exercises
- Quran connection screen and audio control behavior
- Lesson reward, points, daily goal and streak presentation
- Vocabulary dashboard, topics, English search, word details and images
- SRS review, rating, favorites and hide-from-review controls
- Noor message delivery and first-question milestone award
- Profile, milestones, edit-profile presentation and streak details
- Settings language sheets, audio, autoplay and haptic toggles
- Paywall plan toggle and live price presentation
- Share preview and Android share-sheet launch
- Delete-account warning/cancellation safeguard
- Production API health, public landing page and hosted web application
- Backend build, app lint, TypeScript, fixture validation and Urdu audit

