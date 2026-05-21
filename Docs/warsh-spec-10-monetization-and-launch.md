# Warsh · وَرْش — App Specification
## File 10: Monetization & Launch

**Status:** Locked
**Version:** 1.0
**Last updated:** 2026-05-19
**Depends on:** File 01 (Identity & Principles), File 02 (Information Architecture), File 03 (Onboarding & Auth), File 09 (Ustaad Noor)

> This file specifies how Warsh makes money and how it goes to market. Trial mechanics, paywall behavior, subscription management, in-app purchases, restore flows, refund policy, and the criteria that define "ready for launch."

---

## Part 1 — Monetization Philosophy

### 1.1 What Warsh charges for

Warsh is a paid app. Per File 01 locked decisions:

- **$1 per month** or **$10 per year** ($0.83 effective per month, ~17% discount for annual)
- Free 7-day trial from account creation
- Vocabulary Bank remains free forever, even post-trial
- 3-minute Preview Experience available before any signup, per File 03

### 1.2 What Warsh does NOT do

To prevent predatory patterns common in subscription apps:

- No "Limited time discount! 50% off your first year!" popups
- No fake urgency
- No "rate this app or pay" dark patterns
- No data harvesting via fake discounts
- No personalized price discrimination (everyone pays the same)
- No retention dark patterns when canceling
- No surprise charges
- No ads of any kind
- No upselling during lessons
- No selling user data

### 1.3 Honest pricing positioning

> "Seven days free. Then $1/month, or $10/year. Less than a cup of chai."

This framing acknowledges Pakistani context, anchors against something cheap and pleasurable, avoids the "premium" trap, and says what it costs with no hidden tiers.

### 1.4 Pricing rationale

- Low enough for price-sensitive markets (Pakistan, Bangladesh, Indonesia)
- High enough to support the business at moderate scale
- Annual gives 17% discount (generous but not insulting)
- 7-day trial enough to feel the product

If unit economics show this is unsustainable, prices can change for new users; existing subscribers grandfathered. Launch price is locked.

---

## Part 2 — The Subscription Tier

### 2.1 Single tier (locked)

Warsh has one subscription tier. No "Basic / Pro / Elite."

### 2.2 What's included

| Feature | Status |
|---|---|
| All 72 chapters and ~380 lessons | Paid |
| Ustaad Noor chat (5 messages/day) | Paid |
| Tadabbur progression (all 11 Surahs) | Paid |
| Streak system + freezes | Paid |
| SHADOW_REPEAT and SPOKEN_PHRASES lessons | Paid |
| Push notifications | Paid |
| Audio for all content | Paid |
| All milestones and badges | Paid |
| Profile stats and heatmap | Paid |
| Settings | Paid |
| Share mechanics | Paid |
| **Vocabulary Bank (all 600+ words)** | **Free forever** |
| **Word of the Day** | **Free forever** |
| **Vocabulary search and browse by topic** | **Free forever** |
| **SRS review on Vocabulary Bank** | **Free forever** |
| Audio playback in Vocabulary Bank | Free forever |

### 2.3 Why Vocabulary Bank is free forever

- Users who paid earlier shouldn't lose access to words they've encountered — that feels like punishment
- Free Vocabulary Bank creates a habit-forming touchpoint that brings non-paying users back to the app, increasing reconversion likelihood
- Honest gift, not a stripped-down tease — full 600+ words, all categories, audio playback, SRS

---

## Part 3 — The 7-Day Free Trial

### 3.1 Trial start

Trial timer starts at account creation (B8 complete in File 03):

- Server records `trial_start_at = now()` at account creation
- Trial ends at `trial_start_at + 7 days`
- All timezones use UTC for trial calculations (no exploitation via timezone changes)

### 3.2 What user can do during trial

Full access to the app — same as paid users:
- All lessons playable
- Noor chat (5 messages/day, same as paid)
- Tadabbur progression
- All audio, all SHADOW_REPEAT, all SPOKEN_PHRASES
- All milestones earnable

The trial is genuinely the full product, not a stripped version.

### 3.3 Trial-end behavior

When trial ends (`trial_start_at + 7 days`):

- Account state → `trial_expired`
- On next app open, user is routed to paywall when trying to access paid features
- Mid-lesson: current lesson completes; next paid-feature navigation hits paywall

Pre-end softening:
- **Day 5:** Subtle banner on Learn home — "Your trial ends in 2 days. Want to continue?"
- **Day 6:** "Your trial ends tomorrow."
- **Day 7:** "Your trial ends today. Don't lose your streak."

These banners are informative, dismissible per day, not panicky.

### 3.4 First-chapter rule

Per File 01:

> "During the 7-day trial, the user gets the first chapter free. Trial ends after 7 days OR completion of Chapter 1, whichever comes first."

Interpretation:
- Trial is **time-based primarily** (7 days)
- BUT if user completes Chapter 1's 5 lessons before 7 days, paywall hits at Chapter 1 completion
- Prevents power users from getting deep into curriculum free

Examples:
- User signs up, takes their time, completes Chapter 1 in 6 days, explores Vocabulary Bank 1 more day. Trial ends at Day 7.
- User signs up, completes all 5 lessons Day 1. Paywall hits after Lesson 5. Trial = 1 day.
- User signs up, doesn't open for 8 days. Trial ends Day 7. Paywall on first lesson attempt.

Why "or chapter 1 completion":
- Power users have experienced core value (5 lessons, Noor, Tadabbur preview, audio, SHADOW_REPEAT)
- They've shown they want more — that's the moment to convert
- Better conversion point than "7 days regardless of usage"

### 3.5 Chapter 1 completion notification (during trial)

When user completes Chapter 1 during trial:

- Standard chapter completion celebration plays (File 04)
- After dismissal:

> **You've finished Chapter 1.**
>
> Mashallah, [Name]. Foundation built.
>
> Your trial ends [today / tomorrow / in X days]. To keep going through Chapter 2 and beyond, choose a plan.
>
> [See plans →] [Maybe later]

"See plans" → Y4 paywall. "Maybe later" → back to L1.

### 3.6 Subscribing during trial

The 7-day trial is not technically cancellable (nothing being charged). User can:
- **Not subscribe** when trial ends → no charge, free-tier (vocabulary only)
- **Subscribe immediately** → no charge until trial period ends, then auto-billed

Standard Apple/Google flow — trial timer continues; first billing cycle begins Day 7.

### 3.7 Reinstall / multi-account during trial

- Trial tied to **account** (server-side), not device
- Reinstall retains trial status
- Multiple accounts = technically multiple trials (hard to prevent for free signups)
- For v1, accept this minor abuse vector. v2 mitigation: email verification before trial begins.

---

## Part 4 — The Paywall (Y4)

Per File 02, paywall lives at Y4. Triggers:

1. Automatically when user tries to access paid content post-trial
2. User taps "Manage subscription" in Settings (Y3)
3. User taps "Subscribe →" from any trial banner

### 4.1 Y4 layout

Top to bottom:

1. **Header:** Back button — only when accessed from Settings; absent when paywall is forced
2. **Hero illustration:** Parchment-toned, lit lamp on open book
3. **Title:** "Continue your journey."
4. **Subtitle:** "[Name], you've taken the first steps. Now let's go further."
5. **Pricing tiles:**

```
┌──────────────────────────┐
│ $10 / year               │
│ Save 17% — most popular  │
│ [Selected by default]    │
└──────────────────────────┘

┌──────────────────────────┐
│ $1 / month               │
└──────────────────────────┘
```

Annual is pre-selected (better value).

6. **Feature list:**
   - ✓ All 72 chapters and ~380 lessons
   - ✓ Ustaad Noor — your AI tutor
   - ✓ Tadabbur — understand the Quran word by word
   - ✓ Streak protection + freezes
   - ✓ Audio for every word and ayah
   - ✓ Speaking practice — SHADOW_REPEAT and spoken phrases
   - ✓ All future content and updates

7. **CTA button:** "Start subscription →" (Gold, primary)

8. **Below button:**
   - "Cancel anytime in your device settings."
   - "Restore purchases" link

9. **Footer:**
   - "Vocabulary Bank remains free, whether you subscribe or not."

10. **Legal links:**
    - Privacy Policy
    - Terms of Service
    - Subscription terms (Apple/Google required)

### 4.2 Apple/Google required text

> Subscription auto-renews unless canceled at least 24 hours before the end of the current period. Payment will be charged to your [Apple ID / Google Play account]. Manage or cancel in Settings.
>
> See our [Terms](link) and [Privacy Policy](link).

### 4.3 Behavior on "Start subscription"

1. Verify user logged in
2. Trigger native IAP flow via `react-native-iap`
3. Native confirmation UI (Apple ID password / Google biometric)
4. On success:
   - Backend webhook receives notification
   - Account upgraded to `subscribed`
   - `subscription_active_until` set
   - In-app confirmation: "Welcome to Warsh"
   - User accesses all features
5. On failure/cancellation:
   - User stays on paywall
   - No charge

### 4.4 Behavior on "Restore purchases"

1. Trigger `getAvailablePurchases()`
2. If active subscription found:
   - Backend updates status
   - User returns to L1 with paid access
3. If none:
   - Toast: "No active subscription found."
   - Stay on paywall

### 4.5 Trial-expired user opens app

1. Splash → auth → routes to L1
2. L1 shows persistent banner: "Your trial has ended. Subscribe to continue — [See plans →]"
3. User can browse Vocabulary freely
4. Taps any chapter/lesson/Noor/Tadabbur → Y4 paywall
5. Settings still accessible

### 4.6 Subscription expired user

Same flow as trial-expired:
- Vocabulary access retained
- Streak/progress preserved
- Re-subscribing restores full access

---

## Part 5 — In-App Purchase Integration

### 5.1 Product IDs

Three IAP products in App Store Connect and Google Play Console:

| Product ID | Type | Price |
|---|---|---|
| `warsh_monthly` | Auto-renewable subscription | $1/month |
| `warsh_annual` | Auto-renewable subscription | $10/year |
| `warsh_noor_overage_pack` | Consumable | $0.99 for 20 messages |

### 5.2 Subscription group

iOS: `warsh_monthly` and `warsh_annual` in same Subscription Group, allowing switching.
Android: Configured via base plans for plan switching.

### 5.3 IAP library

- **Library:** `react-native-iap`
- Backend verification:
  - iOS: Apple's `verifyReceipt` endpoint
  - Android: Google Play Developer API
- Receipts stored server-side for audit
- Subscription state is server-truth

### 5.4 Server-side subscription state

```
{
  subscription_status: enum {
    none,
    trial,
    active,
    expired,
    canceled
  },
  trial_start_at: timestamp,
  trial_expires_at: timestamp,
  subscription_product_id: string,
  subscription_active_until: timestamp,
  subscription_auto_renew: boolean,
  noor_overage_balance: int,
  last_receipt_verified_at: timestamp
}
```

### 5.5 Receipt verification

Every IAP purchase:
1. Client sends receipt to backend
2. Backend verifies with Apple/Google
3. Backend updates state
4. Backend returns confirmation

### 5.6 Webhook listeners

Apple and Google send server-to-server notifications:

- Renewal succeeded → extend `subscription_active_until`
- Renewal failed → mark `subscription_status = expired` if retries exhausted
- User canceled → mark `subscription_auto_renew = false`
- Refund issued → mark `subscription_status = canceled`, revoke immediately

Endpoints:
- `/api/iap/apple-notification`
- `/api/iap/google-notification`

### 5.7 Noor overage pack purchase

When user taps "Get more messages" in N2:

1. `react-native-iap` triggers consumable IAP for `warsh_noor_overage_pack`
2. On success:
   - Client sends receipt
   - Backend verifies
   - Backend increments `noor_overage_balance` by 20
   - Toast: "20 messages added. Continue with Noor."

Consumable — buyable multiple times.

### 5.8 Edge cases

- **Payment but verification fails:** Account not upgraded; "Restore purchases" button + support recovery
- **Pays then deletes app:** Receipt valid; restore on reinstall
- **Apple sub on Android device:** IAP doesn't cross-platform. Mitigation: document; encourage web sub in v2.

---

## Part 6 — Cancellation, Refunds, Account Deletion

### 6.1 Cancellation

Per Apple/Google requirements, cancellation is via OS settings:

- iOS: Settings → Apple ID → Subscriptions → Warsh → Cancel
- Android: Google Play Store → Subscriptions → Warsh → Cancel

Settings (Y3) provides deep-link to OS subscription management.

**No retention dark patterns.** No "Are you sure?", no discount offers.

### 6.2 Post-cancellation

- User retains access until current paid period ends
- After period ends, state → `expired`
- Treated like trial-expired user
- Vocabulary Bank still accessible

### 6.3 Refund policy

Apple/Google handle refunds; Warsh has no control over the decision.

When refund issued:
- Webhook fires
- Subscription revoked immediately
- Notification: "Your refund was processed. Subscription has ended."
- Vocabulary access retained

No penalty — no banning, no flagging.

### 6.4 Account deletion

User: Settings → Account → Delete account.

Confirmation modal:

> **Delete your account?**
>
> This is permanent. We will delete your name, email, lesson progress, vocabulary, streak history, chat history, and all stats.
>
> Your subscription will continue on your device's app store until you cancel it there separately.
>
> [Delete account] [Cancel]

After confirmation:
1. User confirms with password
2. Backend marks `deletion_requested_at = now()`
3. User logged out immediately
4. App returns to A1 (preview) — fresh state
5. Backend performs actual deletion within 30 days

What's NOT deleted automatically:
- Apple/Google subscription (user must cancel separately) — communicated clearly

GDPR-style data erasure by default (future-proofs international expansion).

---

## Part 7 — Trial Banners and Subscribe Prompts

### 7.1 Trial countdown banner on L1

Per day messaging:

- **Day 1–4:** Subtle — "Your free trial · 7 days · Subscribe →" (dismissible)
- **Day 5:** "Your trial ends in 2 days. Continue learning?" (slightly more prominent)
- **Day 6:** "Your trial ends tomorrow."
- **Day 7:** "Your trial ends today. Don't lose your streak."

Dismissible per day — closing makes it not reappear until next day.

### 7.2 Trial countdown copy — voice rules

Warmth Principle applied:

| Day | BAD | GOOD |
|---|---|---|
| 5 | "URGENT: 2 DAYS LEFT!" | "Your trial ends in 2 days. Continue learning?" |
| 7 | "FINAL HOURS before losing everything!!" | "Your trial ends today. Don't lose your streak." |

### 7.3 Post-trial expired banner

After trial ends, persistent banner on L1:

> "Your trial has ended. Continue your journey from $1/month — [See plans →]"

Not dismissible — soft persistent reminder. But doesn't block what user can still do (vocabulary).

### 7.4 Paywall triggers

| Trigger | Behavior |
|---|---|
| Tap chapter post-trial | Y4 as modal |
| Tap Noor tab post-trial | Y4 as modal |
| Tap Tadabbur post-trial | Y4 as modal |
| Tap "Subscribe" banner | Y4 as full screen |
| Tap "Manage subscription" in Settings | Y4 with back button |

---

## Part 8 — Pricing for Pakistan Specifically

### 8.1 Apple App Store pricing

- $1.00/month → Tier 1
- $10.00/year → Tier 11

For Pakistan, Apple displays PKR using their conversion.
- $1 ≈ Rs. 280 (approximate, 2026)
- User sees "Rs. 280/month" or similar

Acceptable. No regional adjustment in v1.

### 8.2 Google Play pricing

- Set base price USD ($1.00, $10.00)
- Use auto-conversion
- v2 optimization: manually set Rs. 280/month, Rs. 2,800/year

**Locked for v1:** Auto-conversion.

### 8.3 Tax handling

Apple/Google handle tax automatically:
- Pakistan: 17% Federal Sales Tax on digital services
- Tax-inclusive total shown to user
- Warsh receives net (post-tax, post-commission)

After 30% Apple/Google commission + Pakistan tax:
- Per $1 sub: ~$0.58 to Warsh
- Per $10 annual: ~$5.83 to Warsh

Apple Small Business Program (<$1M/year) drops commission to 15% — significantly better.

---

## Part 9 — Analytics for Monetization

### 9.1 Critical events

| Event | Properties |
|---|---|
| `trial_started` | trial_starts_at, signup_route |
| `trial_banner_shown` | day_of_trial, dismissed_count |
| `trial_banner_dismissed` | day_of_trial |
| `paywall_shown` | trigger |
| `paywall_dismissed` | trigger |
| `subscription_started` | product_id, was_trialing |
| `subscription_renewed` | product_id, renewal_count |
| `subscription_canceled` | product_id, days_active, was_trial |
| `subscription_refunded` | product_id, days_used |
| `overage_pack_purchased` | total_overage_packs_for_user |
| `restore_purchases_attempted` | result |
| `account_deleted` | days_as_user, was_subscriber |

### 9.2 Key weekly metrics

| Metric | Target |
|---|---|
| Trial start → 7-day completion rate | 70%+ |
| Trial → paid conversion rate | 25%+ |
| Annual vs monthly split | 40% annual |
| Month 1 → Month 2 retention (paid) | 75%+ |
| Month 1 → Month 6 retention (paid) | 50%+ |
| Refund rate | <5% |
| Account deletion rate | <2%/month |
| Noor overage pack purchase rate | 5%+ of paid users |
| ARPU | $0.50/month |
| ARPPU | $1.30/month |
| LTV | $15+ |
| CAC | <$3 |

### 9.3 Cohort analysis

Track by:
- Signup week
- Country
- Acquisition channel
- Initial plan (monthly vs annual)

Monthly reports show retention curves.

---

## Part 10 — Launch Criteria

### 10.1 "Ready for launch" definition

ALL must be true:

#### Content
- [ ] All 72 chapters authored, scholar-reviewed
- [ ] All 380+ lessons published, tested
- [ ] All 600+ vocabulary words with audio, translation, Quranic context
- [ ] All 11 SPOKEN_PHRASES lessons with audio
- [ ] All 15 REVIEW lessons
- [ ] All 11 Tadabbur Surahs mapped
- [ ] All ~50 milestones illustrated, copy finalized
- [ ] All illustrations generated, curated
- [ ] English and Urdu copy fully translated, reviewed

#### Technical
- [ ] All File 13 Pre-launch Checklist items confirmed
- [ ] `DEV_UNLOCK_ALL = false`
- [ ] Production API URL configured
- [ ] Production OpenAI API key set
- [ ] Sentry active
- [ ] Mixpanel active
- [ ] App icon and splash finalized
- [ ] No critical bugs (P0/P1) open
- [ ] Acceptable performance on Android API 26 entry device
- [ ] All Test Plans complete (300+ test cases)

#### Monetization infrastructure
- [ ] Apple App Store Connect: products configured, sandbox tested
- [ ] Google Play Console: products configured, license tested
- [ ] Webhook endpoints verified
- [ ] Receipt verification working end-to-end
- [ ] Restore purchases tested across devices
- [ ] IAP transaction flow tested with sandbox

#### Legal and compliance
- [ ] Privacy Policy published (live URL)
- [ ] Terms of Service published (live URL)
- [ ] Apple App Privacy Labels filled accurately
- [ ] Google Play Data Safety section filled
- [ ] GDPR/data deletion flow tested
- [ ] App Store screenshots and listing copy finalized

#### Customer support
- [ ] Support email active (`support@warsh.app`)
- [ ] FAQ document published
- [ ] Escalation process documented
- [ ] At least 1 person on-call

#### Beta testing
- [ ] Closed beta with ≥20 users complete
- [ ] Critical feedback addressed
- [ ] At least one quote suitable for App Store review

### 10.2 Phased launch strategy

**Phase 0: Internal alpha (Weeks 1–2 post-spec lock)**
- Warsh team only
- All features functional, content partial (Books 1–2)
- Goal: surface bugs

**Phase 1: Closed beta (Month 1)**
- 20–50 invited users via TestFlight or APK
- Books 1–3 available
- Feedback via in-app + WhatsApp group
- Goal: validate emotional fit, gather quotes

**Phase 2: Open beta (Months 2–3)**
- Play Store beta track (Android)
- Books 1–5 available
- Open signups
- Goal: validate at scale

**Phase 3: Soft launch (Month 4)**
- Play Store public listing (Pakistan only)
- Books 1–7 available, Book 8 in progress
- Organic only
- Goal: $1k MRR

**Phase 4: Public launch (Month 5–6)**
- All 8 Books complete
- iOS App Store submission
- Marketing push begins
- Goal: $10k MRR within 6 months

### 10.3 Soft launch behavior

- App publicly available on Play Store in Pakistan
- No marketing spend
- Organic growth (beta users, founder network)
- Subscriptions enabled, processing
- Monitor metrics daily
- Critical issues addressed within 24 hours

### 10.4 Public launch

When all Books live + iOS approved:

- Coordinated launch via:
  - Founder social media (LinkedIn, Twitter, Instagram)
  - Pakistani Muslim community channels
  - Targeted ads ($500 starting budget)
  - Outreach to scholars / Islamic content creators
- Press: Pakistani tech publications (Dawn, Tribune Tech)
- Goal: validate at scale

---

## Part 11 — App Store Optimization (ASO)

### 11.1 Listing copy

**App name (locked):** "Warsh — Quranic Arabic"
**Subtitle (iOS):** "Speak, read, and understand."

**Short description (Google Play, 80 chars):**
"Speak, read, and understand the Arabic of the Quran with Ustaad Noor."

**Full description (4000 chars max):**

```
Warsh teaches you the Arabic of the Quran, Hadith, khutbahs, and Islamic scholarship — so you can finally understand what you've been reciting all your life.

For Muslims who pray, recite Quran, and want to understand it themselves.

🌙 WHAT YOU'LL LEARN

• Read classical Arabic word by word
• Understand the Quran in Salah and in study
• Speak Fus'ha — the language of scholars, imams, and revelation
• Hear native pronunciation through real recitation
• Build vocabulary that lives in the Quran

📖 HOW IT WORKS

Every lesson opens with a real ayah. You hear it. Then you discover the words inside. You practice them. You see them again — this time, you understand. That moment is what Warsh is built for.

🧑‍🏫 USTAAD NOOR — YOUR AI TUTOR

Ask Noor anything about Arabic. Get warm, patient explanations from a teacher who knows the curriculum deeply. Noor is here to help, not to gamify.

🎯 TADABBUR — UNDERSTANDING THE QURAN

Watch the Quran's words light up as you learn them. Begin with Al-Fatiha. Then An-Nas, Al-Falaq, Al-Ikhlas — one Surah at a time, until what you recite becomes what you understand.

🗣️ SPEAK WITH CONFIDENCE

Practice greetings, du'a, halaqa phrases, and questions for a scholar. Hear yourself say them. Compare with the original. Build the muscle of spoken Fus'ha.

✨ 600+ WORDS, FREE FOREVER

Your vocabulary bank stays with you — even if you don't subscribe. Browse by topic. Search in Arabic, English, or Urdu. Listen to every word.

🤲 BUILT WITH CARE

• Scholar-validated curriculum from Madinah Arabic Reader
• 72 chapters across 8 Books, sourced from Dr. Hafiz Muhammad Zubair's lectures
• No hearts, no shame, no manipulative tricks
• Just steady, beautiful, structured learning

📿 7 DAYS FREE

Then $1/month or $10/year. Less than a cup of chai.

Cancel anytime in your device settings.

This is Warsh. وَرْش. Where Arabic is crafted.
```

**iOS keywords (100 chars):**
```
quran,arabic,learn,fusha,tadabbur,islamic,muslim,nahw,sarf,urdu,madinah,reader,quranic,classical
```

### 11.2 Screenshots (5–8 per device)

1. **Hero:** "Speak, read, and understand the Quran"
2. **Lesson Hook:** Ayah displayed beautifully — "Begin with revelation."
3. **Discover card:** Vocabulary with illustration — "Words come to life."
4. **Practice:** Exercise UI — "Learn through use, not memorization."
5. **Reveal:** Grammar concept in ayah — "Now you can see it."
6. **Tadabbur:** Color-coded Surah comprehension — "Watch the Quran light up."
7. **Noor:** Chat with the AI tutor — "Your teacher, always present."
8. **Vocabulary Bank:** Browse by topic — "600+ words. Yours forever."

Parchment background, brand colors, Warsh visual language.

### 11.3 Promo video (recommended)

30 seconds mirroring the Preview Experience:
- Bismillah audio over slow parchment zoom
- Words appear, dissolve into ayat
- Quick lesson interactions
- Tadabbur visualization (Surah lighting)
- Closing: "Warsh — Quranic Arabic"

---

## Part 12 — Marketing Positioning

### 12.1 One-line pitch

"Warsh helps Muslims understand the Quran they recite — through a beautiful, scholar-validated Arabic learning journey."

### 12.2 Hero story (for decks, social, blog)

> Every day, over a billion Muslims recite the Quran in Salah. Most — including most in Pakistan, India, Indonesia, and the global diaspora — don't understand what they're saying. They've memorized the sounds. The meaning lives behind a language barrier.
>
> Warsh is the journey across that barrier. Built from the same curriculum used in Islamic universities for 50 years (Madinah Arabic Reader), taught through a warm AI tutor, structured around the Quran itself — Warsh takes a learner from "I don't know any Arabic" to "I understand my Salah" in a sustained, gentle path.
>
> No gamification tricks. No hearts. No shame. Just a teacher, a book, and a learner — meeting every day for 10 minutes.

### 12.3 Differentiators

| Vs. | Warsh's edge |
|---|---|
| **Duolingo (Arabic)** | Madinah curriculum vs. random vocab; reverence vs. cartoon; Islamic focus vs. dialect |
| **Kalam** | Fus'ha for scholarship/Quran vs. casual dialect; structured curriculum |
| **Madinah Arabic (free PDF/YouTube)** | Mobile-first interactive; spaced repetition; AI tutor |
| **Tarteel** | Comprehension vs. memorization (complementary) |
| **Quran translation apps** | Teaches the language vs. just shows translation |

### 12.4 Target communities

- Pakistani Islamic learning Facebook groups
- Quranic Arabic YouTube channel comment sections (with permission)
- Pakistani Muslim diaspora (US, UK, Canada)
- South Asian Muslim convert communities
- Pakistani university student associations
- Islamic seminaries (Darul Ulooms, with permission)

### 12.5 Endorsement strategy

Pre-launch, seek endorsement from:
- Dr. Hafiz Muhammad Zubair (already collaborating)
- Other respected Pakistani scholars (case-by-case)
- Islamic content creators (YouTube/Instagram)
- Madinah graduates teaching in Pakistan

A few authentic endorsements > dozens of paid ads.

---

## Part 13 — Sustainability and Unit Economics

### 13.1 Monthly costs at 10k MAU

| Cost | Amount |
|---|---|
| Vercel hosting | ~$50 |
| Neon PostgreSQL | ~$30 |
| Cloudflare R2 storage | ~$10 |
| OpenAI (Noor GPT-4o-mini) | ~$50 |
| OpenAI (TTS, periodic) | ~$20 |
| Mixpanel | $0 (free tier) |
| Sentry | $0 (free tier) |
| Apple Developer | $99/year ≈ $8/month |
| Google Play | $25 one-time |
| Domain + email | $10/month |
| **Total** | **~$180/month at 10k MAU** |

### 13.2 Revenue at 10k MAU

Assumptions:
- 25% conversion to paid = 2,500 subscribers
- 40% annual, 60% monthly
- After Apple/Google + tax:
  - Annual: $5.83/year ÷ 12 = $0.49/month
  - Monthly: $0.58/month
- Overage packs: ~5% of paid × $0.99 × 0.55 net = $0.027/user/month

MRR = (1,000 × $0.49) + (1,500 × $0.58) + (2,500 × $0.027) = **$1,427/month**

**Net at 10k MAU: $1,247/month (positive)**

### 13.3 Break-even

Break-even MAU: ~1,800 MAU with 25% conversion → ~450 paid subscribers → covers monthly costs.

Achievable within months of public launch.

### 13.4 LTV vs CAC

- Target LTV: $15 per paid user (12-month average retention)
- Target CAC: <$3 (mostly organic + some paid social)
- LTV:CAC ratio: 5:1 — healthy

### 13.5 Year 1 success target

12 months post-public-launch:
- 50,000 MAU
- 10,000 paid subscribers
- $6,000+ MRR
- Self-sustaining: covers costs + reasonable founder salary + content production budget for Books 9+

---

## Part 14 — Risk and Mitigation

### 14.1 Key risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Content production too slow | High | Phase launch (Books 1–3 first); recruit team post-MRR |
| iOS App Store rejection | Medium | Submit Android first; learn from rejection feedback |
| Pricing too low | Low | Increase for new users if needed; grandfather existing |
| Pricing too high for Pakistan | Low | $1/month below most equivalents; regional pricing v2 |
| Apple/Google policy changes | Medium | Monitor guidelines closely |
| Noor API costs balloon | Low | 5/day cap; backend monitoring; circuit breaker at $1k/month |
| Negative reviews on religious accuracy | Medium | Scholar review; clear Noor scope boundaries |
| Competing app launches | Medium | Focus on quality + emotional differentiation; don't compete on features |
| 30-day churn | Medium | Strong onboarding moments; engagement system |
| Urdu translation quality | Medium | Native speaker on translation team; user feedback channels |

### 14.2 Accepted risks

- Small trial-gaming (acceptable cost)
- Some refund rate (<5%)
- Content delays post-launch (updates expected)
- Some negative reviews (no app is universally loved)
- Minor scope creep in v2/v3 (controlled)

---

## Part 15 — Edge Cases

### 15.1 User subscribes during trial, cancels before trial ends
- No charge (canceled before billing)
- Keeps full access until end of original 7-day trial
- Then paywall as normal

### 15.2 User switches monthly → annual
- iOS Settings → Subscriptions → Warsh → Switch Plans
- Apple/Google handle proration
- Warsh shows confirmation: "Switched to annual. Welcome."

### 15.3 Annual subscriber cancels
- Remains active until end of annual period
- Full access for up to 12 months from purchase
- After expiration, paywall

### 15.4 User changes Apple ID
- Subscription tied to Apple ID
- New Apple ID = no subscription on this device
- "Restore purchases" doesn't help across Apple IDs
- User must subscribe again or sign back into original

### 15.5 User wants to gift Warsh
- Not supported in v1
- Apple has "Gift this App" but messy with subscriptions
- v2: gift codes, family sharing support

### 15.6 User in unsupported country
- App Store/Play Store determines availability
- v1 = Pakistan first, then expand
- Users outside launch market can't download

### 15.7 User on very old device
- iOS <14 or Android API <26: install refused
- Store shows "Requires iOS 14.0 or later"
- User must upgrade

### 15.8 Pakistan business buyer wants tax invoice
- Apple/Google issue receipts
- They handle tax invoicing per jurisdiction
- For unusual cases, support email can help

### 15.9 Payment failure
- Apple/Google retry automatically (3 attempts over 7 days)
- During retry, user retains access
- If all retries fail, subscription expires
- User gets payment failure notification from store
- Can update payment method in OS settings

---

## Part 16 — Future Considerations (Not v1)

- **Lifetime purchase** ($50 one-time) — simplifies but lose recurring revenue. v2.
- **Family plan** ($3/month for 4 users) — Apple Family Sharing handles partially. v2.
- **Gift cards** — interesting for Ramadan/Eid. v2.
- **Referral program** (refer 3, get 1 month free) — viral mechanic. v2.
- **Tiered subscription** — adds complexity. Reject unless needed.
- **Per-region pricing** — increase Western market prices ($3/month US). v2.
- **Anniversary discount** (50% off renewal after 1 year) — retention. v2.
- **B2B/institutional licensing** (madrasahs, Islamic schools) — separate sales motion. v3+.
- **Web version with Stripe subscription** — significant rebuild. v3+.
- **Permanent free tier with ads** — Anti-pattern. Reject.

---

## Part 17 — Test Plan

### Trial flow
- [ ] Create new account → trial timer starts correctly
- [ ] Day 1–7 trial period — all features accessible
- [ ] Day 5 banner appears, dismissible
- [ ] Day 7 banner appears
- [ ] Trial expires exactly 7 days after account creation
- [ ] Trial expires immediately when Chapter 1 completed (if before day 7)
- [ ] Chapter 1 completion modal during trial offers subscription

### Paywall flow
- [ ] Paywall (Y4) appears when user taps chapter after trial
- [ ] Y4 appears when user taps Noor after trial
- [ ] Y4 appears when user taps Tadabbur after trial
- [ ] Both pricing tiles render
- [ ] Annual tile pre-selected
- [ ] User can switch selection
- [ ] "Cancel anytime" text visible
- [ ] Restore purchases button works
- [ ] Apple/Google required text shown
- [ ] "Vocabulary Bank free forever" note shown

### IAP flow
- [ ] Monthly subscribe → IAP modal → confirm → access granted
- [ ] Annual subscribe → IAP modal → confirm → access granted
- [ ] Cancel IAP transaction → no charge, no access change
- [ ] Overage pack → 20 messages added to Noor balance
- [ ] Receipt verification on backend works
- [ ] Receipt verify fails → user not upgraded (support recovery)

### Restore purchases
- [ ] Subscribe Device A → sign in Device B → restore → recognized
- [ ] No subscription to restore → message shown
- [ ] Restore on iOS works
- [ ] Restore on Android works

### Cancellation
- [ ] Cancel via OS settings → backend webhook → state updated
- [ ] After cancel, retain access until period end
- [ ] After period end, paywall appears

### Refund
- [ ] User requests refund via Apple/Google → webhook fires → access revoked

### Account deletion
- [ ] Delete account → confirmation flow → account removed
- [ ] After delete, app returns to A1
- [ ] User can't log in with deleted account
- [ ] Backend confirms data deletion within 30 days

### Trial banners
- [ ] Banner shown each day of trial
- [ ] Banner dismissible per day
- [ ] Different copy per day
- [ ] Post-trial banner shown on L1
- [ ] Post-trial banner not dismissible

### Webhook handling
- [ ] Apple renewal → access extended
- [ ] Apple failure → access expires
- [ ] Google renewal → access extended
- [ ] Google failure → access expires

### Analytics
- [ ] All monetization Mixpanel events fire correctly
- [ ] Cohort tracking works in dashboard

---

## Part 18 — Changelog

**2026-05-19 — v1.0**
- Complete monetization model locked
- $1/month and $10/year subscription tiers configured
- 7-day trial mechanics specified
- First-chapter trial-end rule locked
- Paywall (Y4) layout and triggers defined
- IAP integration for Apple and Google
- Restore purchases, cancellation, refund, account deletion flows specified
- App Store listing copy drafted
- Marketing positioning documented
- Unit economics validated
- Risk register completed
- 30-item test plan

---

*End of File 10.*
*Next: File 11 — Design System & Copy.*
