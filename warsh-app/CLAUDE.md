# warsh-app

Commands (run from inside this directory):

```powershell
npm run lint -- --quiet
npx tsc --noEmit
npm run android; npm run web
npm run deploy:web             # Expo web export -> app.warsh.app (Vercel)
```

Invariants:

- Routes: `app/(auth)` (preview, auth, recovery, onboarding), `app/(app)` (authenticated stack), `app/(app)/(tabs)` = Learn, Vocabulary, Noor, You.
- `stores/authStore.ts` persists user/token; guards must wait for hydration before redirecting.
- `EXPO_PUBLIC_API_URL` sets the API origin — never commit a LAN IP. Web export uses `https://app.warsh.app` with a Vercel rewrite of `/api/*` to `api.warsh.app`.
- Arabic renders through `components/ArabicText.tsx`; CTAs use `components/BrandButton.tsx`; all tokens come from `constants/theme.ts` (no hardcoded hex); web wraps in `WebShell`.
- Keep `i18n/en.ts` and `i18n/ur.ts` in sync; Arabic learning content stays Arabic in both languages.
