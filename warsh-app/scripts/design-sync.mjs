#!/usr/bin/env node
// Generates constants/tokens.generated.ts from design-system/tokens.json.
//
// The Warsh design system (Claude Design System artifact) is the source of truth
// for colours, type sizes, spacing, radii, shadows and the web layout values.
// To sync: replace design-system/tokens.json with the design system's current
// project/tokens.json, then run `npm run design-sync`.
// `npm run design-sync -- --check` fails if the generated file is out of date.
//
// How tokens map to the app (by name):
//   tajweed-<key>          -> TajweedTokens.<key>
//   mushaf-<key>           -> MushafTokens.<key>
//   bg|text|accent|border-<key>, success, error, warning, overlay
//                          -> ColorRoleTokens (the shape of `Colors`)
//   any other rgba()/hsla() colour -> AlphaTokens (WarshAlpha)
//   any other colour       -> PaletteTokens (WarshPalette)
//   type styles <name> / <name>-desktop -> font sizes and line heights
//   space-<key>, radius-<key>, shadow-<key>, web-<key> -> Spacing, Radii, Shadows, WebLayout

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "design-system", "tokens.json");
const OUT = join(root, "constants", "tokens.generated.ts");
const check = process.argv.includes("--check");

const tokens = JSON.parse(readFileSync(SRC, "utf8"));
const fail = (msg) => {
  console.error(`design-sync: ${msg}`);
  process.exit(1);
};

// ── colours ────────────────────────────────────────────────────────────────
const colorList = tokens.color?.tokens ?? [];
const firstTheme = tokens.color?.themes?.[0]?.id ?? "light";
const raw = new Map(
  colorList.map((t) => [t.name, typeof t.value === "string" ? t.value : t.value[firstTheme]]),
);

function resolve(name, seen = new Set()) {
  if (seen.has(name)) fail(`alias cycle at ${name}`);
  seen.add(name);
  const v = raw.get(name);
  if (v == null) fail(`unknown colour token ${name}`);
  const m = /^\{(.+)\}$/.exec(v);
  return m ? resolve(m[1], seen) : v;
}
const fmtColor = (v) => (/^#[0-9a-f]{3,8}$/i.test(v) ? v.toUpperCase() : v);
const camel = (s) => s.replace(/-([a-z0-9])/gi, (_, c) => c.toUpperCase());

const palette = {}, tajweed = {}, mushaf = {}, alpha = {};
const roles = { bg: {}, text: {}, accent: {}, border: {} };
const ROLE_TOP = ["success", "error", "warning", "overlay"];
for (const { name } of colorList) {
  const v = fmtColor(resolve(name));
  let m;
  if ((m = /^tajweed-(.+)$/.exec(name))) tajweed[m[1]] = v;
  else if ((m = /^mushaf-(.+)$/.exec(name))) mushaf[m[1]] = v;
  else if ((m = /^(bg|text|accent|border)-(.+)$/.exec(name))) roles[m[1]][m[2]] = v;
  else if (ROLE_TOP.includes(name)) roles[name] = v;
  else if (/^(rgba|hsla)\(/i.test(raw.get(name))) alpha[name] = v;
  else palette[name] = v;
}

// ── type ───────────────────────────────────────────────────────────────────
const px = (v, where) => {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  if (!Number.isFinite(n)) fail(`not a number: ${where} = ${v}`);
  return n;
};
const sizes = {}, lines = {}, dSizes = {}, dLines = {};
for (const group of tokens.type?.groups ?? []) {
  for (const s of group.styles ?? []) {
    const desktop = s.name.endsWith("-desktop");
    const key = desktop ? s.name.slice(0, -"-desktop".length) : s.name;
    (desktop ? dSizes : sizes)[key] = px(s.fontSize, `${s.name}.fontSize`);
    (desktop ? dLines : lines)[key] = px(s.lineHeight, `${s.name}.lineHeight`);
  }
}
for (const k of Object.keys(sizes)) if (!(k in dSizes)) fail(`type style ${k} has no ${k}-desktop`);

// ── spacing, radii, shadows, web layout ────────────────────────────────────
const fromFamily = (family, prefix, map = (v, n) => px(v, n)) => {
  const out = {};
  for (const t of tokens[family]?.tokens ?? []) {
    if (!t.name.startsWith(prefix)) continue;
    out[camel(t.name.slice(prefix.length))] = map(t.value, t.name);
  }
  return out;
};
const spacing = fromFamily("spacing", "space-");
const radii = fromFamily("radius", "radius-");
const webLayout = fromFamily("layout", "web-");

function parseShadow(value, name) {
  const v = typeof value === "string" ? value : value[firstTheme];
  const m = /^\s*(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+([\d.]+)(?:px)?\s+rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)\s*$/i.exec(v);
  if (!m) fail(`shadow ${name} must be "x y blur rgba(r, g, b, a)", got ${v}`);
  const hex = "#" + [m[4], m[5], m[6]].map((c) => Number(c).toString(16).padStart(2, "0")).join("").toUpperCase();
  return { offsetX: +m[1], offsetY: +m[2], blur: +m[3], color: hex, opacity: +m[7] };
}
const shadows = fromFamily("shadow", "shadow-", parseShadow);

for (const k of ["bpLaptop", "pageMax", "sidebarWidth", "formMax"])
  if (!(k in webLayout)) fail(`missing layout token web-${k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}`);

// ── write ──────────────────────────────────────────────────────────────────
const lit = (o) => JSON.stringify(o, null, 2);
const meta = tokens.meta ?? {};
const out = `// GENERATED by scripts/design-sync.mjs from design-system/tokens.json — do not edit.
// Change values in the Warsh design system, copy its tokens.json here, then run
// \`npm run design-sync\`.
// Design system: ${tokens.name ?? "Warsh"} · tokens synced ${meta.synced ?? "unknown"}

export const PaletteTokens = ${lit(palette)} as const;

export const TajweedTokens = ${lit(tajweed)} as const;

export const MushafTokens = ${lit(mushaf)} as const;

export const AlphaTokens = ${lit(alpha)} as const;

export const ColorRoleTokens = ${lit(roles)} as const;

export const FontSizeTokens = ${lit(sizes)} as const;

export const LineHeightTokens = ${lit(lines)} as const;

/** Laptop web (1024px and up) type scale. */
export const DesktopFontSizeTokens = ${lit(dSizes)} as const;

export const DesktopLineHeightTokens = ${lit(dLines)} as const;

export const SpacingTokens = ${lit(spacing)} as const;

export const RadiusTokens = ${lit(radii)} as const;

export const ShadowTokens = ${lit(shadows)} as const;

/** Web only: breakpoints, shell widths, content caps, gutters and grid columns. */
export const WebLayoutTokens = ${lit(webLayout)} as const;
`;

if (check) {
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (current !== out) fail("constants/tokens.generated.ts is out of date. Run `npm run design-sync`.");
  console.log("design-sync: up to date");
} else {
  writeFileSync(OUT, out);
  console.log(
    `design-sync: wrote constants/tokens.generated.ts (${Object.keys(palette).length} palette, ${Object.keys(alpha).length} alpha, ${Object.keys(sizes).length} type styles, ${Object.keys(webLayout).length} web layout)`,
  );
}
