# Warsh · وَرْش — App Specification
## File 01: Identity & Principles

**Status:** Locked — Foundation Document
**Version:** 1.0
**Last updated:** 2026-05-19

> This is the foundation of the Warsh specification. Every other file in this spec references the decisions locked here. If anything in any other file contradicts this document, **this document wins.**

---

## 1. What Warsh is

Warsh is a mobile app that teaches **classical Arabic** — the language of the Quran, Hadith, khutbahs, du'a, scholarship, and Islamic civilization — to Muslims who want to read it, understand it, hear it, and speak it.

The English/Romanized name is **Warsh**. The Arabic name is **وَرْش**. They are always written together when the brand is presented: `Warsh · وَرْش`.

**Warsh (وَرْش)** refers to the Warsh transmission from Nafi' — one of the two most widely used modes of Quranic recitation transmission in the world. The name signals that the app is rooted in the classical Arabic of the Quran, not in modern conversational Arabic or any regional dialect.

---

## 2. What Warsh teaches

Warsh teaches **Fus'ha** — Modern Standard Arabic and Classical Arabic combined. Specifically:

- The **Nahw** (نحو) and **Sarf** (صرف) — grammar and morphology — needed to read the Quran with comprehension
- The **vocabulary** of the Quran, alongside everyday vocabulary that lives in Fus'ha
- The **spoken register** of Fus'ha as it is used in Islamic and scholarly contexts: greetings, polite phrases, halaqa discussion, questions to a teacher, du'a-style speech, conversations at a masjid, classroom interactions
- The **listening comprehension** to follow Fus'ha when spoken — in lectures, khutbahs, recitation, and scholarly conversation

Warsh does **not** teach regional spoken dialects (Khaleeji, Levantine, Egyptian, Maghrebi, etc.). The user should leave the app understanding this difference clearly.

---

## 3. What Warsh is honest about

Fus'ha is the **prestige register** of Arabic across all 22 Arab countries. It is the language of:

- The Quran and its recitation
- Hadith, tafsir, fiqh, all classical Islamic texts
- Khutbahs (Friday and Eid sermons)
- News broadcasts (Al Jazeera, Al Arabiya, etc.)
- Official government speech and writing
- Religious lectures and Islamic education
- Books, newspapers, formal writing
- Conversation with non-Arab Muslims and with religious teachers

Fus'ha is **not** the casual spoken register in any country. A user who completes Warsh will be able to speak with imams, scholars, teachers, and religious students anywhere in the world — but should not expect to chat casually with a Saudi taxi driver in Khaleeji dialect or follow an Egyptian TV show in Egyptian colloquial.

**Warsh teaches the register that matters for worship, scholarship, and religious life.** A user who finishes Warsh has a 10x stronger foundation for picking up any dialect later, if they choose.

The app communicates this honestly to users during onboarding and in marketing, so no user is misled about what they're learning.

---

## 4. Who Warsh is for

### Primary target user

A Muslim — typically Pakistani, South Asian, or from the global Muslim diaspora — who:

- Prays five times daily
- Recites Quran in Salah and reads it regularly
- Has tried to learn Arabic before (often through YouTube videos, books, or short courses) and stopped
- Feels a deep emotional and spiritual gap because they do not understand what they recite
- Wants to fix this — not casually, but seriously
- Is willing to commit 10–20 minutes per day for several months
- Pays attention to whether their religious learning resources are sound, scholar-endorsed, and respectful

### Secondary target user

An English-speaking convert to Islam, or a Muslim in the West (US, UK, Canada, Australia) who wants to build foundational Quranic Arabic without a local madrasa or teacher available to them.

### Who Warsh is NOT for

- People who want to learn Arabic for **business**, **travel**, or **casual conversation** — they should use Pimsleur, Kalam, or Mango
- People who want to learn **Egyptian, Levantine, or Khaleeji dialect** — they should use Kalam or a dialect-specific app
- People who want a **shallow gamified experience** with no spiritual depth — they should use Duolingo
- Children under 13 — Warsh is designed for adult and adolescent learners
- People looking for a **memorization-only Quran app** — they should use Tarteel, Quran.com, or Ayah

---

## 5. Core promise

> "Complete Warsh and you will understand Al-Fatiha, Juz Amma, and the most common structures of the Quran. You will be able to read classical Arabic, hear it spoken at native speed, and speak it yourself with the people who matter — imams, scholars, teachers, students."

This promise is what every feature, every screen, and every piece of content must serve. If a feature does not contribute to delivering on this promise, it does not belong in the app.

---

## 6. The Four Pillars

Every feature decision, every design choice, every piece of copy in Warsh is measured against these four pillars. They are non-negotiable.

### Pillar 1 — Pedagogically sound

Content and sequencing must be endorsed by Islamic scholarship. The curriculum is sourced from the Madinah Arabic Reader (Dr. V. Abdur Rahim) and the lecture series of Dr. Hafiz Muhammad Zubair, both of which are scholar-validated. No content is invented for the app without review.

**The curriculum philosophy is locked: Reader leads, Grammar serves.**

Reading and meaning come first. Grammar is introduced as a tool that explains what the reader has already encountered — never as the entry point. The user discovers patterns through usage, then learns to name them.

### Pillar 2 — Emotionally resonant

The app should feel like sitting with a patient, learned teacher — not like grinding through a language course or being scolded by a cartoon owl. The user should leave each lesson feeling slightly more confident, slightly more connected, never humiliated or rushed.

Praise is human, not performative. Encouragement uses Islamic phrases naturally, not as decoration. Errors are met with patience, never disappointment. Celebrations feel like a teacher's smile, not a stadium cheer.

### Pillar 3 — Spiritually connected

Every word, every grammar concept, every milestone ties back to the Quran. Vocabulary is chosen for its Quranic relevance wherever possible. Example sentences come from real ayat whenever the grammar allows. Reveal beats reveal that the structure the user just learned is *the same structure* used in revelation.

Nothing in Warsh is abstract or detached from why the user is learning.

### Pillar 4 — Delightful to use

Premium UI, careful animation, satisfying feedback. A user should feel good opening this app — not dread it. The visual language is warm, parchment-toned, scholarly. The interactions are smooth, the sound design is gentle, the typography is beautiful.

Delight is not measured in flashing colors or confetti. It is measured in whether the user *wants* to return tomorrow.

---

## 7. The Warmth Principle (locked)

This is a constraint that prevents the most dangerous failure mode of religious learning apps: becoming **too serious to use**.

> *"Ustaad Noor and all microcopy in Warsh is warm scholarly — never weighty, formal, or distant. Praise is human, not effusive. Encouragement uses Islamic phrases naturally, not performatively. Errors are met with patience, never disappointment. Even celebrations should feel like a teacher's smile, not a stadium cheer. The app's tone is the voice of a beloved teacher who is happy to see you — not a religious authority who is grading you."*

This principle is locked. Every piece of copy in the app — every button label, every error message, every milestone celebration, every Noor response — is checked against it.

Examples of what this looks like in practice:

| Wrong tone | Right tone |
|---|---|
| "INCORRECT! Try again." | "Not quite. Let's look again." |
| "Congratulations! You earned 10 XP!!! 🎉🎉🎉" | "Well done. 10 XP added." |
| "You have failed to maintain your streak." | "Even the great scholars had days of rest. Begin again today, in shaa Allah." |
| "Click here to continue your divine journey." | "Continue." |
| "Allah will reward you for completing this lesson." | "Barak Allahu feek." |
| "You are AMAZING at Arabic!" | "Your progress is steady." |

---

## 8. Curriculum source (locked)

The curriculum is built from:

1. **Madinah Arabic Reader, 8-volume set** by Dr. V. Abdur Rahim — the structural spine of the curriculum. Provides chapter sequence and pedagogical progression.

2. **Dr. Hafiz Muhammad Zubair's lecture series** — transcribed teaching of the Madinah Reader books, used as the explanatory voice and content source for each chapter.

3. **The Quran itself** — every grammar concept's "Reveal" beat shows the concept inside a real ayah. Vocabulary is selected, where possible, for its appearance in the Quran.

4. **Curated dictionaries and Quranic corpus** — used for vocabulary bank entries, root analysis, and Quranic example sentences.

Dr. Hafiz Muhammad Zubair has personally granted permission to use his curriculum and lecture material in the Warsh app.

---

## 9. Locked decisions

The following decisions are locked. They do not change without a documented review and an explicit decision to revisit. Anyone working on Warsh treats these as constants.

### Brand and identity

- **App name:** Warsh · وَرْش (always written together when introducing the brand)
- **AI tutor name:** Ustaad Noor (English) · اُستاد نور (Urdu/Arabic)
- **Color palette:** Ink, Gold, Parchment, Sage, Cream (5 brand tokens, defined in design system file)
- **Arabic typography:** Scheherazade New (regular, medium, semibold, bold)
- **Latin typography:** Lora (English body text and headings)
- **Visual language:** Parchment-toned, classical, scholarly, warm. No neon, no harsh contrast, no cartoon characters.

### Curriculum

- **Curriculum philosophy:** Reader leads, Grammar serves
- **Source:** Madinah Reader + Dr. Zubair's lectures + Quran
- **Lesson anatomy:** 5-beat (Hook → Discover → Practice → Reveal → Close) for standard lessons; alternate templates defined for spoken-phrase and verb lessons
- **Tadabbur progression:** Al-Fatiha first (already there), then last 10 Surahs of the Quran in Mushaf order starting from An-Nas (An-Nas → Al-Falaq → Al-Ikhlas → Al-Masad → An-Nasr → Al-Kafirun → Al-Kawthar → Al-Ma'un → Quraysh → Al-Fil), then continuing backwards through Juz Amma post-launch
- **Tadabbur model:** Hybrid — grammar progression follows Madinah Reader; vocabulary within chapters preferentially uses words from the next Surah in the Tadabbur progression
- **Comprehension definition:** A user "understands" a Surah when they have learned the meaning of every word in that Surah through lessons and can read it with comprehension
- **Quran transliteration:** Quranic ayat are never shown in transliterated form. Arabic script only.

### Speaking and audio

- **Speaking dimension is Fus'ha only — never dialect**
- **Speaking lives inside the lesson flow** — there is no separate "Speak Mode" tab
- **No automated pronunciation scoring** — SHADOW_REPEAT exercises are listen-and-compare only
- **Audio is core**, not optional — every word, phrase, and ayah has audio
- **Quranic ayah audio is human-recited** — never TTS, even if recording costs more or takes longer

### App structure

- **No more than 4 bottom tabs** — final structure is `Learn | Vocabulary | Noor | You`
- **No hearts or lives system** — users are never penalized for wrong answers with punitive lockouts
- **No leaderboards** — Warsh is a personal journey, not a competition with strangers
- **No public profiles** — users do not see each other's progress
- **Two UI language modes:** English and Urdu (Arabic content identical in both)
- **Islamic phrases** (بارك الله فيك, ما شاء الله, جزاك الله خيراً, السلام عليكم, etc.) always remain in Arabic script in both UI modes

### AI

- **Ustaad Noor model:** OpenAI GPT-4o-mini (upgradeable later)
- **Noor scope:** Constrained to Arabic learning topics only. Off-topic questions are redirected gently.
- **Noor memory:** No persistent cross-session memory in v1. Each conversation injects user profile context (level, recent lessons) but does not remember previous chats.
- **Noor message limits:** 5 messages per day for trial users and paid users. Overage pack: $0.99 for 20 additional messages (consumable IAP).

### Monetization

- **Pricing:** $1/month or $10/year via Apple In-App Purchase and Google Play Billing
- **Trial:** 7 days free from account creation
- **After trial:** Soft paywall. Lessons, Noor, Tadabbur lock. Vocabulary Bank remains free forever (including audio, search, Word of the Day).
- **Preview experience:** Before signup, all first-time visitors see a 3-minute guided preview that demonstrates the app's value. After preview, signup is required.
- **First chapter free during trial:** During the 7-day trial, the user gets the first chapter free. Trial ends after 7 days OR completion of chapter 1, whichever comes first.
- **Free lesson preview without account:** None. Preview experience replaces this.

### Technical

- **Mobile stack:** Expo SDK 51, React Native, TypeScript
- **Backend stack:** Next.js 14, Prisma 7, PostgreSQL (Neon)
- **Storage:** Cloudflare R2 for audio, images, illustrations
- **Auth:** JWT-based session
- **Push notifications:** Expo Notifications
- **Error tracking:** Sentry (free tier)
- **Analytics:** Mixpanel (free tier)
- **iOS minimum:** 14+
- **Android minimum:** API level 26 (Android 8 / Oreo)

### Geographic and launch

- **Initial launch market:** Pakistan
- **Initial language support:** English and Urdu UI
- **Initial platform:** Google Play Store (Android) if Play Developer account is available, otherwise direct APK distribution
- **iOS launch:** Phase 2 — after Android stabilization
- **DEV_UNLOCK_ALL = false** — chapter locking and trial enforcement is on for every real user. The dev-mode unlock flag is for development builds only and must never ship.

---

## 10. What Warsh is NOT (anti-positioning)

To prevent scope drift, here is what Warsh is explicitly not. These boundaries are locked.

| Warsh is NOT | Because |
|---|---|
| A casual conversational Arabic app | That market belongs to Kalam and similar — dialect-focused apps |
| A phonics or alphabet app | Madinah Reader assumes letter recognition; users below that level can be redirected to Alifbee or similar |
| A shallow gamified app with hearts and lives | This breaks the Warmth Principle |
| A Quran memorization app | Tarteel and Quran.com serve that need |
| A Quran translation app | The user can look up translations elsewhere; Warsh teaches the *language* so translation becomes unnecessary |
| A madrasah or formal Islamic course | No certifications, no exams, no shame |
| A video lecture library | Active practice replaces passive watching |
| A children's app | Designed for adult learners; adolescents 13+ may use it but it is not designed around them |
| A social or community app | No public profiles, no leaderboards, no chat with other users |
| A dialect translation app | Fus'ha only, in scope and out |

---

## 11. Voice and tone (Ustaad Noor's character)

Ustaad Noor is the AI tutor and the voice of every piece of microcopy in the app. Noor is not just a chatbot — Noor is a *character*, and that character has a specific personality.

### Noor's personality (locked)

**Noor is:**

- A teacher who loves teaching, not a system delivering content
- Warm and patient — never rushed, never impatient
- Scholarly but not academic — knows the material deeply but doesn't show off
- Encouraging without being effusive — "well done" not "AMAZING JOB!!!"
- Quietly funny, in a teacherly way — light wit, never sarcasm
- Spiritually grounded — uses Islamic phrases naturally because they are part of how Noor speaks, not because the app forces them
- Honest — if the user is wrong, Noor says so kindly; Noor doesn't pretend they are right
- Present — speaks to the user, not at the user

**Noor is NOT:**

- A cheerleader
- A drill sergeant
- A motivational poster
- A friend (Noor has a respectful teacher-student distance)
- A scholar speaking down to a layperson
- A robot reading scripts

### Noor's language patterns

- Always greets the user with `As-salamu alaykum` (English UI) or `السلام علیکم` (Urdu UI)
- Uses Arabic Islamic phrases naturally:
  - `بارك الله فيك` — when the user does well
  - `ما شاء الله` — at moments of genuine progress
  - `جزاك الله خيراً` — when the user thanks Noor
  - `إن شاء الله` — when speaking of future actions
  - `لا تيأس` — gently, when the user is struggling
- Never uses excessive punctuation. Periods. Occasional commas. No exclamation points except at moments of real celebration (chapter completion, Surah understood).
- Never uses emojis. The brand is parchment-toned, not emoji-rich.
- Uses the user's name occasionally — never every message, never never. Maybe once every 5–10 interactions.

### Example Noor messages

**On lesson start:**
> "As-salamu alaykum. Let's begin today's lesson."

**On a correct answer:**
> "Yes."
> *(Sometimes just one word. Confidence does not need decoration.)*

**On a wrong answer:**
> "Not quite. The word means 'this' — like pointing at something near you. Let's see it again."

**On a chapter completion:**
> "Subhan Allah. You have completed the first chapter. The doors begin to open. Barak Allahu feek."

**On a missed streak:**
> "As-salamu alaykum. Even the great scholars had days of rest. Today is a good day to begin again, in shaa Allah."

**On a question Noor cannot answer (off-topic):**
> "That's outside what I can help with — I'm here to teach you Arabic. But it's a good question. Ask a scholar you trust."

**On a difficult concept:**
> "Take your time. This concept is one of the foundations — the rest of the language rests on it. We will come back to it whenever you need."

---

## 12. The user's emotional journey

This is what we want every user to feel, in order, as they progress through Warsh:

### Day 1 (Preview + first lesson)
- **Curiosity.** "This doesn't look like other Arabic apps."
- **Recognition.** "Wait — I know this ayah. I've been saying it for years."
- **Hope.** "Maybe I can actually do this."

### Week 1
- **Momentum.** "I came back. The streak feels good."
- **Surprise.** "I understood that word in Salah today."
- **Trust.** "This app respects me."

### Month 1 (~5–10 chapters in)
- **Confidence.** "I can read this sentence."
- **Spiritual emotion.** First time the user fully understands an ayah they recite daily. This is the moment Warsh is built for.
- **Identity shift.** "I am someone who is learning Arabic. Properly."

### Month 3 (Tadabbur — Al-Fatiha completed)
- **Pride.** Without arrogance. The pride of having earned something real.
- **Hunger.** "What's next?"

### Month 6+
- **Transformation.** The user reads Quran differently. Salah is different. Du'a is different. They have begun to recover what the agent's critique called *Islamic linguistic identity*.

If a user makes it to month 6, Warsh has fulfilled its purpose. Everything in the app is in service of getting users to that point.

---

## 13. The "Living Quran" emotional anchor

One thing the user must always feel: **the Quran is alive and reaching toward them.**

This is not a feature. It's a design principle. Every screen, every interaction, every animation should reinforce that the language the user is learning is not academic — it is the language of revelation, and that language is *waiting* for the user to be able to receive it.

How this shows up in the app:

- The Tadabbur card on the Learn tab shows the Quran's words being slowly illuminated as the user understands them. Not a progress bar — a gradual lighting.
- Lesson Hooks open with an ayah, audio playing, before any teaching begins. The user hears revelation first, then learns.
- Reveal beats end the lesson by showing the grammar concept *inside* a real ayah, with the relevant word highlighted in gold. The user sees: *this is where it lives*.
- Milestone celebrations reference relevant ayat or hadith — not generic congratulations.
- The Vocabulary Bank shows, for every word, the ayah in which it appears.

This emotional anchor is what makes Warsh feel different from any general Arabic learning app. It is locked into the product DNA.

---

## 14. Success criteria

Warsh is successful when:

### Per user
- A new user completes the preview and signs up at a rate of **40%+**
- A signed-up user completes at least one lesson in their first week at a rate of **70%+**
- A user who completes the first chapter converts to paid at a rate of **25%+**
- A paid user is still active after 30 days at a rate of **50%+**
- A user completes the Al-Fatiha Tadabbur milestone within their first 60 days at a rate of **30%+**

### Qualitative
- Users report — in app reviews, in WhatsApp shares, in word of mouth — that Warsh feels *different* from other Arabic apps
- At least one user, somewhere, says: *"For the first time, I understood what I was saying in Salah."* This is the qualitative success criterion that matters most.

These numbers are targets, not guarantees. They calibrate what "working" looks like for the team. Underperforming any of them is a signal to improve, not panic.

---

## 15. Out of scope for v1 (parked)

The following features are good ideas that are explicitly **not in v1**. They are parked here so future planners know they were considered.

- **Automated pronunciation scoring** — requires Arabic-specific ASR and tajweed validation. Park until v2 or v3, only if beta users explicitly request it.
- **Recurring world environments** (masjid courtyard, library, marketplace, etc. as visual progression) — interesting but gold-plating. Park.
- **Multiple AI tutor personalities** — Noor is enough. Park.
- **Social features** (friends, sharing progress with specific people) — breaks the "personal journey" principle. Park indefinitely.
- **In-app community / forum** — out of scope. Direct users to existing Islamic learning communities.
- **Multi-dialect support** — Warsh is Fus'ha only. Park indefinitely.
- **Live tutor sessions** (video chat with a real teacher) — interesting business model expansion. Park.
- **Certificates / completion credentials** — breaks the "no exams, no shame" principle. Park indefinitely.
- **Offline-only mode for entire course** — phased offline support is in v1. Full offline mode is post-launch.
- **iPad optimized layouts** — v1 ships phone-first. Tablet is post-launch.
- **Web app** — v1 is mobile only. Web is post-launch consideration.
- **Family / group accounts** — interesting but adds complexity. Park.
- **Children's mode** — Warsh is adult-focused. A children's app is a separate product.

---

## 16. How to use this document

This document is the source of truth for **what Warsh is**. Other files in this specification define **how each piece works**:

| File | Defines |
|---|---|
| `warsh-spec-02-information-architecture.md` | Every screen, every tab, navigation structure |
| `warsh-spec-03-onboarding-and-auth.md` | Onboarding flow, placement quiz, account creation |
| `warsh-spec-04-lesson-system.md` | Lesson templates, exercise types, lesson player |
| `warsh-spec-05-curriculum-and-content.md` | Chapter list, content production standards, Tadabbur mapping |
| `warsh-spec-06-spoken-fusha.md` | SHADOW_REPEAT, SPOKEN_PHRASES, audio capture |
| `warsh-spec-07-vocabulary-and-tadabbur.md` | Vocabulary Bank, Tadabbur progression UI, SRS |
| `warsh-spec-08-engagement-features.md` | XP, streak, daily goal, milestones, notifications |
| `warsh-spec-09-ustaad-noor.md` | Noor chat, system prompt, message limits, overage |
| `warsh-spec-10-monetization-and-launch.md` | Trial, paywall, IAP, beta launch criteria |
| `warsh-spec-11-design-system-and-copy.md` | Colors, typography, components, animation, all UI strings |
| `warsh-spec-12-data-model-and-api.md` | Database schema, endpoints, request/response shapes |
| `warsh-spec-13-technical-and-infrastructure.md` | Stack, hosting, environment, pre-launch checklist |

If something in any of those files contradicts this one, this file wins. Update the conflicting file to align — don't update this one.

---

## 17. Changelog

**2026-05-19 — v1.0**
- Foundation document created
- All identity, principles, and locked decisions captured
- Source of truth for all other specification files

---

*End of File 01.*
*Next: File 02 — Information Architecture.*
