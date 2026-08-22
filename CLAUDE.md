# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Follow `AGENTS.md` as the repository operating guide; it holds the full implementation rules and the Pen-first design-review gate.

## Active documentation

Only these are current requirements:

- `Docs/warsh-status.md` — what is built, verified, blocked, next
- `Docs/warsh-product-spec.md` — product behavior and locked decisions
- `Docs/warsh-technical-spec.md` — architecture, env vars, deployment, release gates
- Current code/config — final evidence

`Docs/archive/` is historical. Do not move, rename, or delete `landing/index.html` or `Docs/privacy-policy.html`; they back live public pages and Play Store contracts.

## Workspaces

Each is a separate npm project with its own `node_modules`; there is no monorepo tool. Run commands from inside the workspace directory.

- `warsh-backend/` — Next.js 14 App Router API (`app/api/`), Prisma 7, PostgreSQL/Neon, plus the token-gated admin dashboard (Warsh Studio) at `/dashboard`
- `warsh-app/` — Expo SDK 54 / React Native 0.81, expo-router, Android + web
- `packages/lesson-schema/` — canonical Zod schema for lesson `content` JSON; `warsh-backend/vendor/lesson-schema/` is the built copy the backend installs via `file:`
- `warsh-site/` — Next 16 public site (`warsh.app`: privacy, terms, help, delete-account routes)
- `landing/index.html` — static landing page, deployed separately

## Commands

Start the app (do not improvise the startup sequence):

```powershell
.\start-warsh.ps1              # release APK on the Warsh_API_34 emulator, production API
.\start-warsh.ps1 -dev         # local backend + Metro via ADB reverse to http://127.0.0.1:3000
.\start-warsh.ps1 -prod        # Metro against the production API
.\start-warsh-staging.ps1 -RefreshContent   # isolated local staging DB (127.0.0.1:55432)
.\install-warsh-apk.ps1 [path] # install/upgrade an already-built APK on the AVD
```

Backend commands and invariants: `warsh-backend/CLAUDE.md`. App commands and invariants: `warsh-app/CLAUDE.md`. Lesson schema commands: `packages/lesson-schema/CLAUDE.md`.

Pre-release gate is the code-validation block in `Docs/warsh-technical-spec.md` §13: backend `db:generate` + `db:validate-fixtures` + `db:audit-urdu` + `build`, then app `lint` + `tsc --noEmit`.

## Architecture

Request flow: Expo client → Axios (`warsh-app/services/api.ts`) with `Authorization: Bearer <JWT>` and `X-Warsh-Platform` → Next.js route in `warsh-backend/app/api/` → auth/validation/business rules → Prisma singleton → Neon Postgres, with optional OpenAI, R2, Resend, Google Play, Mixpanel/Sentry.

API envelope: success `{ "data": ... }`; expected failure `{ "error": "Human message", "code": "snake_case_code" }`. Protected routes derive the user from the token, never from a client-supplied id.

Content changes go to the local staging DB first, then a scoped production update (e.g. `npm run content:promote-tadabbur -- --apply`) — never the full production seed. After Prisma schema edits, generate and migrate before verifying.

## Note

This repo has a `.codex/config.toml`. If you want its MCP servers, commands, or instructions imported into Claude Code, reply `/import` to see what is importable, then `/import --yes=<digest>` to apply.
