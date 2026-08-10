import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { catalogAudioKey, normalizeCatalogAudioText } from "../lib/audioCatalog";

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(fullPath);
    return entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") ? [fullPath] : [];
  });
}

test("catalogue keys normalize equivalent whitespace and Unicode", () => {
  assert.equal(normalizeCatalogAudioText("  هَذَا\n كِتَابٌ  "), "هَذَا كِتَابٌ");
  assert.equal(catalogAudioKey("هَذَا  كِتَابٌ"), catalogAudioKey("هَذَا\nكِتَابٌ"));
  assert.match(catalogAudioKey("هَذَا"), /^audio\/catalog\/v1\/[a-f0-9]{64}\.mp3$/);
});

test("production API routes cannot import the speech generator", () => {
  const apiRoot = path.join(process.cwd(), "app", "api");
  const offenders = sourceFiles(apiRoot).filter((file) => {
    const source = fs.readFileSync(file, "utf8");
    return source.includes("generateTtsMp3") || source.includes("lib/tts");
  });
  assert.deepEqual(offenders, []);
});
