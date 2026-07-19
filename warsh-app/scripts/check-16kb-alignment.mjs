#!/usr/bin/env node

/**
 * Verify that every 64-bit native library ships 16 KB-compatible ELF LOAD
 * alignment. This script uses only Node.js built-ins so the npm command works
 * in PowerShell, macOS/Linux shells, and CI without Bash, unzip, or readelf.
 *
 * Usage:
 *   node scripts/check-16kb-alignment.mjs [path-to-.aab-or-.apk]
 *   node scripts/check-16kb-alignment.mjs --merged
 *
 * The default input is the release AAB. The --merged mode checks Gradle's
 * pre-bundle merged native libraries without requiring signing or Sentry
 * credentials. Only arm64-v8a and x86_64 are release-gating ABIs; 32-bit ABIs
 * are counted but do not fail the check.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(SCRIPT_DIR, "..");
const DEFAULT_AAB = path.join(
  APP_DIR,
  "android",
  "app",
  "build",
  "outputs",
  "bundle",
  "release",
  "app-release.aab",
);
const MERGED_DIR = path.join(
  APP_DIR,
  "android",
  "app",
  "build",
  "intermediates",
  "merged_native_libs",
  "release",
  "mergeReleaseNativeLibs",
  "out",
  "lib",
);
const ENFORCED_ABIS = new Set(["arm64-v8a", "x86_64"]);
const KNOWN_ABIS = new Set([
  "armeabi-v7a",
  "arm64-v8a",
  "x86",
  "x86_64",
]);
const MIN_ALIGNMENT = 0x4000n;

function usageError(message) {
  console.error(`ERROR: ${message}`);
  console.error(
    "Usage: node scripts/check-16kb-alignment.mjs [path-to-.aab-or-.apk | --merged]",
  );
  process.exit(2);
}

function getAbi(filePath) {
  return filePath
    .replaceAll("\\", "/")
    .split("/")
    .find((part) => KNOWN_ABIS.has(part));
}

function makeReaders(buffer, littleEndian) {
  return {
    u16(offset) {
      return littleEndian
        ? buffer.readUInt16LE(offset)
        : buffer.readUInt16BE(offset);
    },
    u32(offset) {
      return littleEndian
        ? buffer.readUInt32LE(offset)
        : buffer.readUInt32BE(offset);
    },
    u64(offset) {
      return littleEndian
        ? buffer.readBigUInt64LE(offset)
        : buffer.readBigUInt64BE(offset);
    },
  };
}

function getLoadAlignments(buffer, fileName) {
  if (
    buffer.length < 64 ||
    buffer[0] !== 0x7f ||
    buffer.toString("ascii", 1, 4) !== "ELF"
  ) {
    throw new Error(`${fileName}: not a valid ELF file`);
  }

  const elfClass = buffer[4];
  const byteOrder = buffer[5];
  if (![1, 2].includes(elfClass) || ![1, 2].includes(byteOrder)) {
    throw new Error(`${fileName}: unsupported ELF class or byte order`);
  }

  const readers = makeReaders(buffer, byteOrder === 1);
  const is64Bit = elfClass === 2;
  const programHeaderOffset = is64Bit
    ? Number(readers.u64(32))
    : readers.u32(28);
  const programHeaderEntrySize = readers.u16(is64Bit ? 54 : 42);
  const programHeaderCount = readers.u16(is64Bit ? 56 : 44);

  if (
    !Number.isSafeInteger(programHeaderOffset) ||
    programHeaderEntrySize === 0 ||
    programHeaderOffset + programHeaderEntrySize * programHeaderCount >
      buffer.length
  ) {
    throw new Error(`${fileName}: invalid ELF program-header table`);
  }

  const alignments = [];
  for (let index = 0; index < programHeaderCount; index += 1) {
    const entryOffset = programHeaderOffset + index * programHeaderEntrySize;
    if (readers.u32(entryOffset) !== 1) continue; // PT_LOAD
    alignments.push(
      is64Bit
        ? readers.u64(entryOffset + 48)
        : BigInt(readers.u32(entryOffset + 28)),
    );
  }

  if (alignments.length === 0) {
    throw new Error(`${fileName}: ELF file contains no LOAD segments`);
  }
  return alignments;
}

async function walkSharedLibraries(root) {
  const libraries = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(entryPath);
      else if (entry.isFile() && entry.name.endsWith(".so")) {
        libraries.push({
          name: path.relative(root, entryPath),
          data: await readFile(entryPath),
        });
      }
    }
  }
  await walk(root);
  return libraries;
}

function findEndOfCentralDirectory(archive) {
  const minimumOffset = Math.max(0, archive.length - 65_557);
  for (let offset = archive.length - 22; offset >= minimumOffset; offset -= 1) {
    if (archive.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error("ZIP end-of-central-directory record not found");
}

function readArchiveSharedLibraries(archive, archiveName) {
  const endOffset = findEndOfCentralDirectory(archive);
  const entryCount = archive.readUInt16LE(endOffset + 10);
  let centralOffset = archive.readUInt32LE(endOffset + 16);
  const libraries = [];

  if (entryCount === 0xffff || centralOffset === 0xffffffff) {
    throw new Error(`${archiveName}: ZIP64 archives are not supported`);
  }

  for (let index = 0; index < entryCount; index += 1) {
    if (archive.readUInt32LE(centralOffset) !== 0x02014b50) {
      throw new Error(`${archiveName}: invalid ZIP central-directory entry`);
    }

    const compressionMethod = archive.readUInt16LE(centralOffset + 10);
    const compressedSize = archive.readUInt32LE(centralOffset + 20);
    const uncompressedSize = archive.readUInt32LE(centralOffset + 24);
    const fileNameLength = archive.readUInt16LE(centralOffset + 28);
    const extraLength = archive.readUInt16LE(centralOffset + 30);
    const commentLength = archive.readUInt16LE(centralOffset + 32);
    const localHeaderOffset = archive.readUInt32LE(centralOffset + 42);
    const fileName = archive.toString(
      "utf8",
      centralOffset + 46,
      centralOffset + 46 + fileNameLength,
    );

    if (fileName.endsWith(".so")) {
      if (
        compressedSize === 0xffffffff ||
        uncompressedSize === 0xffffffff ||
        localHeaderOffset === 0xffffffff
      ) {
        throw new Error(`${fileName}: ZIP64 entry is not supported`);
      }
      if (archive.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
        throw new Error(`${fileName}: invalid ZIP local-file header`);
      }

      const localNameLength = archive.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = archive.readUInt16LE(localHeaderOffset + 28);
      const dataOffset =
        localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressedData = archive.subarray(
        dataOffset,
        dataOffset + compressedSize,
      );
      let data;
      if (compressionMethod === 0) data = Buffer.from(compressedData);
      else if (compressionMethod === 8) data = inflateRawSync(compressedData);
      else {
        throw new Error(
          `${fileName}: unsupported ZIP compression method ${compressionMethod}`,
        );
      }
      if (data.length !== uncompressedSize) {
        throw new Error(`${fileName}: extracted size does not match ZIP metadata`);
      }
      libraries.push({ name: fileName, data });
    }

    centralOffset += 46 + fileNameLength + extraLength + commentLength;
  }

  return libraries;
}

async function loadInput(argument) {
  if (argument === "--merged") {
    try {
      return {
        description: "merged native libraries (pre-bundle)",
        libraries: await walkSharedLibraries(MERGED_DIR),
      };
    } catch (error) {
      if (error?.code === "ENOENT") {
        usageError(
          `${MERGED_DIR} not found. Run: cd android; ./gradlew :app:mergeReleaseNativeLibs`,
        );
      }
      throw error;
    }
  }

  const archivePath = path.resolve(argument || DEFAULT_AAB);
  let archive;
  try {
    archive = await readFile(archivePath);
  } catch (error) {
    if (error?.code === "ENOENT") {
      usageError(
        `archive not found: ${archivePath}. Build it or use --merged.`,
      );
    }
    throw error;
  }
  return {
    description: archivePath,
    libraries: readArchiveSharedLibraries(archive, archivePath),
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1) usageError("expected at most one argument");

  const { description, libraries } = await loadInput(args[0]);
  if (libraries.length === 0) usageError("no native libraries were found");

  console.log(`Scanning: ${description}`);
  console.log("Requiring >= 0x4000 on: arm64-v8a x86_64");
  console.log();

  let failures = 0;
  let warnings = 0;
  const abiCounts = new Map();

  for (const library of libraries) {
    const abi = getAbi(library.name);
    if (!abi) {
      warnings += 1;
      console.warn(`WARN  unknown ABI  ${library.name}`);
      continue;
    }
    abiCounts.set(abi, (abiCounts.get(abi) || 0) + 1);

    let alignments;
    try {
      alignments = getLoadAlignments(library.data, library.name);
    } catch (error) {
      if (ENFORCED_ABIS.has(abi)) {
        failures += 1;
        console.error(`FAIL  unreadable   ${abi}/${path.basename(library.name)}`);
        console.error(`      ${error.message}`);
      } else {
        warnings += 1;
        console.warn(`WARN  unreadable   ${abi}/${path.basename(library.name)}`);
      }
      continue;
    }

    const minimum = alignments.reduce((left, right) =>
      left < right ? left : right,
    );
    if (ENFORCED_ABIS.has(abi) && minimum < MIN_ALIGNMENT) {
      failures += 1;
      console.error(
        `FAIL  0x${minimum.toString(16).padEnd(10)} ${abi}/${path.basename(library.name)}`,
      );
    }
  }

  console.log("--------------------------------------------------------");
  console.log(`Scanned ${libraries.length} libraries across all ABIs.`);
  console.log(
    `ABI counts: ${[...abiCounts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([abi, count]) => `${abi}=${count}`)
      .join(", ")}`,
  );
  if (warnings > 0) console.log(`Warnings: ${warnings}`);

  if (failures > 0) {
    console.error(
      `FAIL: ${failures} enforced 64-bit library check(s) failed.`,
    );
    process.exit(1);
  }
  console.log("PASS: every 64-bit library is 16 KB compatible.");
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(2);
});
