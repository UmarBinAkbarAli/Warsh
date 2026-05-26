# Warsh Beta Infrastructure Readiness Checklist

**Status:** Draft for beta readiness
**Last updated:** 2026-05-26

This checklist tracks infrastructure items that must be configured outside the repo before closed beta. Do not put real secrets in git; use Vercel environment variables, EAS secrets, Expo project settings, and store-console credentials.

## Config Hygiene

- [ ] Rotate any API key that was ever committed or shared outside the secret manager.
- [ ] Confirm `arabai-backend/.env.example` contains placeholders only.
- [ ] Confirm `arabai-app/.env.example` contains only public `EXPO_PUBLIC_*` values.
- [ ] Confirm production `DEV_UNLOCK_ALL=false` in Vercel.
- [ ] Confirm mobile builds use `EXPO_PUBLIC_API_URL=https://api.warsh.app` for production and `https://api-staging.warsh.app` for beta/staging.

## Backend Hosting

- [ ] Vercel project linked to the backend repo.
- [ ] Staging and production environments configured separately.
- [ ] `DATABASE_URL` configured for each environment.
- [ ] `JWT_SECRET` generated with at least 32 random characters.
- [ ] OpenAI, Sentry, and Mixpanel environment variables set in Vercel.
- [ ] Health endpoint checked after deployment.
- [ ] Custom domains configured: `api-staging.warsh.app` and `api.warsh.app`.

## Mobile Builds

- [ ] EAS project linked to the Expo app.
- [ ] Android internal beta build uses the `preview` profile.
- [ ] Production smoke APK uses the `previewProd` profile only after production API is live.
- [ ] Store package IDs are finalized before public store submission.
- [ ] Sentry and Mixpanel public tokens are set per EAS profile when ready.

## External Services

- [ ] Neon beta database created and migrated.
- [ ] Cloudflare R2 bucket and `assets.warsh.app` public domain configured.
- [ ] Sentry projects created for backend and mobile.
- [ ] Mixpanel project created with beta dashboards.
- [ ] Uptime monitor configured for `https://api.warsh.app/api/health`.
- [ ] Google Play internal testing track prepared.
- [ ] Apple TestFlight deferred until iOS build target is active.

## Beta Gate

- [ ] No real secrets in tracked files.
- [ ] Backend JSON/config files parse cleanly.
- [ ] EAS JSON parses cleanly.
- [ ] Vercel deployment succeeds in staging.
- [ ] Android internal APK installs and reaches the configured staging API.
- [ ] P0/P1 infra caveats are documented before inviting testers.
