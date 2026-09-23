# Spoken Answer Checking ("Answer it") — Proposal

Status: **idea, not approved.** Written 2026-09-23. It follows the Pen-first gate: no
code until a Pen design is approved. It extends step 7 ("Say it") of the Conversation
Labs proposal (`conversation-labs-curriculum-proposal.md`).

## Problem

The current speaking screen (`warsh-app/components/ShadowRepeatExercise.tsx`, used
by `SHADOW_REPEAT` and the spoken-phrases beat in `play.tsx`) records the learner on
the device with `expo-av` and lets them play their recording beside the model audio.
The recording never leaves the phone, so nothing can tell whether the learner said
the right thing. The learner practises speaking but gets no feedback.

## Idea

Add a conversational speaking exercise where the learner **answers a question**
instead of repeating a phrase:

| App asks | Learner answers | Checked |
|---|---|---|
| مَا اسْمُكَ؟ | اسْمِي + any name | اسْمِي must be present; the name is open |
| مَنْ هٰذَا؟ (picture) | هٰذَا + the right word | هٰذَا and the pictured word |

The check works at the **word level only**. It never analyses harakat, letters, or
pronunciation.

## Proposed behaviour

1. Show and play the question.
2. The learner taps the mic and speaks.
3. Speech is turned into Arabic text (see "Speech recognition options").
4. The text is normalised (harakat, tatweel, and hamza/alif variants stripped) and
   compared with the expected answer pattern:
   - **required words** must appear (e.g. اسْمِي)
   - **open slots** accept anything (a name)
   - **choice slots** accept one of a listed set (the pictured word)
5. Feedback:
   - "✓ Great!"
   - "We heard: … — you missed اسْمِي" plus **Try again**
6. Always show **"We heard: …"** so a result is never a mystery.
7. **Skip is always available.** Checking never blocks progress, because
   recognition of short beginner utterances will sometimes be wrong.
8. With no connection or no recogniser, fall back to today's record-and-compare
   screen.

Keep "Say it" (repeat) as it is and add "Answer it" as a new exercise type.

## Content impact

Each "Answer it" item needs an answer pattern in the lesson content (required
words, open slots, choice lists). That means an addition to `@warsh/lesson-schema`
and to the fixtures. The Conversation Labs proposal says speaking "must not claim
that pronunciation was automatically graded". The copy has to keep that promise:
we check **words**, never pronunciation.

## Speech recognition options

| Option | Cost | Notes |
|---|---|---|
| **Device's built-in recogniser** (Android Google speech service; Web Speech API in Chrome/Edge) via a native module such as `expo-speech-recognition` | Free | Supports Arabic locales (e.g. `ar-SA`). Newer Android versions can run it offline if the Arabic pack is installed. Needs a new native build. Missing on phones without Google services, and on Safari/Firefox web. Returns several alternatives, which helps matching. |
| OpenAI speech-to-text (Whisper / gpt-4o-transcribe) through our backend | Paid, very cheap per short clip | We already have the OpenAI account used by Noor. Strong Arabic. Needs a daily cap like Noor and internet. |
| Free API tiers (Groq Whisper, Google Cloud STT monthly free minutes, Azure free hours) | Free up to a limit | Rate limits or monthly caps, so not a free base for everyone. |
| On-device Whisper (`whisper.rn`) or Vosk | Free, offline | Adds tens of MB to the app. Small models are weak on Arabic. |

**Recommendation:** use the device's built-in recogniser as the free default.
Keep OpenAI as an optional fallback for devices without one. Decide after the
accuracy test.

## Next steps

1. **Accuracy test:** run the built-in recogniser and OpenAI over existing lesson
   audio and a few short spoken answers (اسْمِي عُمَر, هٰذَا كِتَابٌ). Measure how
   often the key words come back correctly.
2. **Pen design** of the "Answer it" screen (question, mic, "We heard", result,
   retry, skip) for owner approval.
3. After approval: schema addition, component, backend route (only if OpenAI is
   used), i18n (en + ur), and content for the first Conversation Lab.
