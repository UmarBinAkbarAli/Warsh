# Warsh Beta Infrastructure Progress Report

## Checklist Reference
Based on: `warsh-beta-infra-readiness-checklist.md`

---

# Current Status

Core beta infrastructure is operational and verified.

Working systems:
- Vercel backend deployment
- Neon PostgreSQL production connection
- Prisma migrations
- Seeded production database
- Authentication flow
- Protected API routes
- Mobile app API connectivity
- Expo/EAS project linkage
- Android build pipeline initialization
- Cloudflare R2 storage
- Resend email integration

---

# Completed Infrastructure

## 1. Android Package Identity

Verified:
- Package: `com.warsh.app`
- Scheme: `warsh`
- EAS project linked successfully

Verified files:
- `app.json`
- Android native package configuration

EAS Project:
- Owner: `@umarbinakbarali`
- Project: `Warsh`
- Project ID: `70bb098d-013a-47ab-88d0-890da928d976`

---

## 2. Vercel Production Environment

Configured successfully:

### Runtime
- `NODE_ENV=production`
- `LOG_LEVEL=info`
- `DEV_UNLOCK_ALL=false`

### Authentication
- `JWT_SECRET`
- `JWT_EXPIRES_IN=30d`

### OpenAI
- `OPENAI_API_KEY`
- `OPENAI_MODEL=gpt-4o-mini`
- `OPENAI_TTS_MODEL=tts-1`
- `OPENAI_TTS_VOICE=onyx`
- `AI_DAILY_MESSAGE_LIMIT=5`

### Database
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`

### Email
- `RESEND_API_KEY`
- `SMTP_FROM_EMAIL`

### Cloudflare R2
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ENDPOINT`
- `R2_PUBLIC_URL`

### App Runtime
- `NEXT_PUBLIC_APP_URL=https://warsh-backend.vercel.app`

### Cron
- `CRON_SECRET`

### Apple
- `APPLE_BUNDLE_ID`
- `APPLE_NOTIFICATION_WEBHOOK_SECRET`

### Google Play
- `GOOGLE_PLAY_PACKAGE_NAME`

---

# Important Domain Clarification

Custom domains are NOT configured yet because the `warsh.app` domain has not been purchased.

Therefore these are NOT active:
- `api.warsh.app`
- `assets.warsh.app`

Temporary beta URLs:

### Backend
`https://warsh-backend.vercel.app`

### Cloudflare R2 Assets
`https://<generated>.r2.dev`

---

## 3. Neon Database

Verified:
- Production branch exists
- Migrations ran successfully
- Tables created successfully

Confirmed tables:
- User
- Chapter
- Lesson
- Achievement
- VocabularyWord
- Subscription
- Streak

Database reads verified successfully.

---

## 4. Cloudflare R2

Completed:
- R2 enabled
- Bucket created: `warsh-assets`
- API token created
- Public access enabled
- R2 environment variables configured

Deferred:
- Custom domain mapping
- CDN cache rules

Reason:
- No owned domain yet

Current beta strategy:
- Use generated `.r2.dev` public URL

---

## 5. Custom Domains

Deferred completely.

Reason:
- `warsh.app` not purchased yet

Deferred items:
- `api.warsh.app`
- `assets.warsh.app`
- DNS setup
- SSL setup

---

## 6. Google Play Console

Not started yet.

Pending:
- Play Console app creation
- IAP products
- Service account
- RTDN setup
- Internal testing upload

---

## 7. Apple App Store Connect

Deferred intentionally.

Reason:
- Android-first beta strategy

---

## 8. EAS Mobile Builds

Completed:
- EAS CLI operational
- Expo project linked
- Android keystore generated
- Build pipeline started

Fixed:
- Slug mismatch (`Warsh` vs `warsh`)
- Invalid API URLs in `eas.json`

Current build target:
- `preview`

Current backend URL:
- `https://warsh-backend.vercel.app`

---

## 9. Sentry

Partially configured.

Status:
- Vercel auto-integrated Sentry

Pending:
- Proper backend project naming
- Mobile DSN setup
- Alert configuration
- Validation testing

---

## 10. Mixpanel

Partially configured.

Detected:
- `EXPO_PUBLIC_MIXPANEL_TOKEN`

Pending:
- Dashboard validation
- Funnel creation
- Event verification

---

## 11. UptimeRobot

Not started yet.

---

## 12. Config Hygiene

Verified:
- `DEV_UNLOCK_ALL=false`
- Runtime configuration operational

Still recommended:
```bash
git grep -r "sk-" -- "*.ts" "*.js" "*.json"
```

---

## 13. Cron / Webhooks

Not verified yet.

Pending:
- Cron validation
- Manual trigger testing
- Webhook verification

---

# Functional Verification Completed

## Authentication
- Register works
- Login works

## API
- Health endpoint operational
- Protected routes operational

## Content
- Chapters load correctly
- Lessons open correctly
- Seeded data accessible

## Mobile Connectivity
- Expo app connected successfully to production backend

---

# Current Architecture

## Backend
- Vercel

## Database
- Neon PostgreSQL

## Asset Storage
- Cloudflare R2

## Mobile
- Expo / React Native

## Public Backend URL
`https://warsh-backend.vercel.app`

## Android Package
`com.warsh.app`

---

# Technical Fixes Applied

## Fixed EAS Slug Mismatch

Corrected local Expo slug alignment to match EAS project.

---

## Fixed Invalid API Domains

Replaced invalid non-owned domains:

### Removed
- `https://api.warsh.app`

### Replaced With
- `https://warsh-backend.vercel.app`

Applied inside:
- `eas.json`
- Runtime environment configuration

---

# Current Readiness Estimate

## Infrastructure Readiness
~75%

## Backend Readiness
Operational

## Closed Beta Feasibility
YES

Conditions:
- APK build succeeds
- No runtime crashes
- Physical device smoke test passes

---

# Remaining High Priority Tasks

1. Finish Android APK build
2. Install APK on physical device
3. Verify crash-free operation
4. Purchase production domain
5. Configure Google Play Console
6. Configure IAP testing
7. Validate Sentry and Mixpanel
