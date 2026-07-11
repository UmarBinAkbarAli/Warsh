# Warsh · وَرْش — App Specification
## File 13: Technical & Infrastructure

**Status:** Locked
**Version:** 1.0
**Last updated:** 2026-05-19
**Depends on:** Files 01–12

> This file specifies the development environment, deployment pipeline, environment variables, monitoring, the pre-launch checklist, and the operations playbook. This is the file the developer (you, future Umar) returns to when something breaks or needs to be deployed.

---

## Part 1 — Stack Overview

### 1.1 Confirmed stack (locked)

| Layer | Technology | Notes |
|---|---|---|
| Mobile app framework | Expo SDK 51, React Native, TypeScript | |
| Mobile state management | Zustand | Simple, performant |
| Mobile storage | `expo-secure-store` (auth), `AsyncStorage` (cache) | |
| Mobile audio | `expo-av` | Recording + playback |
| Mobile notifications | `expo-notifications` | Local + remote push |
| Mobile IAP | `react-native-iap` | iOS + Android |
| Mobile fonts | `expo-font` | Lora + Scheherazade New |
| Mobile animations | React Native Reanimated 3 + Moti + Lottie | Per File 11 |
| Mobile icons | `lucide-react-native` | Plus custom illustrations |
| Backend framework | Next.js 14 (App Router), TypeScript | |
| Backend ORM | Prisma 7 | |
| Database | PostgreSQL on Neon (serverless) | |
| Object storage | Cloudflare R2 | Audio, images |
| AI | OpenAI API (GPT-4o-mini, TTS) | |
| Backend hosting | Vercel | |
| Backend cron | Vercel Cron | |
| Error tracking | Sentry | Free tier |
| Analytics | Mixpanel | Free tier |
| Push delivery | Expo Push Notifications + FCM | |
| Auth | JWT (HS256) | Custom implementation, not third-party |
| CDN | Cloudflare | For static asset delivery |
| Domain | warsh.app | TBD — alternative: warshapp.com |

### 1.2 Why these choices

- **Expo over bare React Native:** Faster iteration, OTA updates, fewer native build complications. Expo SDK 51 covers all needs.
- **Next.js over a separate backend:** One framework, one team, one deployment pipeline. Vercel cron handles scheduled tasks natively.
- **PostgreSQL over MongoDB:** Relational structure fits the curriculum/progression model far better. Prisma's developer experience is excellent.
- **Neon over RDS/managed PostgreSQL:** Serverless pricing means low costs at low scale. Auto-scaling. Great DX.
- **Cloudflare R2 over S3:** No egress fees. S3-compatible. Cheaper at our scale.
- **OpenAI over Anthropic/local models:** GPT-4o-mini is the best price/performance for Noor's task. Easy migration if needed.
- **JWT over OAuth:** Simpler, sufficient for our auth needs. No third-party dependency for login.

### 1.3 What we're NOT using (and why)

| Avoided | Why |
|---|---|
| Firebase Auth | We have one auth need (email+password) — JWT is enough |
| Realm / Watermelon DB | Local storage needs are simple — AsyncStorage suffices |
| GraphQL | REST is simpler, faster to build, sufficient |
| TanStack Query (React Query) | Considered. Adds bundle size. For v1, simple fetch + Zustand is enough. Revisit for v2. |
| Redux | Zustand is lighter and sufficient |
| Native iOS / Android dev | Cross-platform with Expo gets us 90% of the way at 50% of the cost |
| Stripe (mobile) | Apple/Google require their IAP for digital subscriptions |
| Custom CMS | Curriculum content lives in the database; admin tools are a separate concern |

---

## Part 2 — Repository Structure

### 2.1 Recommended monorepo structure

```
warsh/
├── apps/
│   ├── mobile/                    # React Native / Expo app
│   │   ├── app/                   # Expo Router screens
│   │   ├── components/            # UI components
│   │   ├── services/              # API client, audio, storage
│   │   ├── stores/                # Zustand stores
│   │   ├── constants/             # theme.ts, brand tokens
│   │   ├── assets/                # Fonts, images
│   │   ├── i18n/                  # en.json, ur.json
│   │   ├── app.json               # Expo config
│   │   └── package.json
│   │
│   └── backend/                   # Next.js API
│       ├── app/api/               # API routes (App Router)
│       ├── lib/                   # Business logic
│       ├── prisma/                # Schema, migrations, seed
│       ├── lib/email/             # Email templates (reset password)
│       └── package.json
│
├── packages/                      # Optional shared code
│   ├── shared-types/              # TypeScript types shared between app + backend
│   └── shared-constants/          # Brand colors, enums, etc.
│
├── docs/                          # Spec files (files 01–13 + sub-docs)
├── content/                       # Curriculum source files (YouTube transcripts, vocab lists)
├── scripts/                       # Build, deploy, content generation scripts
└── README.md
```

### 2.2 Alternative: separate repos

If a monorepo feels heavy:

- `warsh-mobile` — the Expo app
- `warsh-backend` — the Next.js API
- `warsh-content` — curriculum source files and content scripts

This is fine for v1. Easier to set up. Lose some convenience of shared types.

**Locked decision for v1:** Two repos — `warsh-app` and `warsh-backend` — matching the current Phase 1 structure.

### 2.3 Branch strategy

- `main` — production (auto-deploys)
- `develop` — staging (auto-deploys to staging environment)
- `feature/<name>` — feature branches, merged into develop via PR
- `hotfix/<name>` — urgent fixes, merged into main directly

Tag releases as `v1.0.0`, `v1.0.1`, etc.

---

## Part 3 — Environment Variables

### 3.1 Mobile app environment variables

Set via Expo's `app.config.js` and `EXPO_PUBLIC_` prefix:

```bash
# Production
EXPO_PUBLIC_API_URL=https://api.warsh.app
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_MIXPANEL_TOKEN=...
EXPO_PUBLIC_SENTRY_DSN=...

# Staging
EXPO_PUBLIC_API_URL=https://api-staging.warsh.app
EXPO_PUBLIC_ENVIRONMENT=staging

# Development (per-developer)
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000
EXPO_PUBLIC_ENVIRONMENT=development
```

**Note:** All production and previewProd EAS build profiles now use `https://api.warsh.app`. The `warsh-backend.vercel.app` fallback has been replaced in all code paths (eas.json, forgot-password fallback, start-warsh.ps1). ✅

### 3.2 Backend environment variables

Set in Vercel project settings, never committed to repo:

```bash
# Database
DATABASE_URL=postgres://...@...neon.tech/warsh?sslmode=require
DIRECT_DATABASE_URL=postgres://...@...neon.tech/warsh?sslmode=require  # for migrations

# Auth
JWT_SECRET=<long-random-string>
JWT_EXPIRES_IN=30d

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_NOOR_MODEL=gpt-4o-mini
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=onyx

# Anthropic (backup, optional)
ANTHROPIC_API_KEY=sk-ant-...

# Cloudflare R2
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=warsh-assets
R2_PUBLIC_URL=https://assets.warsh.app
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com

# Apple App Store
APPLE_SHARED_SECRET=...
APPLE_BUNDLE_ID=com.warsh.app
APPLE_NOTIFICATION_WEBHOOK_SECRET=...

# Google Play
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY=<JSON key>
GOOGLE_PLAY_PACKAGE_NAME=com.warsh.app
GOOGLE_PLAY_NOTIFICATION_WEBHOOK_SECRET=...

# Email (for password reset)
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM_EMAIL=noreply@warsh.app

# Analytics + Errors
SENTRY_DSN=...
MIXPANEL_TOKEN=...

# Misc
NEXT_PUBLIC_APP_URL=https://warsh.app
NODE_ENV=production
LOG_LEVEL=info

# Feature flags (env-controlled)
DEV_UNLOCK_ALL=false       # MUST be false in production
ENABLE_NOOR_STREAMING=false # v1.1 feature
```

### 3.3 Local development setup

For each developer:

```bash
# 1. Clone repos
git clone git@github.com:warsh/warsh-backend.git
git clone git@github.com:warsh/warsh-app.git

# 2. Backend setup
cd warsh-backend
cp .env.example .env.local
# Edit .env.local with local Postgres URL, dev OpenAI key
npm install
npx prisma migrate dev
npm run db:seed
npm run dev  # starts on port 3000

# 3. Mobile setup
cd warsh-app
cp .env.example .env.local
# Edit .env.local with EXPO_PUBLIC_API_URL=http://127.0.0.1:3000
npm install
npm run dev  # starts Expo dev server
```

### 3.4 Database setup (local)

- Install PostgreSQL 15+ locally OR use a local Neon dev branch
- Create database `warsh_dev`
- Set `DATABASE_URL` in backend `.env.local`
- Run `npx prisma migrate dev` to apply schema
- Run `npm run db:seed` to populate curriculum, vocabulary, milestones

---

## Part 4 — Deployment Pipeline

### 4.1 Backend deployment (Vercel)

- Auto-deploy on push to `main` (production) and `develop` (staging)
- Vercel reads `next.config.js` and `package.json`
- Migrations run automatically via `prisma migrate deploy` in build step
- Environment variables set in Vercel project settings
- Production URL: `api.warsh.app` (custom domain on Vercel)
- Staging URL: `api-staging.warsh.app`

**Pre-deploy checks:**
- TypeScript compilation passes
- No Prisma migration conflicts
- All API tests pass (when added)

### 4.2 Mobile app deployment (Expo / EAS Build)

Two distribution channels:

**For Android (Google Play):**
- `eas build --platform android --profile production` — builds AAB
- Upload to Google Play Console
- Internal testing track first, then beta, then production

**For iOS (App Store):**
- `eas build --platform ios --profile production` — builds IPA
- Upload to App Store Connect via Transporter or Expo's automation
- TestFlight first, then App Store review, then production

**For sideloading (Android beta):**
- `eas build --platform android --profile preview` — builds APK
- Distribute APK directly to beta testers via download link
- Useful before Google Play account is approved

**EAS Build configuration (`eas.json`):**

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": {
        "track": "internal"
      }
    }
  }
}
```

### 4.3 OTA updates (Expo Updates)

For minor changes (UI fixes, copy changes, non-native bug fixes):

- `eas update` pushes a new JavaScript bundle to all installed apps
- Apps fetch the update on launch
- Native code changes still require full app store submission
- This is gold for fixing post-launch issues without waiting for App Store review

### 4.4 Database migration strategy

```bash
# Local dev — generate a new migration after schema changes
npx prisma migrate dev --name <description>

# Staging — applies pending migrations
DATABASE_URL=$STAGING_URL npx prisma migrate deploy

# Production — same
DATABASE_URL=$PRODUCTION_URL npx prisma migrate deploy
```

Vercel runs `prisma migrate deploy` automatically in the build step.

**Rule:** Never edit production data directly via SQL except for emergencies. Always go through migrations.

---

## Part 5 — Monitoring and Logging

### 5.1 Error tracking (Sentry)

**Setup:**
- Mobile: `sentry-expo` package
- Backend: `@sentry/nextjs` package
- DSN configured via environment variable
- Source maps uploaded for both platforms

**What gets tracked:**
- Unhandled exceptions
- Promise rejections
- Network errors (with response codes)
- Performance issues (slow API calls)
- User context (user_id, environment, app version)

**What gets EXCLUDED:**
- User-typed content (Noor messages, name, etc.) — privacy
- Email addresses — privacy
- Sensitive request/response bodies

**Alert rules:**
- Production error rate > 1% of requests → email alert
- New error type (not seen before in last 7 days) → email alert
- P95 latency exceeds 5x baseline → email alert

### 5.2 Analytics (Mixpanel)

**Setup:**
- Mobile: `mixpanel-react-native` package
- Backend: `mixpanel` Node SDK (for server-side events)

**Events tracked** (per File 03, 08, 09, 10):
- All onboarding events
- All engagement events (streak, daily goal, milestones)
- All Noor events
- All monetization events (paywall views, IAP)
- Lesson start/complete

**User properties:**
- `user_id` (Mixpanel distinct_id)
- `email_hash` (SHA256 of email, not raw email)
- `country` (from IP, anonymized)
- `subscription_status`
- `signup_date`
- `current_chapter`
- `current_streak`

**Dashboards to build:**
- Funnel: install → preview → onboarding → first lesson → 7-day retention → paid
- Retention cohort: weekly retention curves
- Engagement: daily active users, weekly active users, lesson completion rate
- Monetization: trial → paid conversion, MRR, ARPU

### 5.3 Logging

**Backend logs:**
- All API requests (method, path, status, duration, user_id)
- All errors with stack traces
- IAP receipt verification results
- Webhook events received
- Cron job execution

**Log levels:**
- `error`: Failures requiring attention
- `warn`: Unexpected but recoverable
- `info`: Important state changes (user signed up, subscription started)
- `debug`: Verbose diagnostic info (off in production)

**Log storage:**
- Vercel: stores 1 hour of logs by default; upgrade to Vercel Pro for longer retention
- Critical events also sent to Sentry for permanent record
- Consider adding Logtail or BetterStack for centralized logging if scale demands

### 5.4 Uptime monitoring

- **Tool:** UptimeRobot (free tier)
- **Endpoints monitored:**
  - `GET https://api.warsh.app/api/health` every 5 minutes
  - Mobile app deep link to `warsh://learn` (synthetic) — manual test
- **Alerts:** Email + SMS if endpoint is down for >2 minutes

---

## Part 6 — Cloudflare R2 Configuration

### 6.1 Bucket structure

```
warsh-assets/
├── audio/
│   ├── ayat/                 # Quranic recitations
│   ├── words/                # Vocabulary word audio
│   ├── phrases/              # SPOKEN_PHRASES audio
│   ├── dialogues/            # Mini-dialogue lines
│   ├── noor/                 # Pre-recorded Noor TTS (if any)
│   └── sfx/                  # Sound effects
│
├── images/
│   ├── words/                # Vocabulary illustrations
│   ├── scenes/               # SPOKEN_PHRASES scenes
│   ├── badges/               # Milestone badges
│   ├── topics/               # Vocabulary topic illustrations
│   └── empty-states/         # Empty state illustrations
│
├── brand/
│   ├── logo-primary.png
│   ├── logo-arabic-only.png
│   ├── splash-bg.png
│   └── app-icon.png
│
└── share/
    └── (generated share images, ephemeral — auto-delete after 7 days)
```

### 6.2 Access control

- **Read access:** Public via custom domain `assets.warsh.app` (Cloudflare CDN)
- **Write access:** Only via signed S3 API calls from backend
- **CORS:** Allow GET from mobile app domain(s)
- **No public bucket listing**

### 6.3 Custom domain setup

- Map `assets.warsh.app` to R2 bucket via Cloudflare
- Add caching rules: aggressive caching (1 year) for audio + images
- Cache busting via versioned filenames (e.g., `kitab_v2.mp3`)

### 6.4 Upload pipeline

Audio and image assets are uploaded via:

1. **Manual upload** (via Cloudflare dashboard or `wrangler` CLI) for one-off assets
2. **Batch script** (`scripts/upload-assets.ts`) for bulk content production
3. **Backend signed URLs** for any future user-uploaded assets (e.g., profile photos)

---

## Part 7 — Performance and Scalability

### 7.1 Mobile app performance targets

| Metric | Target |
|---|---|
| App cold start time | < 3 seconds on Android API 26 |
| Lesson load (cached) | < 500ms |
| Lesson load (uncached) | < 3 seconds |
| Screen transition | < 200ms |
| Tab switch | < 100ms |
| Audio playback start | < 300ms after tap |
| Frame rate (animations) | 60 FPS on iPhone 11+, Android API 28+ |
| Memory usage | < 200 MB typical, < 350 MB max |

### 7.2 Backend performance targets

(Reiterated from File 12)

| Endpoint type | P50 latency | P95 latency |
|---|---|---|
| Read endpoints | < 200ms | < 500ms |
| Write endpoints | < 500ms | < 1500ms |
| Noor chat | < 2000ms | < 5000ms |

### 7.3 Scalability plan

| User scale | What to do |
|---|---|
| 0–10k MAU | Default Vercel + Neon serverless covers everything |
| 10k–50k MAU | Upgrade Neon to paid tier; add Redis cache (Upstash) for hot endpoints |
| 50k–250k MAU | Add CDN caching for lesson JSON; consider database read replicas |
| 250k+ MAU | Sharding, queue-based processing for heavy ops (Surah comprehension recalc) |

For v1 launch, default settings are fine.

### 7.4 Database query optimization

- Use Prisma's `select` to fetch only needed fields
- Avoid N+1 queries — use `include` / `select` strategically
- Paginate everything that could return >100 rows
- Use indexes (per File 12 Section 9)

### 7.5 Bundle size optimization (mobile)

- Use `expo-font` for font preloading
- Lazy-load illustrations (Expo Image)
- Avoid heavy npm packages (audit `node_modules` size)
- Target initial JS bundle: < 5 MB

---

## Part 8 — Security and Compliance

### 8.1 Security checklist

- [ ] HTTPS only (TLS 1.3) — enforced via Vercel
- [ ] JWT secrets stored as environment variables, never in code
- [ ] All passwords hashed with bcrypt (cost factor 12)
- [ ] Input validation on every endpoint via Zod
- [ ] Rate limiting on auth endpoints
- [ ] CORS configured to allow only known origins
- [ ] No secrets in mobile app code (only in backend)
- [ ] Database backups enabled (Neon does this automatically)
- [ ] SQL injection prevented by Prisma's parameterized queries
- [ ] XSS not applicable (no web UI directly user-facing)
- [ ] Apple App Store and Google Play security guidelines reviewed

### 8.2 Data privacy

- Encrypted in transit (HTTPS)
- Encrypted at rest (Neon, R2 defaults)
- User can delete account at any time
- Voice recordings never leave device
- Chat messages auto-deleted after 180 days
- No data sold to third parties — locked principle
- Data residency: stored in US-East by default; consider migrating to EU or APAC if EU/Pakistani regulations require

### 8.3 GDPR / Pakistan data protection

Even though primary launch is Pakistan:

- Privacy Policy published and accessible from app and website
- User has right to access their data (export feature deferred to v2)
- User has right to delete their data (implemented in v1)
- Cookie banners not needed (no web frontend collecting cookies in v1)

### 8.4 App Store / Play Store compliance

- **Apple App Privacy Labels:** Fill out accurately
  - Data collected: email, name, usage data, performance data
  - Data not collected: location, contacts, biometric data
  - Data linked to user: yes
  - Data used for tracking: no
- **Google Play Data Safety:** Same disclosures

---

## Part 9 — Pre-Launch Checklist

This is the master checklist. Every item must be checked off before launch.

### Code and configuration

- [ ] `DEV_UNLOCK_ALL = false` in production environment
- [ ] `EXPO_PUBLIC_API_URL` set to `https://api.warsh.app` (not localhost)
- [ ] All environment variables configured in production Vercel project
- [ ] No hardcoded URLs in mobile code (use environment variables)
- [ ] No console.log statements with sensitive data
- [ ] No `TODO` comments left in critical paths
- [ ] All dependencies updated to latest patch versions (security)
- [ ] No vulnerable dependencies (`npm audit` clean)
- [ ] TypeScript strict mode enabled, no `any` in critical paths
- [ ] All tests pass (when added)

### Database

- [ ] Production database migrated to latest schema
- [ ] Seed data loaded (chapters, lessons, vocabulary, Surahs, milestones, word of the day)
- [ ] Database indexes verified (per File 12)
- [ ] Backup strategy confirmed (Neon auto-backups enabled)
- [ ] Connection pooling configured
- [ ] Connection limits appropriate for Vercel concurrent requests

### Backend deployment

- [ ] Production deployment on Vercel succeeds
- [ ] Custom domain `api.warsh.app` configured and SSL valid
- [ ] All API endpoints respond correctly
- [ ] Health check endpoint returns 200
- [ ] Cron jobs configured and tested
- [ ] Webhook endpoints (Apple, Google) tested with sandbox
- [ ] Rate limiting functional
- [ ] Sentry receiving error events
- [ ] Mixpanel receiving events

### Mobile app

- [ ] iOS production build succeeds (`eas build --platform ios --profile production`)
- [ ] Android production build succeeds
- [ ] App icon (1024×1024) finalized and uploaded
- [ ] Splash screen finalized
- [ ] App version and build number set correctly
- [ ] Bundle ID matches App Store Connect and Google Play
- [ ] Push notification certificate uploaded (iOS APNS)
- [ ] FCM service account configured (Android)
- [ ] Microphone permission description set in `Info.plist` and `AndroidManifest.xml`
- [ ] Notification permission description set

### Content

- [ ] All 72 chapters published in database
- [ ] All ~380 lessons published with audio, illustrations, copy
- [ ] All 600+ vocabulary words with audio, translation, Quranic context
- [ ] All 11 SPOKEN_PHRASES lessons published
- [ ] All 15 REVIEW lessons published
- [ ] All 11 Tadabbur Surahs mapped (Surah → vocabulary words)
- [ ] All ~50 milestones with badges
- [ ] Word of the Day populated for first 60 days
- [ ] Scholar review documented for all content
- [ ] English copy in `en.json` complete
- [ ] Urdu copy in `ur.json` complete and reviewed

### Audio and assets

- [ ] All Quranic ayah audio uploaded to R2
- [ ] All vocabulary word audio uploaded (TTS or human)
- [ ] All spoken phrase audio uploaded
- [ ] All dialogue audio uploaded
- [ ] All illustrations uploaded
- [ ] All milestone badge images uploaded
- [ ] CDN caching configured

### Monetization

- [ ] Apple App Store Connect: Subscription products configured (`warsh_monthly`, `warsh_yearly`)
- [ ] Apple App Store Connect: Consumable product configured (`warsh_noor_overage_pack`)
- [ ] Apple App Store Connect: Subscription group configured
- [ ] Google Play Console: Subscription products configured
- [ ] Google Play Console: Consumable product configured
- [ ] Apple webhook URL configured (App Store Server Notifications V2)
- [ ] Google webhook URL configured (Real-time developer notifications)
- [ ] Sandbox IAP tested on iOS
- [ ] License testing tested on Android
- [ ] Restore purchases tested across devices

### Legal and compliance

- [ ] Privacy Policy published at `https://warsh.app/privacy`
- [ ] Terms of Service published at `https://warsh.app/terms`
- [ ] Subscription terms published at `https://warsh.app/subscription-terms`
- [ ] Apple App Privacy Labels filled accurately
- [ ] Google Play Data Safety filled accurately
- [ ] GDPR / data deletion flow tested
- [ ] Trademark check for "Warsh" name completed

### Monitoring and operations

- [ ] Sentry alerts configured
- [ ] UptimeRobot monitoring configured for `api.warsh.app/api/health`
- [ ] Mixpanel dashboards built for key metrics
- [ ] Logging configured at appropriate level (info in production)
- [ ] Support email `support@warsh.app` active
- [ ] FAQ document published at `https://warsh.app/help`

### App Store submission

- [ ] App Store screenshots prepared (8 per device size)
- [ ] App Store description finalized
- [ ] App Store keywords finalized
- [ ] App Store icon uploaded
- [ ] Promotional text written
- [ ] Demo video (optional but recommended) prepared
- [ ] Submit for Apple review
- [ ] Submit for Google Play review

### Beta testing complete

- [ ] Closed beta with at least 20 users completed
- [ ] All P0 / P1 bugs fixed
- [ ] At least one positive quote suitable for App Store reviews
- [ ] Beta user feedback documented
- [ ] Major usability issues addressed

### Final smoke tests

- [ ] Fresh install on iOS device → complete onboarding → complete first lesson → all works
- [ ] Fresh install on Android device → complete onboarding → complete first lesson → all works
- [ ] Subscribe via IAP on iOS sandbox → access granted → can use all paid features
- [ ] Subscribe via IAP on Android sandbox → access granted → can use all paid features
- [ ] Restore purchases on second device works
- [ ] Daily reminder push notification fires at scheduled time
- [ ] Streak survives across app restarts
- [ ] Offline mode: lessons work, completion syncs when back online

---

## Part 10 — Ongoing Operations

### 10.1 On-call / support coverage

For v1 launch:

- **Founder (Umar):** Primary on-call. Monitors Sentry, support email, key metrics daily
- **Response SLA:**
  - Critical (app crashes for all users): respond within 1 hour
  - Major (specific feature broken): respond within 4 hours
  - Minor (cosmetic, individual issues): respond within 24 hours
- **Tools:** Phone notifications for Sentry alerts, daily Mixpanel dashboard review, email checks

If scaling to a team, define roles and rotation schedule.

### 10.2 Customer support process

When a user emails `support@warsh.app`:

1. Ticket logged (could be just Gmail labels for v1)
2. Categorize: bug / billing / feature request / question
3. Respond within SLA window
4. For bugs: log in tracker, fix in next release
5. For billing issues: verify with Apple/Google receipts; refer to their support if needed
6. Track common issues and update FAQ

### 10.3 Common support issues (anticipated)

| Issue | Resolution |
|---|---|
| "I subscribed but don't have access" | Verify receipt, restore purchases, manually upgrade if needed |
| "I want a refund" | Direct to Apple/Google refund process |
| "Audio doesn't play" | Check device sound settings, app permissions, network |
| "I forgot my password" | Direct to password reset flow |
| "Noor said something wrong" | Acknowledge, refer to scholar for verification |
| "The app crashes" | Request device model, OS, app version; investigate via Sentry |
| "I want to change my email" | Direct to in-app email change flow |

### 10.4 Content updates post-launch

- New chapters: published via backend (no app update needed)
- Lesson content fixes: published via backend
- New milestones: published via backend
- UI text changes: OTA update via `eas update`
- Native code changes: full app store submission

### 10.5 Backups

- Database: Neon's automatic point-in-time recovery (7 days retention on free tier, 30+ on paid)
- Codebase: GitHub
- Content (audio, illustrations): R2 bucket with versioning enabled
- User-uploaded content (e.g., profile photos): R2 with versioning

### 10.6 Disaster recovery

If production database is corrupted or deleted:

1. Spin up new Neon database
2. Restore from latest backup
3. Update `DATABASE_URL` in Vercel
4. Verify health check
5. Communicate to users via email + in-app banner

Estimated recovery time: 1–2 hours.

---

## Part 11 — Scaling Considerations

### 11.1 When to scale up

Watch these signals:

- API P95 latency exceeds 1500ms consistently → optimize queries or add caching
- Vercel function execution costs > $50/month → consider edge functions or caching
- Neon DB CPU usage > 70% → upgrade tier
- R2 storage > 10 GB → enable lifecycle rules for stale assets
- OpenAI costs > $200/month at current MAU → consider cheaper model for some uses

### 11.2 Cost projections

| User scale | Monthly cost estimate |
|---|---|
| 0 users | ~$5/month (domain, base costs) |
| 1k MAU | ~$30/month |
| 10k MAU | ~$180/month (per File 10 unit economics) |
| 50k MAU | ~$800/month |
| 100k MAU | ~$1500/month |
| 1M MAU | ~$15k/month |

Revenue grows faster than costs (subscription model with low marginal cost per user), so unit economics improve at scale.

---

## Part 12 — Development Practices

### 12.1 Code quality

- **Linter:** ESLint with Next.js + React Native presets
- **Formatter:** Prettier
- **Type checker:** TypeScript strict mode
- **Pre-commit hooks:** `husky` + `lint-staged` to run linter/formatter on commit

### 12.2 Testing strategy

For v1, minimal automated testing — focus on manual QA per the test plans in each file. Post-v1:

- **Unit tests:** Jest for backend business logic
- **Integration tests:** Supertest for API endpoints
- **E2E tests:** Detox or Maestro for mobile flows
- **Coverage target:** 60% for backend critical paths

### 12.3 PR review process

- All changes go through PRs (no direct pushes to `main`)
- For solo dev: self-review with a checklist
- For team: at least one approving review

### 12.4 Documentation

- Spec files (this document set) — the source of truth
- README in each repo with setup instructions
- Code comments for non-obvious logic
- API endpoint OpenAPI/Swagger documentation (post-v1)

### 12.5 Versioning

- Mobile app: semantic versioning (`1.0.0`, `1.0.1`, etc.) in `app.json`
- Backend: not user-visible, but tagged in git for rollback safety
- Database: migration timestamps serve as version markers

---

## Part 13 — Risk Register

### 13.1 Technical risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| OpenAI API outage | Low | High (Noor unusable) | Show "Noor unavailable" message; consider Claude API as backup |
| Cloudflare R2 outage | Low | High (audio unusable) | Aggressive CDN caching; fallback to lower-quality bundled audio |
| Neon database failure | Low | Critical | Neon's HA + backups; restore plan documented |
| Vercel outage | Low | Critical | Limited mitigation; status page communication |
| App Store review rejection | Medium | High (delays launch) | Follow guidelines carefully; submit early; have backup plan with Android-only |
| Apple/Google policy change | Medium | Variable | Monitor announcements; have time buffer in launch plan |
| Critical bug in production | Medium | High | OTA updates for non-native fixes; quick response process |
| Cost overrun (OpenAI, hosting) | Low | Medium | Budget alerts; circuit breakers; rate limits |
| Database performance degradation | Low | Medium | Monitor queries; add indexes; consider read replicas |

### 13.2 Operational risks

| Risk | Mitigation |
|---|---|
| Founder unavailable (vacation, sickness) | Document everything; have a backup person who can respond to critical alerts |
| Lost access to Apple/Google developer accounts | Use 2FA backup codes; document recovery process |
| Lost access to Vercel/Neon/Cloudflare accounts | Same — recovery codes documented |
| Lost domain registration | Auto-renew enabled; backup payment method |

---

## Part 14 — Open Questions / Future Considerations

Things that are intentionally left open for v1, to be decided later:

- **Web version:** Currently no plans. If demand emerges, consider building a web companion (read-only at first) using Next.js.
- **iPad-optimized layouts:** v1 ships phone-first. iPad uses scaled phone UI initially.
- **Apple Watch / wearable companion:** Out of scope.
- **Voice input** for chat with Noor: Requires Arabic STT. v2.
- **Group features / family accounts:** Out of v1 scope.
- **Content authoring CMS:** For now, edit JSON seed files. As content team grows, build a proper admin dashboard.
- **A/B testing infrastructure:** Not in v1. If needed, add via Mixpanel or a dedicated A/B tool (Optimizely, Statsig) later.

---

## Part 15 — Changelog

**2026-05-19 — v1.0**
- Complete technical stack confirmed
- Repository structure defined
- Environment variables catalogued
- Deployment pipeline (Vercel, EAS Build, OTA updates) specified
- Monitoring strategy (Sentry, Mixpanel, UptimeRobot) defined
- Cloudflare R2 structure and access controls locked
- Performance targets reaffirmed
- Comprehensive 70-item pre-launch checklist
- Operations playbook
- Cost projections by scale
- Risk register

---

*End of File 13.*
*This completes the Warsh App Specification (Files 01–13).*
*See File 00 (Master Index) for the complete cross-reference.*
