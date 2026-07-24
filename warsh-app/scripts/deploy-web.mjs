#!/usr/bin/env node
// Build the Expo web export against PRODUCTION and deploy it to Vercel.
//
// Why this script exists: the production API URL must be baked into the web
// bundle at build time. Two footguns made a bad build ship once:
//   1. warsh-app/.env points EXPO_PUBLIC_API_URL at localhost (for device dev),
//      so a plain `expo export` bakes localhost into production.
//   2. Metro caches the inlined EXPO_PUBLIC_* values, so changing the env
//      without clearing the cache silently reuses the old (localhost) value.
// This script forces the same-origin web API URL into .env for the build,
// ALWAYS clears the Metro cache, verifies no localhost URL leaked into the
// bundle, relocates dependency assets out of the node_modules path that Vercel
// ignores, routes the original generated URLs to that deployable path, writes
// the API proxy before the SPA fallback, deploys, and restores .env — even if
// something fails. Mobile builds continue to call https://api.warsh.app
// directly through eas.json.

import { execSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
  readdirSync,
  statSync,
  mkdirSync,
  renameSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(appDir);

const API_URL = process.env.DEPLOY_API_URL || "https://app.warsh.app";
const BACKEND_URL = process.env.DEPLOY_BACKEND_URL || "https://api.warsh.app";
const SCOPE = process.env.VERCEL_SCOPE || "team_k0ZT1T5c1VYXVbf8oyV9zU4s";
// The Vercel project that owns https://app.warsh.app. Without an explicit link,
// `vercel deploy dist` auto-creates a throwaway project named after the folder
// ("dist") and app.warsh.app is never updated. Always link dist to warsh-web.
const PROJECT_ID = process.env.VERCEL_PROJECT_ID || "prj_grtdsJ12m4QcjcdZsSl7fAdhspuR";
const ENV_PATH = ".env";

const originalEnv = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";

// Keep every line of the existing .env except the two we must force for prod.
const keptLines = originalEnv
  .split(/\r?\n/)
  .filter(
    (line) =>
      !/^\s*EXPO_PUBLIC_API_URL\s*=/.test(line) &&
      !/^\s*EXPO_PUBLIC_ENVIRONMENT\s*=/.test(line),
  )
  .join("\n");
const prodEnv = `EXPO_PUBLIC_API_URL=${API_URL}\nEXPO_PUBLIC_ENVIRONMENT=production\n${keptLines}\n`;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function assertNoLocalhostInBundle() {
  const jsDir = "dist/_expo/static/js";
  if (!existsSync(jsDir)) throw new Error("Build output missing — dist/_expo/static/js not found.");
  const offenders = walk(jsDir).filter((f) => {
    if (!f.endsWith(".js")) return false;
    const src = readFileSync(f, "utf8");
    return src.includes("127.0.0.1:3000") || src.includes("localhost:3000");
  });
  if (offenders.length > 0) {
    throw new Error(
      `Refusing to deploy: a localhost API URL leaked into the bundle (${offenders.length} file(s)). ` +
        `The Metro cache may not have cleared.`,
    );
  }
}

function prepareDependencyAssetsForVercel() {
  const generatedDir = "dist/assets/node_modules";
  const deployableDir = "dist/assets/vendor";

  if (!existsSync(generatedDir)) {
    throw new Error(
      "Build output missing — dist/assets/node_modules not found. " +
        "Expo may have changed its web asset layout.",
    );
  }

  renameSync(generatedDir, deployableDir);

  const outputFiles = walk("dist");
  const stalePaths = outputFiles.filter((file) =>
    file.replaceAll("\\", "/").includes("/node_modules/"),
  );
  const deployedDependencyFiles = walk(deployableDir);
  const hasFeather = deployedDependencyFiles.some((file) => /[/\\]Feather\.[a-f0-9]+\.ttf$/i.test(file));
  const hasIonicons = deployedDependencyFiles.some((file) => /[/\\]Ionicons\.[a-f0-9]+\.ttf$/i.test(file));

  if (stalePaths.length > 0) {
    throw new Error(
      "Refusing to deploy: Expo dependency assets were not fully relocated out of node_modules.",
    );
  }

  if (!hasFeather || !hasIonicons) {
    throw new Error("Refusing to deploy: required Feather or Ionicons font asset is missing.");
  }

  console.log(
    `[deploy:web] relocated ${deployedDependencyFiles.length} dependency assets to /assets/vendor`,
  );
}

try {
  console.log(`[deploy:web] building web bundle against ${API_URL}`);
  writeFileSync(ENV_PATH, prodEnv);
  rmSync("dist", { recursive: true, force: true });

  // --clear is REQUIRED (see header note about the Metro cache footgun).
  execSync("npx expo export --platform web --clear", { stdio: "inherit" });

  assertNoLocalhostInBundle();
  prepareDependencyAssetsForVercel();

  // Do not mutate Expo's hashed JS bundle to change the generated asset URLs:
  // cached copies would keep the same hash but stale content. Route the stable
  // generated URL to the relocated files on the server instead. Both this rule
  // and the API proxy must precede the SPA fallback.
  writeFileSync(
    "dist/vercel.json",
    JSON.stringify(
      {
        rewrites: [
          { source: "/assets/node_modules/:path*", destination: "/assets/vendor/:path*" },
          { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
          { source: "/(.*)", destination: "/index.html" },
        ],
      },
      null,
      2,
    ) + "\n",
  );

  // Link the export to the warsh-web project so this deploy lands on
  // app.warsh.app instead of a folder-named throwaway project.
  mkdirSync("dist/.vercel", { recursive: true });
  writeFileSync(
    "dist/.vercel/project.json",
    JSON.stringify({ projectId: PROJECT_ID, orgId: SCOPE, projectName: "warsh-web" }) + "\n",
  );

  console.log("[deploy:web] deploying to Vercel (production, project warsh-web)…");
  execSync(`npx vercel deploy dist --prod --yes --archive=tgz --scope ${SCOPE}`, { stdio: "inherit" });

  console.log("[deploy:web] done — live at https://app.warsh.app");
} finally {
  writeFileSync(ENV_PATH, originalEnv);
  console.log("[deploy:web] restored .env");
}
