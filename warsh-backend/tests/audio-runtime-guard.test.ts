import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { catalogAudioKey, normalizeCatalogAudioText } from "../lib/audioCatalog";
import { getR2PublicUrl } from "../lib/r2";

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

test("R2_PUBLIC_URL must be absolute before it can be redirected to", () => {
  const original = process.env.R2_PUBLIC_URL;
  try {
    // A bare host reads as correct in a dashboard field but is not a URL, and
    // NextResponse.redirect answered it with an unhandled "URL is malformed".
    process.env.R2_PUBLIC_URL = "pub-example.r2.dev";
    assert.throws(() => getR2PublicUrl("audio/catalog/v1/x.mp3"), /absolute http\(s\) URL/);

    process.env.R2_PUBLIC_URL = "";
    assert.throws(() => getR2PublicUrl("audio/catalog/v1/x.mp3"), /R2_PUBLIC_URL is not set/);

    process.env.R2_PUBLIC_URL = "https://cdn.example.com/";
    assert.equal(
      getR2PublicUrl("audio/catalog/v1/x.mp3"),
      "https://cdn.example.com/audio/catalog/v1/x.mp3",
    );
  } finally {
    if (original === undefined) delete process.env.R2_PUBLIC_URL;
    else process.env.R2_PUBLIC_URL = original;
  }
});
