# Warsh Beta Infrastructure Readiness Checklist

**Status:** Active — beta gate passed; remaining items are Google Play / IAP / spec gaps  
**Last updated:** 2026-06-04  
**Owner:** Umar

---

## How to use this checklist

Items marked **[CODE]** have already been handled in the repo — nothing for you to do.  
Items marked **[YOU]** require manual action in an external console or terminal.  
Items marked **[BLOCKER]** must be done before any beta APK is distributed.

---

## 1. Package Identity (Android)

These were all `com.arabai.app` / scheme `arabai` — now corrected to `com.warsh.app` / scheme `warsh`.

- [x] **[CODE]** `app.json` → `android.package = "com.warsh.app"`, `scheme = "warsh"` ✓
- [x] **[CODE]** `android/app/build.gradle` → `applicationId` and `namespace` = `com.warsh.app` ✓
- [x] **[CODE]** `android/app/src/main/AndroidManifest.xml` → intent-filter schemes updated to `warsh` and `com.warsh.app` ✓
- [x] **[CODE]** `android/app/src/main/java/com/warsh/app/` → Kotlin source files moved; package declarations updated ✓
- [x] **[CODE]** `warsh-backend/app/reset-password/route.ts` → deep link and intent URI updated to `warsh://` and `com.warsh.app` ✓

> **Note:** After the above package rename, run `npx expo prebuild` (without `--clean`) to let Expo sync any remaining auto-generated files. This is optional before an EAS cloud build but recommended before a local Gradle build.

---

## 2. Vercel — Backend Production Environment

**[BLOCKER]** All of these must be set in Vercel → Project Settings → Environment Variables **before** your first production deploy.

Go to: https://vercel.com → your backend project → Settings → Environment Variables

Set the following for **Production** environment (and where noted, also Staging):

### Database
| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgres://...@....neon.tech/warsh?sslmode=require` (Production Neon branch) |
| `DIRECT_DATABASE_URL` | Same as above (needed for migrations) |

### Auth
| Variable | Value |
|---|---|
| `JWT_SECRET` | Generate: `openssl rand -base64 48` — must be 32+ chars |
| `JWT_EXPIRES_IN` | `30d` |

### AI / Noor
| Variable | Value |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI key from platform.openai.com |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `OPENAI_TTS_MODEL` | `tts-1` |
| `OPENAI_TTS_VOICE` | `onyx` |
| `AI_DAILY_MESSAGE_LIMIT` | `5` |

### Cloudflare R2
| Variable | Value |
|---|---|
| `R2_ACCESS_KEY_ID` | From R2 API Token (see Section 4) |
| `R2_SECRET_ACCESS_KEY` | From R2 API Token |
| `R2_BUCKET_NAME` | `warsh-assets` |
| `R2_PUBLIC_URL` | `https://assets.warsh.app` |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |

### Apple IAP
| Variable | Value |
|---|---|
| `APPLE_SHARED_SECRET` | App Store Connect → Apps → In-App Purchases → App-Specific Shared Secret |
| `APPLE_BUNDLE_ID` | `com.warsh.app` |
| `APPLE_NOTIFICATION_WEBHOOK_SECRET` | Generate: `openssl rand -hex 32` |

### Google Play IAP
| Variable | Value |
|---|---|
| `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY` | JSON key from Google Cloud Console service account (see Section 6) |
| `GOOGLE_PLAY_PACKAGE_NAME` | `com.warsh.app` |
| `GOOGLE_PLAY_NOTIFICATION_WEBHOOK_SECRET` | Generate: `openssl rand -hex 32` |

### Email (Password Reset)
| Variable | Value |
|---|---|
| `RESEND_API_KEY` | From resend.com dashboard |
| `SMTP_FROM_EMAIL` | `noreply@warsh.app` |

### Cron
| Variable | Value |
|---|---|
| `CRON_SECRET` | Generate: `openssl rand -hex 32` |

### Monitoring
| Variable | Value |
|---|---|
| `SENTRY_DSN` | From Sentry project settings (backend project) |
| `SENTRY_ORG` | Your Sentry org slug |
| `SENTRY_PROJECT` | `warsh-backend` |
| `SENTRY_AUTH_TOKEN` | Sentry token for production source map uploads |
| `MIXPANEL_TOKEN` | From Mixpanel project settings |

### Runtime
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://warsh.app` |
| `NODE_ENV` | `production` |
| `LOG_LEVEL` | `info` |
| `DEV_UNLOCK_ALL` | `false` ← **MUST be false** |

### Staging environment (separate)
Repeat the above for the **Preview** environment in Vercel, but point `DATABASE_URL` to the Neon staging branch and set `NEXT_PUBLIC_APP_URL=https://api-staging.warsh.app`.

---

## 3. Neon — Database

- [ ] **[YOU]** Create a **production branch** in Neon dashboard (keep dev and production separate).
- [ ] **[YOU]** Copy the production connection string into Vercel `DATABASE_URL` (Step 2 above).
- [ ] **[YOU]** After first Vercel deploy, confirm migrations auto-ran: check Neon → Tables → confirm `User`, `Chapter`, `Lesson` etc. exist.
- [ ] **[YOU]** Run seed on production DB:
  ```bash
  DATABASE_URL="<production-url>" node warsh-backend/prisma/seed.cjs
  ```
  This populates all chapters, lessons, vocabulary (585 words), Tadabbur (11 Surahs), achievements.
- [ ] **[YOU]** Verify Neon auto-backup is enabled (it is by default — just confirm in dashboard).
- [ ] **[YOU]** Set up a staging branch for the `preview` Vercel environment.

---

## 4. Cloudflare R2 — Asset Storage

- [ ] **[YOU]** Create bucket named `warsh-assets` in Cloudflare R2 dashboard.
- [ ] **[YOU]** Create an R2 API Token with **Object Read & Write** permissions. Copy the Access Key ID and Secret Access Key into Vercel env vars (Section 2).
- [ ] **[YOU]** Enable public access on the bucket and map it to `assets.warsh.app`:
  - Cloudflare → R2 → warsh-assets → Settings → Custom Domains → Add `assets.warsh.app`
- [ ] **[YOU]** Add Cloudflare Cache Rule: assets under `/audio/*` and `/images/*` — cache for 1 year.
- [ ] **[YOU]** Upload placeholder audio files so the app doesn't hard-error on missing audio. The lesson JSON has URLs like `https://cdn.warsh.app/audio/...` — upload at least one test file to confirm the bucket and CDN are working.

> **Audio strategy for beta:** For the beta, silence is acceptable for missing audio files — the app should gracefully skip audio rather than crash. Confirm `expo-av` errors are caught in the lesson player.

---

## 5. Custom Domains (DNS)

- [ ] **[YOU]** Add `api.warsh.app` as a custom domain in Vercel → your backend project → Settings → Domains.
- [ ] **[YOU]** Add `api-staging.warsh.app` for the staging/preview environment.
- [ ] **[YOU]** In your DNS provider: add CNAME records pointing both to Vercel's provided value.
- [ ] **[YOU]** Confirm both domains have valid SSL (Vercel provisions this automatically — check the green padlock).
- [ ] **[YOU]** Hit `https://api.warsh.app/api/health` — expect `{"data":{"status":"ok",...}}`.

---

## 6. Google Play Console — IAP and Store

- [ ] **[YOU]** Create a Google Play Developer account if not already done ($25 one-time fee).
- [ ] **[YOU]** Create a new app with package name `com.warsh.app`.
- [x] **[YOU]** Create subscription products — **DONE 2026-06-04**:
  - Product ID: `warsh_monthly` — $1.00/month ✓
  - Product ID: `warsh_yearly` — $10.00/year ✓ (note: code updated from `warsh_annual` → `warsh_yearly` to match)
- [ ] **[YOU]** Create consumable product:
  - Product ID: `warsh_noor_pack` — $0.99 (20 Noor messages)
- [ ] **[YOU]** Set up a Google Cloud service account for server-side receipt verification:
  1. Google Cloud Console → Service Accounts → Create
  2. Grant role: **Pub/Sub Subscriber** + **Android Publisher** viewer
  3. Download JSON key → paste full JSON into Vercel `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY`
  4. Link the service account in Play Console → Setup → API access
- [ ] **[YOU]** Configure Real-Time Developer Notifications (RTDN):
  - Play Console → Monetization → Real-time developer notifications
  - Set topic URL to your backend webhook: `https://api.warsh.app/api/webhooks/google`
  - Set `GOOGLE_PLAY_NOTIFICATION_WEBHOOK_SECRET` in Vercel
- [ ] **[YOU]** Upload an internal testing APK to unlock IAP sandbox testing (Play requires at least one build uploaded before IAP works in sandbox).

---

## 7. Apple App Store Connect — IAP (Deferred — iOS build not yet targeted)

_Skip until iOS build is prioritized. Document here for when that time comes._

- [ ] **[FUTURE]** Create app in App Store Connect with bundle ID `com.warsh.app`.
- [ ] **[FUTURE]** Create subscription group "Warsh Premium".
- [ ] **[FUTURE]** Create subscription products: `warsh_monthly` ($0.99), `warsh_annual` ($9.99).
- [ ] **[FUTURE]** Create consumable: `warsh_noor_pack` ($0.99).
- [ ] **[FUTURE]** Generate App-Specific Shared Secret → add to Vercel `APPLE_SHARED_SECRET`.
- [ ] **[FUTURE]** Configure App Store Server Notifications V2 webhook to `https://api.warsh.app/api/webhooks/apple`.

---

## 8. EAS — Mobile Builds

- [ ] **[YOU]** Install EAS CLI: `npm install -g eas-cli`
- [ ] **[YOU]** Log in: `eas login`
- [ ] **[YOU]** Confirm the EAS project is linked: `eas project:info` — should show project ID `70bb098d-013a-47ab-88d0-890da928d976`.
- [ ] **[YOU]** Set EAS secrets for monitoring (these are baked into the APK, not stored in Vercel):
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "https://...@sentry.io/..."
  eas secret:create --scope project --name EXPO_PUBLIC_MIXPANEL_TOKEN --value "your-mixpanel-token"
  ```
- [ ] **[YOU]** Build the internal beta APK (points to staging API):
  ```bash
  cd warsh-app
  eas build --platform android --profile preview
  ```
- [ ] **[YOU]** Once the build succeeds, download the APK and install on a test device.
- [ ] **[YOU]** Confirm the APK connects to `https://api-staging.warsh.app` (visible in the health check response).
- [ ] **[YOU]** For production smoke test (after staging is confirmed clean):
  ```bash
  eas build --platform android --profile previewProd
  ```

---

## 9. Sentry — Error Tracking

- [ ] **[YOU]** Create two Sentry projects at sentry.io:
  - `warsh-backend` (Node.js / Next.js platform)
  - `warsh-mobile` (React Native platform)
- [ ] **[YOU]** Copy each project's DSN.
- [ ] **[YOU]** Backend DSN → Vercel env var `SENTRY_DSN` (set in Section 2).
- [ ] **[YOU]** Mobile DSN → EAS secret `EXPO_PUBLIC_SENTRY_DSN` (set in Section 8).
- [ ] **[YOU]** Set `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` in Vercel for production source map uploads.
- [x] **[YOU]** After `SENTRY_DSN` is set, run the backend smoke test — **DONE 2026-05-30**: event ID `2e79df2b6db94cc29c2f966bd99423f9` confirmed in Sentry.
- [x] **[YOU]** After first production deploy with errors, confirm Sentry receives the event — **DONE 2026-06-04**: mobile Sentry event confirmed from release APK on physical device.
- [ ] **[YOU]** Set up Sentry alert: **Email me when a new issue is detected** (free tier default). ← still pending

---

## 10. Mixpanel — Analytics

- [ ] **[YOU]** Create a Mixpanel project at mixpanel.com named "Warsh".
- [ ] **[YOU]** Copy the project token.
- [ ] **[YOU]** Backend token → Vercel env var `MIXPANEL_TOKEN`.
- [ ] **[YOU]** Mobile token → EAS secret `EXPO_PUBLIC_MIXPANEL_TOKEN`.
- [ ] **[YOU]** After first beta install, confirm Mixpanel is receiving events: check Live View in Mixpanel dashboard.
- [ ] **[YOU]** Create the core funnel: `app_open → lesson_started → lesson_completed → paywall_viewed → subscription_started`

---

## 11. UptimeRobot — Health Monitoring

- [x] **[YOU]** Create free account at uptimerobot.com — **DONE 2026-06-04**.
- [x] **[YOU]** Add HTTP monitor — **DONE 2026-06-04**:
  - URL: `https://api.warsh.app/api/health`
  - Interval: 5 minutes
  - Alert contact: your email
- [x] **[YOU]** Confirm the monitor shows "Up" — **DONE 2026-06-04**.

---

## 12. Config Hygiene (Final Check)

- [ ] **[YOU]** Confirm no real secrets in any tracked file: `git grep -r "sk-" -- "*.ts" "*.js" "*.json"` — should return nothing sensitive.
- [ ] **[YOU]** Confirm `warsh-backend/.env.example` has only placeholder values (no real keys).
- [ ] **[YOU]** Confirm `warsh-app/.env.example` has only `EXPO_PUBLIC_*` values (safe to commit).
- [ ] **[YOU]** Confirm `DEV_UNLOCK_ALL` is not present in any production Vercel env (or explicitly `false`).
- [ ] **[CODE]** `EXPO_PUBLIC_API_URL` throws at build time if missing or misconfigured ✓ (enforced in `services/api.ts`)

---

## 13. Webhook Endpoints (Cron)

The cron jobs are already wired in `vercel.json`:
- `POST /api/cron/reset-streaks` — fires daily at 23:00 UTC (= 04:00 PKT next day)
- `POST /api/cron/expire-trials` — fires every 6 hours

- [ ] **[YOU]** After first Vercel production deploy, go to Vercel → Logs → confirm cron jobs are appearing in the schedule.
- [ ] **[YOU]** Set `CRON_SECRET` in Vercel (Section 2) — the cron routes validate this header.
- [ ] **[YOU]** Manually trigger a cron in Vercel dashboard to confirm the endpoint responds 200.

---

## 14. Beta Gate Checklist

Only distribute the beta APK after all of the following are confirmed:

- [x] `https://api.warsh.app/api/health` returns `{"data":{"status":"ok",...}}` — confirmed
- [x] Seed ran on production DB — chapters + lessons visible via `/api/chapters` — confirmed
- [x] EAS beta APK (`preview` profile) installs and reaches `api-staging.warsh.app` — confirmed 2026-05-30
- [x] Register + login flow works on the beta APK — **confirmed 2026-06-04 smoke-test**
- [x] Complete one lesson end-to-end (hook → discover → practice → reveal → close) — **confirmed 2026-06-04 smoke-test**
- [x] Streak updates after lesson completion — **confirmed 2026-06-04 smoke-test**
- [ ] Paywall appears after Chapter 1 is completed (7-day trial rule) — not yet confirmed on device
- [x] No Sentry P0 errors (unhandled crashes) on a 15-minute smoke test session — **confirmed 2026-06-04**
- [x] `DEV_UNLOCK_ALL=false` confirmed in Vercel production — confirmed

---

## 15. Known Gaps (Not Blocking Beta)

These are documented gaps to address before public launch but not required for closed beta:

- **Audio files:** All fixture audio URLs point to `https://cdn.warsh.app/...` which doesn't exist yet. The app must not crash on missing audio — use a try/catch around `expo-av` calls.
- **IAP sandbox test:** Requires an uploaded Play Store build — can't test until Step 6 is done.
- **iOS build:** Deferred until Android beta is stable.
- **OTA updates:** `updates.url` is set in `app.json` — requires EAS Update to be configured (`eas update:configure`) before OTA pushes work.
- **Privacy Policy / Terms:** Must be published at `warsh.app/privacy` and `warsh.app/terms` before public launch. Not required for closed beta.
- **Sentry source maps:** Runtime reporting is wired. Source map upload stays disabled unless `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` are set in Vercel.
