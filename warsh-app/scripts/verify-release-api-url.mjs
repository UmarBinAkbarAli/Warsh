// Verifies that a built AAB/APK actually points at a reachable production API.
//
// Expo bundles EXPO_PUBLIC_* from the shell first and falls back to
// warsh-app/.env, which targets the local dev backend. A release built without
// those vars exported bakes http://127.0.0.1:3000 into the shipped JS bundle;
// the app then fails every request on a real device with "Warsh could not reach
// the backend" while working fine on the emulator, where start-warsh.ps1 sets
// up `adb reverse`. That shipped to Play twice (Jul 26 and Aug 19 2026), so the
// artifact is checked here rather than trusted.
//
// Usage: node scripts/verify-release-api-url.mjs [path-to-aab-or-apk]

import { readFileSync, existsSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { resolve } from "node:path";

const EXPECTED_API_URL = "https://api.warsh.app";

// Any plaintext local address in the bundle, including machine-specific LAN IPs.
const LOCAL_URL_PATTERN =
  /http:\/\/(?:localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d{1,3}\.\d{1,3})(?::\d+)?/g;

// React Native and Expo inline their own dev-server defaults into every release
// bundle (Metro on 8081, Expo dev tools on 8969). Those are framework constants,
// not our API URL, so they are expected and must not fail the check.
const ALLOWED_LOCAL_URLS = new Set(["http://localhost:8081", "http://localhost:8969"]);

const DEFAULT_AAB = "android/app/build/outputs/bundle/release/app-release.aab";
const archivePath = resolve(process.cwd(), process.argv[2] ?? DEFAULT_AAB);

if (!existsSync(archivePath)) {
  console.error(`Archive not found: ${archivePath}`);
  process.exit(2);
}

/**
 * Minimal zip reader: locates one entry by name and returns its bytes.
 * The repo has no zip dependency and this runs on a 47MB AAB, so we walk the
 * central directory directly instead of shelling out to an external unzip.
 */
function readZipEntry(buffer, matchName) {
  const EOCD_SIG = 0x06054b50;
  const ZIP64_EOCD_LOCATOR_SIG = 0x07064b50;
  const ZIP64_EOCD_SIG = 0x06064b50;
  const CENTRAL_SIG = 0x02014b50;

  let eocd = -1;
  const scanStart = Math.max(0, buffer.length - 66_000);
  for (let i = buffer.length - 22; i >= scanStart; i -= 1) {
    if (buffer.readUInt32LE(i) === EOCD_SIG) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) throw new Error("Not a zip archive (no end-of-central-directory record).");

  let entryCount = buffer.readUInt16LE(eocd + 10);
  let centralOffset = buffer.readUInt32LE(eocd + 16);

  // Zip64 form, used once an archive exceeds the 16-bit/32-bit fields above.
  if (entryCount === 0xffff || centralOffset === 0xffffffff) {
    let locator = -1;
    for (let i = eocd - 20; i >= 0 && i >= eocd - 100; i -= 1) {
      if (buffer.readUInt32LE(i) === ZIP64_EOCD_LOCATOR_SIG) {
        locator = i;
        break;
      }
    }
    if (locator === -1) throw new Error("Zip64 archive missing its end-of-central-directory locator.");
    const zip64Offset = Number(buffer.readBigUInt64LE(locator + 8));
    if (buffer.readUInt32LE(zip64Offset) !== ZIP64_EOCD_SIG) {
      throw new Error("Zip64 end-of-central-directory record is malformed.");
    }
    entryCount = Number(buffer.readBigUInt64LE(zip64Offset + 32));
    centralOffset = Number(buffer.readBigUInt64LE(zip64Offset + 48));
  }

  let pointer = centralOffset;
  for (let i = 0; i < entryCount; i += 1) {
    if (buffer.readUInt32LE(pointer) !== CENTRAL_SIG) {
      throw new Error("Central directory entry is malformed.");
    }
    const compressionMethod = buffer.readUInt16LE(pointer + 10);
    const compressedSize = buffer.readUInt32LE(pointer + 20);
    const nameLength = buffer.readUInt16LE(pointer + 28);
    const extraLength = buffer.readUInt16LE(pointer + 30);
    const commentLength = buffer.readUInt16LE(pointer + 32);
    const localOffset = buffer.readUInt32LE(pointer + 42);
    const name = buffer.toString("utf8", pointer + 46, pointer + 46 + nameLength);

    if (matchName(name)) {
      // The local header repeats the name/extra with its own lengths.
      const localNameLength = buffer.readUInt16LE(localOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const raw = buffer.subarray(dataStart, dataStart + compressedSize);
      return {
        name,
        data: compressionMethod === 0 ? raw : inflateRawSync(raw),
      };
    }

    pointer += 46 + nameLength + extraLength + commentLength;
  }

  return null;
}

const archive = readFileSync(archivePath);
let entry;
try {
  // base/assets/... in an AAB, assets/... in an APK. Separators are normalised
  // because some zip writers store Windows-style backslashes.
  entry = readZipEntry(archive, (name) =>
    name.replace(/\\/g, "/").endsWith("assets/index.android.bundle"),
  );
} catch (error) {
  console.error(`Could not read ${archivePath}: ${error.message}`);
  process.exit(2);
}

if (!entry) {
  console.error(`No JS bundle (assets/index.android.bundle) found in: ${archivePath}`);
  process.exit(2);
}

const bundle = entry.data.toString("latin1");
const failures = [];

const unexpectedLocalUrls = new Set(
  (bundle.match(LOCAL_URL_PATTERN) ?? []).filter((url) => !ALLOWED_LOCAL_URLS.has(url)),
);
for (const url of unexpectedLocalUrls) {
  failures.push(`bundle contains a non-shippable local API URL: ${url}`);
}

if (!bundle.includes(EXPECTED_API_URL)) {
  failures.push(`bundle does not contain the production API URL: ${EXPECTED_API_URL}`);
}

if (failures.length > 0) {
  console.error("RELEASE API URL CHECK FAILED");
  console.error(`Archive: ${archivePath}`);
  console.error(`Entry:   ${entry.name}`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error("");
  console.error("Rebuild with the production values exported, e.g.:");
  console.error('  $env:EXPO_PUBLIC_API_URL = "https://api.warsh.app"');
  console.error('  $env:EXPO_PUBLIC_ENVIRONMENT = "production"');
  process.exit(1);
}

console.log("RELEASE API URL CHECK PASSED");
console.log(`Archive: ${archivePath}`);
console.log(`Entry:   ${entry.name}`);
console.log(`API URL: ${EXPECTED_API_URL}`);
