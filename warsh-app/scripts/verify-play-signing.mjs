import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const EXPECTED_PLAY_UPLOAD_SHA1 =
  "08:6F:39:0B:23:73:0A:32:24:56:BB:FC:49:CE:F2:F7:5E:CE:D2:6B";
const DEFAULT_AAB = "android/app/build/outputs/bundle/release/app-release.aab";
const requestedPath = process.argv[2] ?? DEFAULT_AAB;
const aabPath = resolve(process.cwd(), requestedPath);

if (!existsSync(aabPath)) {
  console.error(`AAB not found: ${aabPath}`);
  process.exit(2);
}

const keytool = process.platform === "win32" ? "keytool.exe" : "keytool";
const result = spawnSync(keytool, ["-printcert", "-jarfile", aabPath], {
  encoding: "utf8",
});

if (result.error) {
  console.error(`Unable to run keytool: ${result.error.message}`);
  process.exit(2);
}

if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(result.status ?? 2);
}

const certificateOutput = `${result.stdout}\n${result.stderr}`;
const fingerprintMatch = certificateOutput.match(
  /SHA1:\s*([0-9A-F]{2}(?::[0-9A-F]{2}){19})/i,
);

if (!fingerprintMatch) {
  console.error(`Could not read the signing certificate from: ${aabPath}`);
  process.exit(2);
}

const actualSha1 = fingerprintMatch[1].toUpperCase();

if (actualSha1 !== EXPECTED_PLAY_UPLOAD_SHA1) {
  console.error("PLAY SIGNING CHECK FAILED");
  console.error(`Expected: ${EXPECTED_PLAY_UPLOAD_SHA1}`);
  console.error(`Actual:   ${actualSha1}`);
  console.error("Do not upload this AAB to Google Play.");
  process.exit(1);
}

console.log("PLAY SIGNING CHECK PASSED");
console.log(`AAB:  ${aabPath}`);
console.log(`SHA1: ${actualSha1}`);
