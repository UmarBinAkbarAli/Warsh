# Warsh · وَرْش — App Specification
## File 06: Spoken Fus'ha

**Status:** Locked
**Version:** 1.0
**Last updated:** 2026-05-19
**Depends on:** File 01 (Identity & Principles), File 02 (Information Architecture), File 04 (Lesson System), File 05 (Curriculum & Content)

> This file specifies the speaking dimension of Warsh in full detail — the SHADOW_REPEAT exercise mechanics, SPOKEN_PHRASES lesson behavior, microphone capture, audio comparison playback, and the stats system that tracks the user's growing speaking ability.

---

## Part 1 — The Speaking Philosophy

### 1.1 What Warsh teaches about speaking

Warsh teaches users to **speak Fus'ha** — the classical Arabic of the Quran, khutbahs, scholarship, and worship. Not dialect.

A user who completes Warsh can:

- Greet anyone in any Arab country in a way that signals respect and education
- Ask questions of a scholar, teacher, or imam in their native language register
- Recite du'a aloud with comprehension of what they're saying
- Speak appropriately at a masjid, halaqa, or Islamic gathering
- Hold a basic conversation in Fus'ha with another educated Muslim

The user **cannot** chat casually with a Saudi taxi driver in Khaleeji dialect, follow a Lebanese TV show in colloquial Levantine, or order coffee in Cairo using Egyptian Arabic. This is honest and we say so.

### 1.2 Speaking is woven, not bolted on

Per File 01's locked decisions, speaking is **not a separate mode or tab.** It lives inside the existing lesson flow through:

- **SHADOW_REPEAT exercises** — distributed throughout the Practice beat of standard lessons
- **SPOKEN_PHRASES lessons** — dedicated lessons at strategic chapter intervals (11 lessons total per File 05)
- **AUDIO_RECOGNITION exercises** — listening comprehension that supports speaking ear development

This integration is intentional. A separate "Speak Mode" tab would let users avoid speaking. By weaving it into every lesson, speaking becomes a natural part of learning Arabic in Warsh — not an optional add-on.

### 1.3 No pronunciation scoring

Locked decision (File 01): **Warsh does not use AI-based pronunciation scoring in v1.**

Why:

- Accurate Arabic ASR is genuinely hard, and existing solutions (Whisper, Google) are unreliable for tajweed and Fus'ha
- Pronunciation scoring requires either custom ML infrastructure or expensive third-party APIs ($0.06+ per minute of audio)
- Inaccurate scoring is worse than no scoring — it teaches users to mistrust the app
- The simpler approach (listen-and-compare) achieves 80% of the learning value at 0% of the engineering cost

What we do instead: **SHADOW_REPEAT** — the user records themselves, then hears their voice side-by-side with the original. They self-correct. This is how humans naturally learn pronunciation anyway — listen carefully, imitate, compare, refine.

If beta users overwhelmingly request automated scoring, we revisit in v2.

---

## Part 2 — SHADOW_REPEAT Exercise (Deep Specification)

The core speaking mechanic. Appears throughout standard lessons and inside SPOKEN_PHRASES lessons.

### 2.1 When SHADOW_REPEAT appears

| Context | Frequency |
|---|---|
| Inside a standard lesson's Practice beat | 1–2 per lesson (curriculum author's choice) |
| Inside a SPOKEN_PHRASES lesson | 10 times (one per phrase) |
| Inside a REVIEW lesson | 0–2 occasional (when reviewing speaking-relevant content) |
| Inside a VERB_PATTERN lesson | 1–2 (for practicing conjugated verb forms) |

In total across the 72-chapter curriculum, the user will encounter SHADOW_REPEAT exercises **hundreds of times**. By the end of Book 1 alone, a user has practiced at least 20–30 SHADOW_REPEAT exercises.

### 2.2 SHADOW_REPEAT exercise flow

The exercise is structured as a linear sequence of micro-states. The user moves through them tap-by-tap, never skipping a state.

#### State 1: Prepare

When the exercise mounts:

- The Arabic phrase appears at the top, large (Scheherazade New, full harakat)
- Transliteration below the Arabic
- Translation in the user's UI language below the transliteration
- A large play button is centered on screen, labeled "Listen first"
- The mic button is greyed out until the user has listened at least once

**Visual:**
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│         هَذَا كِتَاب              │  ← Arabic, large
│       hādhā kitāb               │  ← Transliteration
│      "This is a book"           │  ← Translation
│                                 │
│         ┌─────────┐             │
│         │   ▶     │             │  ← Play button
│         │ Listen  │             │
│         └─────────┘             │
│                                 │
│      🎤 (greyed out)            │
│      Speak (locked until you    │
│       listen)                   │
└─────────────────────────────────┘
```

#### State 2: Listening

User taps "Listen":

- Audio plays the phrase (a clear, slow-paced Fus'ha pronunciation)
- A subtle waveform animation appears under the Arabic text while audio plays
- When audio completes:
  - The mic button activates (no longer greyed out)
  - The play button changes to "Listen again" (user can replay as many times as needed)
  - A subtle prompt appears: "Now you try"

#### State 3: Ready to record

The mic button is enabled, labeled "Speak":

- User can replay the original as many times as they want
- When ready, user taps "Speak" to begin recording

#### State 4: Recording

User taps "Speak":

- Microphone access activates (if not already granted; see Section 5 for permission handling)
- A recording indicator appears:
  - The mic button transforms into a "Stop recording" button (red circle pulse animation)
  - A live waveform appears below the Arabic, animating in real-time as user speaks
  - A small timer shows recording duration: "0:03"
- Maximum recording duration: **15 seconds** (auto-stops if exceeded)
- User taps "Stop" when done speaking

#### State 5: Comparison

After recording stops:

- The screen shows a comparison panel:
  - Top: "Original" with play button and waveform visualization
  - Bottom: "You" with play button and waveform visualization
- User can tap either to replay
- A subtle "Compare" button plays them in sequence (original → user) for easy comparison
- User can re-record by tapping "Record again" — replaces previous recording
- When satisfied, user taps "Done" to advance

**Visual:**
```
┌─────────────────────────────────┐
│         هَذَا كِتَاب              │
│       "This is a book"          │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Original  ▶  ▁▂▆█▇▄▂   │    │  ← Original
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ You      ▶  ▁▃▆▇█▅▂    │    │  ← User
│  └─────────────────────────┘    │
│                                 │
│   [ Record again ]  [ Done ]    │
└─────────────────────────────────┘
```

#### State 6: Completed

User taps "Done":

- Exercise is marked completed
- No "correct" / "wrong" feedback (there is no judgment in SHADOW_REPEAT)
- A subtle, warm message from Noor appears briefly: "Well spoken" or "Keep going"
- Exercise advances to the next exercise in the lesson

### 2.3 What gets recorded and stored

**Locked decision: Recordings are NEVER uploaded to the server.**

User audio recordings are:

- Captured locally on the device
- Stored temporarily in the app's cache directory
- Played back for the user's self-comparison
- **Deleted automatically** when the user advances past the exercise OR exits the lesson OR closes the app

**Privacy commitment:** "Your recordings stay on your device. We don't store, transmit, or analyze them. They exist only for you to compare."

This is communicated to the user:
- During onboarding (B9 microphone permission ask)
- In the Settings screen
- In the in-context microphone permission ask (M3 modal)

**Why this matters:**

1. **Privacy:** Users (especially in Pakistan and conservative contexts) are wary of voice recordings being uploaded
2. **Cost:** Storing and processing audio at scale is expensive
3. **Simplicity:** No server-side audio infrastructure needed
4. **Trust:** Explicit privacy commitment differentiates Warsh from data-hungry apps

### 2.4 Recording technical specs

| Parameter | Value |
|---|---|
| Format | WAV or AAC (whatever Expo AV defaults to per platform) |
| Sample rate | 16 kHz (sufficient for speech, smaller file size than 44.1 kHz) |
| Channels | Mono |
| Bit depth | 16-bit |
| Max duration | 15 seconds (auto-stops) |
| Storage location | App-local cache directory (cleared automatically) |
| Compression | None during recording; minimal for playback |

Implementation: Use `expo-av` for both recording and playback.

### 2.5 SHADOW_REPEAT with microphone denied

If the user has denied microphone permission:

- The exercise still appears in the lesson
- State 1 shows the same Arabic + transliteration + translation
- The "Speak" button is replaced with: "Enable microphone to practice speaking"
- Tapping it shows M3 modal (microphone permission ask in-context)
- If user grants permission: exercise proceeds normally
- If user denies again: a "Skip this" option appears, exercise auto-completes without recording
- Skipped exercises still count toward lesson completion but don't increment "phrases you can say" stat

The user is never blocked from progressing through a lesson because of denied microphone.

### 2.6 SHADOW_REPEAT counting

For analytics and the "phrases you can say" stat:

- Each completed SHADOW_REPEAT (with actual recording) counts as one "phrase spoken"
- Skipped SHADOW_REPEAT (microphone denied) does NOT count
- Re-recording the same exercise multiple times counts as 1 (not multiple)
- The "phrases you can say" stat is the total unique SHADOW_REPEAT exercises completed across all lessons

This stat is shown:
- On the Profile screen (Y1) as a speaking stat
- On the lesson Close beat when a SPOKEN_PHRASES lesson completes
- In the share stats card (Y6)

---

## Part 3 — SPOKEN_PHRASES Lessons (Deep Specification)

These are dedicated lessons focused entirely on speaking Fus'ha in real-world Islamic contexts. Per File 05, there are 11 of these in the curriculum.

### 3.1 SPOKEN_PHRASES lesson structure

The 4-beat structure (per File 04):

1. **SP1 — Context:** Set the scene
2. **SP2 — Phrase Practice:** Per-phrase deep practice (loops 10 times)
3. **SP3 — Mini-Dialogue:** Hear the phrases in conversation
4. **SP4 — Close:** Celebrate + update stats

Total duration: 5–7 minutes.

### 3.2 SP1 — Context beat

**Purpose:** Frame why these phrases matter and where they're used.

**UI:**

- Full-screen scene illustration at the top (e.g., halaqa, masjid courtyard, scholar with student)
- Title in Arabic: e.g., `التَّحِيَّات الأَوَّلِيَّة`
- Title in English/Urdu: "Basic Greetings"
- Brief context (2–3 sentences):
  > "When you greet another Muslim, you offer them peace. This is the first thing you say at a halaqa, a masjid, a gathering. Learn these phrases — they are the doorway to every conversation."
- Single button: "Begin →"

**Duration:** 20–40 seconds (user reads context, then advances).

### 3.3 SP2 — Phrase Practice beat (loops 10 times)

For each of the 10 phrases in the lesson, this micro-flow plays:

#### Step 1: Phrase Introduction

- Phrase shown in Arabic (large)
- Transliteration below
- Translation below that
- Audio plays automatically (one time)
- A "Replay audio" button is available
- A "Next →" button appears after audio completes

User taps to advance.

#### Step 2: SHADOW_REPEAT

- The same phrase shown
- A SHADOW_REPEAT exercise plays exactly as specified in Part 2 of this file
- User listens → records → compares → advances

#### Step 3: AUDIO_RECOGNITION Check

After SHADOW_REPEAT, a quick comprehension check fires:

- Title: "What does this mean?"
- Audio plays the phrase one more time
- 4 translation options shown as tappable cards
- User picks the correct meaning
- Correct: subtle green check, advances
- Wrong: gentle correction, shows the right answer, advances anyway

#### Step 4: Phrase Complete

- A small confirmation: "1 of 10 phrases learned"
- Phrase counter increments
- Auto-advance to the next phrase

This loop repeats 10 times — once per phrase.

**Total time per phrase:** ~30–40 seconds
**Total time for SP2:** ~5–7 minutes

### 3.4 SP3 — Mini-Dialogue beat

**Purpose:** Show the phrases in real conversational use.

**UI:**

A scripted dialogue is displayed as a chat-style conversation between two speakers:

- Each speaker is labeled (e.g., "الطالب" / Student, "الأستاذ" / Teacher)
- Each line is shown as a chat bubble:
  - Speaker label
  - Arabic line (large, with harakat)
  - Translation (small, below Arabic)
- An audio play button next to each line
- A "Play full dialogue" button at the top plays all lines in sequence (each speaker's voice if available)

**Dialogue structure:**

A typical mini-dialogue is 4–6 exchanges, using the phrases learned in SP2. Example for "Basic Greetings":

> **Student:** السَّلامُ عَلَيْكُم
> **Teacher:** وَعَلَيْكُمُ السَّلامُ وَرَحْمَةُ الله وَبَرَكَاتُه
> **Student:** كَيْفَ حَالُك يا أُستاذ؟
> **Teacher:** بِخَيْرٍ، الْحَمْدُ لِلَّه. وَأَنْت؟
> **Student:** أَنَا بِخَيْر، شُكْرًا.
> **Teacher:** أَهْلًا وَسَهْلًا. تَفَضَّل.

**User interaction:**

- User taps "Play full dialogue" to hear it once
- User can tap individual lines to replay them
- User can practice each line as SHADOW_REPEAT by tapping a mic icon next to that line (optional, encouraged but not required)
- When user is ready, they tap "Continue →"

**Duration:** 30–60 seconds.

### 3.5 SP4 — Close beat

**Purpose:** Celebrate the speaking milestone.

**UI:**

Same as standard lesson Close (P5), but with speaking-specific Noor message:

> "Barak Allahu feek.
> You can now say 10 new phrases.
> Speak them when you can, in shaa Allah."

Stats updated:
- XP: +15 (SPOKEN_PHRASES lesson XP)
- Daily goal progress
- Streak
- **"Phrases you can say" stat increments by 10**

If this is the user's first SPOKEN_PHRASES lesson, the M1 milestone modal fires: "First spoken phrases lesson completed."

---

## Part 4 — Audio Production for Speaking Content

### 4.1 Audio types needed for speaking content

| Audio category | Source preference | Backup |
|---|---|---|
| **Quranic ayah audio** in Hooks/Reveals | Hafiz Umar's own recital | Licensed reciter (Mishary, Husary) |
| **Vocabulary word audio** | OpenAI TTS (Fus'ha-tuned voice) | Hafiz Umar recording |
| **Spoken phrase audio** | Native Fus'ha speaker recording (preferred) | OpenAI TTS with quality review |
| **Dialogue audio (multi-voice)** | Two native speakers recording | Single voice with pause markers |
| **Noor's encouragement audio (in lessons)** | Single, consistent TTS voice across all lessons | Pre-recorded by team member |

### 4.2 Why human voices matter for SPOKEN_PHRASES

OpenAI TTS handles short vocabulary words acceptably. But for SPOKEN_PHRASES, **human voice is strongly preferred** because:

1. **Conversational rhythm:** TTS struggles with natural emphasis, pauses, and intonation patterns of spoken Arabic
2. **Emotional appropriateness:** A greeting like السلام عليكم has warmth that TTS often misses
3. **Authenticity:** Users learn that this is how a real person speaks — not how a machine reads
4. **Tajweed-adjacent considerations:** Even non-Quranic Fus'ha has rules about elongation, doubling, and articulation that TTS doesn't always honor

**Implementation strategy:**

For v1 launch:
- **Quranic ayah audio:** Hafiz Umar records personally (he's a Hafiz, this is his strength)
- **SPOKEN_PHRASES audio:** Hafiz Umar records phrases himself in Fus'ha, OR sources a Pakistani Arabic teacher / scholar fluent in Fus'ha to record
- **Vocabulary audio:** OpenAI TTS initially, with replacement plans for v1.1

If finding a second voice for dialogues is hard initially, the dialogues can use:
- One voice with a clear pause between speakers
- Two distinct TTS voices (e.g., OpenAI's `alloy` and `onyx`)
- A solo narrated dialogue (one voice indicating roles by phrase)

### 4.3 Audio quality specs

| Parameter | Spec |
|---|---|
| Format | MP3 |
| Bitrate | 128 kbps for human recital, 96 kbps for TTS |
| Sample rate | 44.1 kHz |
| Channels | Mono |
| Loudness | -16 LUFS (consistent across all audio files) |
| File size target | <100 KB per ayah, <30 KB per phrase, <15 KB per word |

### 4.4 Audio file organization (Cloudflare R2)

```
/audio
  /ayat
    /108_1.mp3                  ← Al-Kawthar 1
    /114_1.mp3                  ← An-Nas 1
    ...
  /words
    /hadha.mp3                  ← هَذَا
    /kitab.mp3                  ← كِتَاب
    ...
  /phrases
    /sp1_p1.mp3                 ← SPOKEN_PHRASES lesson 1, phrase 1 (السلام عليكم)
    /sp1_p2.mp3
    ...
  /dialogues
    /sp1_d_line1.mp3            ← SPOKEN_PHRASES lesson 1, dialogue line 1
    /sp1_d_line2.mp3
    ...
  /noor
    /encouragement_correct_1.mp3
    /encouragement_correct_2.mp3
    ...
  /sfx
    /correct.mp3
    /wrong.mp3
    /milestone.mp3
```

### 4.5 Audio caching on device

When a lesson is loaded:
- All audio files referenced in the lesson are prefetched in parallel
- Files are cached locally using Expo's `FileSystem.cacheDirectory`
- Cache expiration: 30 days
- Cache invalidation: when a chapter is updated server-side, audio URLs change (versioning)

Cache size limits:
- iOS: managed by OS (cache directory is auto-cleared when device is low on storage)
- Android: same, managed by OS

If a user has not played a lesson recently and their cache has been cleared:
- Lesson reload triggers re-fetch of audio
- Slight delay on lesson load (P0 loading screen)

---

## Part 5 — Microphone Permission Flow

### 5.1 Initial permission ask — onboarding (B9)

Per File 03, during onboarding step B9, the user is asked for microphone permission:

> **Microphone**
> "Some lessons let you practice speaking. Your recordings stay on your device — we don't store them."
> [Allow microphone] [Not now]

If user taps "Allow microphone":
- iOS/Android native permission prompt appears
- User grants → permission stored as `granted` → onboarding continues
- User denies → permission stored as `denied` → onboarding continues

If user taps "Not now":
- Permission stored as `not_asked`
- Onboarding continues

### 5.2 In-context permission ask (M3 modal)

The first time the user encounters a SHADOW_REPEAT exercise (in any lesson), if their permission is `not_asked` or `denied`:

**M3 modal appears:**

> **🎤**
> **Speaking practice**
>
> To record yourself saying this phrase, Warsh needs access to your microphone.
>
> *Your recording stays on this device. We don't upload, store, or analyze it.*
>
> [Enable microphone] [Skip this exercise]

If user taps "Enable microphone":
- If permission is `not_asked`: Native OS prompt appears
- If permission is `denied` (already): Show secondary message:
  > "Microphone is currently disabled in your settings."
  > [Open Settings] [Skip this exercise]
- "Open Settings" deep-links to the OS settings app

If user taps "Skip this exercise":
- Exercise auto-completes
- Future SHADOW_REPEAT exercises in this lesson also auto-skip with a small note
- User can change permission later in app Settings

### 5.3 Permission status tracking

The app tracks permission status in user profile:

```
microphone_permission: enum {
  not_asked,
  granted,
  denied,
  denied_permanent  // user denied twice — system won't show prompt again
}
```

Updated whenever permission state changes.

### 5.4 Settings screen behavior (Y3)

Per File 02, the Settings screen shows:

> **Microphone:** [Granted / Denied / Not yet asked]
> [Open System Settings →]

Tapping "Open System Settings" deep-links to the app's permissions page in the OS settings, where the user can toggle microphone access.

When the user returns to the app:
- App re-checks microphone permission status
- If status changed, profile is updated

### 5.5 Multiple permission denials

If the user denies microphone permission **twice** (initial + in-context ask):
- iOS/Android won't show the native prompt again
- App marks `microphone_permission = denied_permanent`
- All future SHADOW_REPEAT exercises auto-skip with no permission prompt
- A subtle note appears once: "Speaking practice is currently disabled. Enable microphone in Settings to practice speaking."

We do NOT pester the user. Permission denial is respected.

---

## Part 6 — Speaking Stats System

### 6.1 What we track

The user's speaking progress is tracked through several stats:

| Stat | Definition | Where shown |
|---|---|---|
| **Phrases you can say** | Total unique SHADOW_REPEAT exercises completed with actual recording | Profile (Y1), SPOKEN_PHRASES lesson Close, Share stats (Y6) |
| **Speaking time** | Total seconds of recorded audio across all SHADOW_REPEAT exercises | Profile (Y1), share stats (optional) |
| **SPOKEN_PHRASES lessons completed** | Count of SPOKEN_PHRASES lessons where SP4 was reached | Profile, milestones |
| **Speaking streak** | Consecutive days where user completed at least one SHADOW_REPEAT exercise | Optional v2 feature; not in v1 |

### 6.2 Speaking milestones

The following milestones (per File 04 XP section) celebrate speaking progress:

| Milestone | Trigger | XP bonus |
|---|---|---|
| First SHADOW_REPEAT completed | First time user completes a SHADOW_REPEAT with recording | 10 |
| First SPOKEN_PHRASES lesson completed | First time user reaches SP4 | 25 |
| 10 phrases learned to say | "Phrases you can say" stat hits 10 | 15 |
| 50 phrases learned to say | Stat hits 50 | 25 |
| 100 phrases learned to say | Stat hits 100 | 50 |
| 250 phrases learned to say | Stat hits 250 | 100 |
| 500 phrases learned to say | Stat hits 500 | 200 |
| All SPOKEN_PHRASES lessons completed | User reaches all 11 SPOKEN_PHRASES lessons SP4 | 100 |

Each milestone fires M1 (milestone celebration modal) per the standard milestone system in File 04.

### 6.3 Profile display

On the You tab (Y1), the speaking stats card appears as:

```
┌────────────────────────────────┐
│ 🗣️  Speaking                   │
│                                │
│   142                          │
│   phrases you can say          │
│                                │
│   23 speaking lessons          │
│   completed                    │
└────────────────────────────────┘
```

Tap this card → navigates to a detailed speaking stats screen (planned for v1.1, deferred for v1) OR shows a brief modal with breakdown:

- Phrases learned this week
- Phrases learned in the last month
- Most-practiced phrase

For v1, just the summary card on Y1 is enough.

### 6.4 Share-able speaking stats

When the user generates a share image (Y6), the speaking stats are included:

> **My Warsh journey:**
> 142 phrases learned to say
> 23 chapters completed
> 67-day streak
>
> #Warsh

---

## Part 7 — Audio Comparison Visualization

### 7.1 Waveform visualization

When the user records audio (SHADOW_REPEAT State 4 and 5), a waveform is displayed.

**For the original audio:**
- Pre-computed waveform data is part of the audio asset (small JSON file alongside the MP3)
- Waveform is rendered as bars or peaks in the brand's Ink color
- Playback animates a "cursor" moving across the waveform

**For the user's recording:**
- Waveform is generated in real-time during recording
- Each audio buffer chunk is analyzed for peak amplitude
- Bars are drawn live as the user speaks
- After recording, the full waveform is available for playback

**Visual style:**
- Bars are thin, evenly spaced
- Color: Ink for the original, Sage for the user (subtle differentiation)
- Both waveforms are sized identically so visual comparison is easy

### 7.2 Compare functionality

In the comparison panel (SHADOW_REPEAT State 5), a "Compare" button plays both audio files back-to-back:

1. Original plays first
2. Brief pause (500ms)
3. User's recording plays
4. End

During Compare playback, the waveforms animate to show which audio is currently playing (a cursor sweeps across the active waveform).

The user can also tap each waveform individually to play just that one.

### 7.3 Time scaling

If the user's recording is significantly shorter or longer than the original:
- Both waveforms still display at the same width
- The faster one's playback cursor moves faster across its waveform
- This visually shows the user pacing difference, which is itself useful feedback (without scoring)

---

## Part 8 — Implementation Notes

### 8.1 Library choices

| Functionality | Library |
|---|---|
| Audio recording and playback | `expo-av` |
| Audio file system access | `expo-file-system` |
| Microphone permissions | `expo-av` (requestPermissionsAsync) |
| Waveform rendering | Custom React Native component using SVG (no third-party library needed) |
| TTS for vocabulary audio (production-side) | OpenAI TTS API (backend script generates and uploads to R2) |

### 8.2 Recording lifecycle

```typescript
// Conceptual flow
async function startRecording() {
  const permission = await Audio.requestPermissionsAsync();
  if (permission.status !== 'granted') {
    showPermissionDeniedModal();
    return;
  }
  
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
  
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY);
  await recording.startAsync();
  
  // ... user is recording, max 15 seconds
}

async function stopRecording(recording) {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  // uri is the local file path; use it to load into a Sound for playback
  // Delete file on exercise completion or exit
}
```

### 8.3 Audio cleanup

A cleanup function runs:

- When a SHADOW_REPEAT exercise advances to the next one (current recording deleted)
- When a lesson exits (any remaining recordings deleted)
- When the app launches (any orphaned recording files from previous sessions deleted)

Implementation: a background task at app launch scans the cache directory for `.wav` / `.aac` files matching the recording pattern and deletes them.

### 8.4 Performance considerations

- Audio recording uses minimal device resources at low quality settings (16 kHz mono is light)
- Multiple simultaneous audio playbacks (original + user's recording in Compare mode) can stress lower-end devices — ensure proper Sound unloading
- Waveform rendering on Android is slightly more CPU-intensive than iOS; reduce waveform bar count if performance is poor

### 8.5 Offline behavior

SHADOW_REPEAT exercises work fully offline:
- Original audio is cached when the lesson loads
- Recording happens locally
- Comparison works locally
- No network required for the speaking experience

The only network-dependent piece is the initial lesson load. Once a lesson is loaded, all speaking features work offline.

---

## Part 9 — Edge Cases

### 9.1 User recording in a noisy environment

- Recording captures background noise along with the user's voice
- The app doesn't filter or process the audio in v1
- The user hears the noise in playback — this is acceptable feedback (the user learns to speak clearly)
- In v2, optional noise reduction could be added via `expo-av` configurations

### 9.2 User says nothing during recording

- 15-second max timeout still runs
- After timeout, empty recording is treated normally — comparison panel shows
- User's "recording" plays back as silence (or near-silence — ambient mic noise)
- User can re-record or skip

### 9.3 User taps "Done" before recording

- The "Done" button only enables after a recording exists
- Until then, the comparison panel shows only the original

### 9.4 User force-quits mid-recording

- Recording in progress is lost (cleanup on app reopen)
- User restarts the exercise from State 1

### 9.5 Permission revoked mid-lesson

- If user goes to system settings and revokes microphone permission while the app is backgrounded
- On app foreground, app re-checks permission
- If denied, future SHADOW_REPEAT exercises in the current lesson auto-skip
- Lesson continues without disruption

### 9.6 Bluetooth headphones during recording

- iOS: recording can use Bluetooth headphones if configured; tested on AirPods, Sennheiser
- Android: depends on device — some Android devices struggle with Bluetooth mic during recording; fall back to internal mic if Bluetooth fails
- This is OS-level behavior; Warsh doesn't override defaults

### 9.7 User accidentally records 15 seconds of silence + then speaks

- Recording auto-stops at 15s regardless of content
- User's full attempt is lost
- They can re-record
- A subtle hint could show: "Tap stop when finished — recordings max 15 seconds" — not blocking

---

## Part 10 — Future Considerations (Not v1)

Things explicitly NOT in v1 but worth noting:

- **AI pronunciation scoring** — out per File 01 locked decision. Reconsider in v2 only if beta users explicitly request it.
- **Speaking dialogue with Noor** (full conversational AI) — interesting but complex. v2 consideration.
- **Tajweed-specific feedback** — would require specialized ML or scholar review per recording. Out.
- **Group halaqa simulation** (multiple AI voices in a conversation, user participates) — interesting but complex. v3+.
- **Speaking-only mode** (filter app to only SHADOW_REPEAT exercises) — could violate the "speaking is woven" principle. Out.
- **Pronunciation challenges** (gamified speaking competitions) — feels off-brand. Out for v1.
- **Voice-input lessons** (user speaks the answer instead of tapping) — could be added as additional exercise type in v2 (`VOICE_ANSWER` exercise type)

---

## Part 11 — Test Plan

Before launch, manually verify:

- [ ] Complete a SHADOW_REPEAT exercise from start to finish
- [ ] Replay original audio multiple times before recording
- [ ] Re-record multiple times before tapping "Done"
- [ ] Try to tap "Done" before recording (button should be disabled)
- [ ] Record for the full 15 seconds (auto-stop)
- [ ] Record for 1 second (very short)
- [ ] Record then re-record then re-record again
- [ ] Compare button plays both audios in sequence
- [ ] Tap each waveform to play that one individually
- [ ] Deny microphone permission in onboarding, verify M3 fires on first SHADOW_REPEAT
- [ ] Deny microphone in M3, verify auto-skip
- [ ] Re-grant microphone via Settings, verify next SHADOW_REPEAT works
- [ ] Complete a full SPOKEN_PHRASES lesson (all 10 phrases + dialogue + close)
- [ ] Verify phrase count increments correctly (10 per SPOKEN_PHRASES lesson)
- [ ] Verify "phrases you can say" stat appears on Profile after completion
- [ ] Verify M1 milestone fires for first SPOKEN_PHRASES lesson
- [ ] Test SHADOW_REPEAT in airplane mode (offline) — verify it works
- [ ] Background the app during recording — verify graceful handling
- [ ] Force-quit during recording — verify cleanup on next launch
- [ ] Test on slowest supported device (Android API 26, Pakistani entry-level phone)
- [ ] Test with Bluetooth headphones (AirPods, then a generic BT headset)
- [ ] Verify recording quality is acceptable on internal mic
- [ ] Verify no recordings persist after lesson exits
- [ ] Verify cache cleanup runs on app launch
- [ ] Test dialogue audio in SP3 — verify multi-line playback flows correctly

---

## Part 12 — Changelog

**2026-05-19 — v1.0**
- Complete SHADOW_REPEAT exercise mechanics specified
- SPOKEN_PHRASES lesson structure specified in full detail
- Microphone permission flow defined
- Recording lifecycle and audio storage rules locked
- Speaking stats system defined
- Audio production strategy documented
- Edge cases enumerated
- Implementation notes for `expo-av` provided

---

*End of File 06.*
*Next: File 07 — Vocabulary & Tadabbur.*
