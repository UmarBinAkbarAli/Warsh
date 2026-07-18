# design-sync notes — Warsh

## Scope: tokens-only (user decision 2026-07-18)

Warsh is an Expo/React Native app, **not** a web design-system library:
- No Storybook, no `*.stories.*`.
- `warsh-app/dist/` is an Expo **web export of the whole app**, not a consumable
  component bundle.
- Components (`ArabicText`, `BrandButton`, `PlayButton`, …) are React Native and
  do not render in the Claude Design web runtime.

So `/design-sync` cannot ship faithful web component previews here. This sync
ships **brand tokens + fonts only** as a lightweight foundation.

## What ships

Built by hand into `ds-bundle/` (git-ignored build artifact):
- `styles.css` — entry; `@import`s `fonts/fonts.css` and `tokens/tokens.css`.
- `tokens/tokens.css` + `tokens/tokens.json` — palette, type scale, spacing,
  radii, shadows, motion. **Source of truth: `warsh-app/constants/theme.ts`.**
- `fonts/` — Lora, Cormorant Garamond, Scheherazade New, Amiri (from
  `warsh-app/assets/fonts`).
- `README.md` — brand guidance / conventions header for the design agent.

No `_ds_sync.json` anchor (no components to hash/verify) — next sync re-generates
everything, which is correct.

## Re-syncing

Regenerate `ds-bundle/tokens/*` from `warsh-app/constants/theme.ts` whenever the
palette/type scale changes, then re-upload. Palette values are legacy-keyed in
`theme.ts` but the **spec-11 role names in the comments are canonical** — the
generated tokens use the role names (see [[ui-spec11-palette-is-truth]]).

Project: **Warsh Brand Foundation** — https://claude.ai/design/p/26695731-b45a-4b1a-a5d5-74c509c34d2e
