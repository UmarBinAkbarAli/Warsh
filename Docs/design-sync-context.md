# Context: Warsh design system + web app layout work

Paste this into Claude Code from `D:\Code\Warsh`. It hands over work started in a Claude (Cowork) chat on 2026-10-29.

## Goal

Make the **Warsh Design System** (a Claude Design System artifact) the single source of truth for the app's styling values, then fix the **web app's layout and UX** (the same Expo app running in the browser at app.warsh.app), which until now was just the phone layout inside a sidebar.

## Links

- Design system (artifact, private to Umar): https://claude.ai/artifact/LtpUxEekKJzn1RxqmPgryY
- Web layout and UX audit (doc with screenshots at 768/1024/1440px): https://claude.ai/artifact/XYcmewJfBUehdMP2dRxY7E

## Repo state

- Repo: `D:\Code\Warsh` (monorepo; app in `warsh-app/`, Expo 54 / React Native, web via react-native-web).
- Branch: **`design-sync/setup`**, created from `main@8460bfa`. **Nothing is committed yet**; all changes below are in the working tree. Commit only when Umar asks.
- `warsh-backend/lesson-image-delivery/` is an untracked folder that was already there. It is Umar's, so leave it alone.

## What the design system holds

- Tokens from `warsh-app/constants/theme.ts`, keeping the code's names:
  - 110 colours: the palette, tajweed, mushaf, alpha tints and colour roles
  - 32 type styles (phone sizes plus `-desktop` laptop-web sizes)
  - spacing `space-*`, radii `radius-*`, shadows `shadow-*`
  - 16 web-only layout tokens `web-*`
- 15 fonts (Inter, Cormorant Garamond, Scheherazade New, Amiri Quran, IndoPak Nastaleeq) plus Ionicons, and 3 logos.
- Guide sections, including **Web layout** (four page types) and **Source of truth**.
- 8 hand-written web copies of components (BrandButton, PlayButton, AuthInput, ConfirmDialog, BottomSheetModal, LearnRow, StreakWeekRow, ScreenHeader). They are reference only; the app's React Native components stay the source of truth for components.

## Design-system → app sync (done, step 2)

- `warsh-app/design-system/tokens.json`: the app's copy of the design system's `project/tokens.json`.
- `warsh-app/scripts/design-sync.mjs`: generates `warsh-app/constants/tokens.generated.ts`.
  - `npm run design-sync` writes the file.
  - `npm run design-sync -- --check` fails if the generated file is out of date.
- Where values land, by token name:
  - `tajweed-*` → `TajweedPalette`; `mushaf-*` → `MushafPalette`
  - `bg|text|accent|border-*`, `success`, `error`, `warning`, `overlay` → `Colors`
  - any other `rgba()` colour → `WarshAlpha`; every other colour → `WarshPalette`
  - type styles → `FontSizes` / `LineHeights` (`-desktop` styles are used at 1024px and up)
  - `space-*` → `Spacing`, `radius-*` → `Radii`, `shadow-*` → `Shadows` (elevation 1 and 4 stay in `theme.ts`)
  - `web-*` → `WebLayout` (camelCase: `bpTablet`, `bpLaptop`, `bpWide`, `railWidth`, `sidebarWidth`, `pageMax`, `readingMax`, `formMax`, `sideColumn`, `gutterTablet`, `gutterLaptop`, `gutterWide`, `gridGap`, `gridColsTablet`, `gridColsLaptop`, `gridColsWide`)
- `constants/theme.ts` now reads every value from the generated file. Its exported names are unchanged, and it also exports `WebLayout`. `DESKTOP_MIN_WIDTH = WebLayout.bpLaptop`.
- `WebShell` (`WEB_MAX_WIDTH`), `WebAppSidebar` (width) and `WebAuthLayout` (form max width) read from `WebLayout`.
- Verified: every exported theme value is identical before and after, on native and on laptop web. `tsc --noEmit` is clean. A full `expo export` was not run.

**How to sync from now on:**
1. Get the design system's current `project/tokens.json`, either with the Artifact tool's read action on the link above or by downloading it.
2. Overwrite `warsh-app/design-system/tokens.json` with it.
3. Run `npm run design-sync`.
4. Review the diff and put it on a new branch.

Never edit values in `theme.ts` or `tokens.generated.ts` by hand.

## Web layout values (in the design system)

| Value | Size | Notes |
| --- | --- | --- |
| Switch points | 768 / 1024 / 1280px | tablet / laptop / wide |
| Icon rail | 72px | used at 768–1023px |
| Sidebar | 260px | from 1024px |
| Page content cap | 1180px | |
| Reading width | 720px | |
| Form width | 440px | |
| Dashboard side column | 320px | from 1280px |
| Page padding | 24 / 32 / 48px | tablet / laptop / wide |
| Grid gap | 16px | |
| Grid columns | 2 / 3 / 4 | tablet / laptop / wide |

## The four page types

Every web screen should use one of these:

1. **Dashboard** (Learn, You): capped at the page width. One column below 1280px; from 1280px a main column plus the 320px side column. Name, streak and avatar go in the page header.
2. **Collection** (Vocabulary topics, All chapters, Quran list): capped at the page width; cards in a grid of 2 / 3 / 4 columns.
3. **Reading** (Noor, Settings, Streak, chapter detail): capped at the 720px reading width, starting at the page edge.
4. **Focus** (Lesson player, Quran reader): no sidebar; a top bar with close and progress; content centred at 720px.

**Rules:**
- Every page starts at the same left edge: sidebar or rail width plus the page padding for that width.
- Back chevrons only on stack screens, never on the five tabs.
- Text direction is set per text block from its language (Urdu and Arabic right-to-left, English left-to-right).
- From 1024px, bottom sheets open as centred dialogs.

## Shared web page frame (done, step 3; not yet verified in a browser)

- New `warsh-app/components/WebPage.tsx` provides:
  - `webShellMode(width)` → `"phone" | "rail" | "sidebar"`
  - `isDesktopWeb(width)` (true on web at 1024px and up)
  - `useWebLayout()` → `{ shell, isWeb, isDesktop, isWide, gutter, gridColumns }`
  - `useWebPageStyle(type)`: use it as a ScrollView's `contentContainerStyle`; returns `{}` on native and phone-width web
  - `<WebPage type side?>` and `<WebGrid phoneColumns? gap?>`
- `app/(app)/_layout.tsx` picks the shell with `webShellMode`: phone (no shell) below 768px, `<WebAppSidebar compact />` (the icon rail) at 768–1023px, the full sidebar from 1024px. Focus screens get no shell.
- `WebAppSidebar` gained a `compact` prop for the rail: icons only, with labels kept as accessibility labels.
- `FloatingTabBar` hides from 768px.
- **All 27 `width >= 960` checks** in screens were replaced with `isDesktopWeb(width)`, so they now switch at 1024px. `WebAuthLayout`'s 900px switch is also now 1024px.
- Learn (`app/(app)/(tabs)/index.tsx`) now works out its available width by subtracting the sidebar or rail width from `WebLayout` instead of a fixed 260px.
- `tsc --noEmit` is clean.
- **No screen uses `WebPage` / `useWebPageStyle` yet.** That's step 4.

## Audit findings to fix

1. No shared page frame: content starts 279–554px from the left and runs 590–1,128px wide, varying by screen.
2. At 1024px, Learn's main column is about 377px (narrower than the 768px layout); You's right column is about 266px.
3. Wide screens are 40–60% empty; lists (vocabulary topics, chapters, surahs) don't become grids.
4. Right-to-left text breaks: the lesson player's Urdu explanation is left-aligned; mixed English/Urdu in Noor and Learn rows renders in the wrong order.
5. The lesson player has no visible close or progress on desktop.
6. Quran and Settings show a back chevron although they're top-level.
7. The Learn header row (name, streak, avatar) floats at the far right edge.
8. The chapter-lessons error state is bare: no title, retry or way back.
9. Sidebar labels in `WebAppSidebar` are hard-coded English rather than translated (not fixed yet).

## Progress in Claude Code (2026-10-29)

Step 1 and step 2 are done and checked in a browser at 1440/1024/768px: Learn and You (Dashboard), the lesson player (Focus, with close, progress and right-to-left Urdu), Noor (Reading, with per-paragraph text direction), Vocabulary, All chapters and the Quran list (Collection grids), and Settings and Streak (Reading; Settings has no back chevron on web, and Streak keeps it as a stack screen). Also done: `WebAppSidebar` labels translated (finding 9); the chapter-lessons error state has a title, Try again and All chapters (finding 8); the chapter lessons page is on the shared frame (not yet checked in a browser). Audit re-run (step 3): every page starts on the same left edge, 308px at 1440, 292px at 1024 and 96px at 768. Owner decisions pending: Quran grid at 1024px truncates names (2 columns?), and Vocabulary's top cards stretch to 1180px.

Local check setup: staging Postgres runs as `warsh-staging-postgres-alt` on 127.0.0.1:15432, the local backend on :3000 points at it, and the web app is on localhost:8081.

## Next steps

1. **Check the shell in a browser.** Umar runs `npm run web` in `warsh-app` and signs in on localhost (it's a separate site from app.warsh.app, so the login doesn't carry over). Check the rail and sidebar at 768, 1024 and 1440px against the audit screenshots. The Linux shell on Umar's laptop used in the Cowork chat couldn't keep a dev server running, which is why this was left for him; in Claude Code you can run it directly.
2. **Move screens onto the frame**, one branch per screen or two, worst first:
   1. Learn (Dashboard)
   2. Lesson player (Focus: add close and progress, right-to-left fix)
   3. Noor (Reading, plus mixed-direction text)
   4. You (Dashboard)
   5. Vocabulary, All chapters, Quran list (Collection, using `WebGrid`)
   6. Settings and Streak (Reading)
   - Also remove the back chevrons on the tabs.
3. Re-run the audit at 768, 1024 and 1440px and compare.
4. Optional: once Umar asks, a scheduled task to sync the design system to the app.

## Umar's preferences

- Concise, precise communication; design-quality output.
- Heavy work (builds, rendering) runs on his laptop, not in the cloud.
- Work on branches; don't commit, push or merge without asking.
