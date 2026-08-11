#!/usr/bin/env node

import { execSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(appDir);

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const environment = process.env.EXPO_PUBLIC_ENVIRONMENT?.trim();

if (!apiUrl || !/^https:\/\//i.test(apiUrl)) {
  throw new Error("EXPO_PUBLIC_API_URL must be set to the HTTPS web deployment origin.");
}

if (environment !== "production") {
  throw new Error("EXPO_PUBLIC_ENVIRONMENT must be set to production.");
}

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) files.push(...walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function assertNoLocalApiInBundle() {
  const javascriptDirectory = "dist/_expo/static/js";
  if (!existsSync(javascriptDirectory)) {
    throw new Error("Build output missing: dist/_expo/static/js was not generated.");
  }

  const offenders = walk(javascriptDirectory).filter((file) => {
    if (!file.endsWith(".js")) return false;
    const source = readFileSync(file, "utf8");
    return source.includes("127.0.0.1:3000") || source.includes("localhost:3000");
  });

  if (offenders.length > 0) {
    throw new Error(`A local API URL leaked into ${offenders.length} web bundle file(s).`);
  }
}

function relocateDependencyAssets() {
  const generatedDirectory = "dist/assets/node_modules";
  const deployableDirectory = "dist/assets/vendor";

  if (!existsSync(generatedDirectory)) {
    throw new Error("Build output missing: dist/assets/node_modules was not generated.");
  }

  rmSync(deployableDirectory, { recursive: true, force: true });
  renameSync(generatedDirectory, deployableDirectory);

  const deployedAssets = walk(deployableDirectory);
  const hasFeather = deployedAssets.some((file) => /[/\\]Feather\.[a-f0-9]+\.ttf$/i.test(file));
  const hasIonicons = deployedAssets.some((file) => /[/\\]Ionicons\.[a-f0-9]+\.ttf$/i.test(file));

  if (!hasFeather || !hasIonicons) {
    throw new Error("Required Feather or Ionicons font asset is missing from the web export.");
  }

  console.log(`[build:web] relocated ${deployedAssets.length} dependency assets`);
}

console.log(`[build:web] exporting production web bundle for ${apiUrl}`);
rmSync("dist", { recursive: true, force: true });
execSync("npx expo export --platform web --clear", { stdio: "inherit" });
assertNoLocalApiInBundle();
relocateDependencyAssets();
console.log("[build:web] web export verified");
