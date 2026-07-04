/**
 * Bulk-compress image assets before upload.
 *
 * Usage:
 *   node scripts/compress-images.cjs --input ./exports/image-tests --output ./exports/image-tests-compressed --target 100kb
 *
 * Notes:
 * - Originals are never modified unless --overwrite is passed.
 * - PNG output can be hard to force under 100 KB for detailed artwork. The script
 *   progressively lowers palette size and dimensions until the target is met or
 *   the configured minimum width is reached.
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

const DEFAULTS = {
  targetBytes: 100 * 1024,
  maxWidth: 1200,
  minWidth: 320,
  concurrency: 3,
  format: "png",
  overwrite: false,
};

function parseArgs(argv) {
  const args = { ...DEFAULTS };

  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    const next = argv[i + 1];

    if (token === "--input" || token === "-i") {
      args.input = next;
      i++;
    } else if (token === "--output" || token === "-o") {
      args.output = next;
      i++;
    } else if (token === "--target" || token === "-t") {
      args.targetBytes = parseSize(next);
      i++;
    } else if (token === "--max-width") {
      args.maxWidth = Number(next);
      i++;
    } else if (token === "--min-width") {
      args.minWidth = Number(next);
      i++;
    } else if (token === "--format") {
      args.format = String(next || "").toLowerCase();
      i++;
    } else if (token === "--concurrency") {
      args.concurrency = Number(next);
      i++;
    } else if (token === "--include") {
      args.include = next;
      i++;
    } else if (token === "--overwrite") {
      args.overwrite = true;
    } else if (token === "--help" || token === "-h") {
      printHelp();
      process.exit(0);
    } else {
      fail(`Unknown argument: ${token}`);
    }
  }

  if (!args.input) fail("Missing --input <folder>.");
  if (!args.output && !args.overwrite) fail("Missing --output <folder>. Use --overwrite only if you really want to replace files.");
  if (!["png", "webp", "jpeg", "jpg"].includes(args.format)) fail("--format must be png, webp, or jpeg.");
  if (!Number.isFinite(args.maxWidth) || args.maxWidth < 1) fail("--max-width must be a positive number.");
  if (!Number.isFinite(args.minWidth) || args.minWidth < 1) fail("--min-width must be a positive number.");
  if (!Number.isFinite(args.concurrency) || args.concurrency < 1) fail("--concurrency must be a positive number.");
  if (args.minWidth > args.maxWidth) fail("--min-width cannot be greater than --max-width.");

  args.input = path.resolve(args.input);
  args.output = args.overwrite ? args.input : path.resolve(args.output);
  args.format = args.format === "jpg" ? "jpeg" : args.format;

  return args;
}

function parseSize(value) {
  const match = String(value || "").trim().toLowerCase().match(/^(\d+(?:\.\d+)?)(b|kb|mb)?$/);
  if (!match) fail(`Invalid size: ${value}`);

  const amount = Number(match[1]);
  const unit = match[2] || "b";
  if (unit === "mb") return Math.round(amount * 1024 * 1024);
  if (unit === "kb") return Math.round(amount * 1024);
  return Math.round(amount);
}

function printHelp() {
  console.log(`
Bulk image compressor

Usage:
  node scripts/compress-images.cjs --input <folder> --output <folder> [options]

Options:
  -i, --input <folder>     Source folder. Scanned recursively.
  -o, --output <folder>    Output folder. Originals are preserved.
  -t, --target <size>      Target size per image. Default: 100kb.
      --format <format>    png, webp, or jpeg. Default: png.
      --max-width <px>     Resize down if wider than this. Default: 1200.
      --min-width <px>     Stop resizing once this width is reached. Default: 320.
      --concurrency <n>    Number of images to process at once. Default: 3.
      --include <text>     Only process files whose names include this text.
      --overwrite          Replace files in place. Use with care.
`);
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function walkImages(dir, include) {
  const results = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkImages(fullPath, include));
    } else if (
      IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) &&
      (!include || entry.name.includes(include))
    ) {
      results.push(fullPath);
    }
  }

  return results;
}

function outputPathFor(inputFile, args) {
  if (args.overwrite) return inputFile;

  const relative = path.relative(args.input, inputFile);
  const parsed = path.parse(relative);
  const extension = args.format === "jpeg" ? ".jpg" : `.${args.format}`;
  return path.join(args.output, parsed.dir, `${parsed.name}${extension}`);
}

async function encode(inputFile, format, width, effort) {
  let pipeline = sharp(inputFile, { animated: false, limitInputPixels: false }).rotate();

  if (width) {
    pipeline = pipeline.resize({ width, withoutEnlargement: true });
  }

  if (format === "png") {
    pipeline = pipeline.png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      palette: true,
      colors: effort.colors,
      effort: 7,
      quality: effort.quality,
    });
  } else if (format === "webp") {
    pipeline = pipeline.webp({
      quality: effort.quality,
      effort: 6,
      smartSubsample: true,
    });
  } else {
    pipeline = pipeline.jpeg({
      quality: effort.quality,
      mozjpeg: true,
      progressive: true,
    });
  }

  return pipeline.toBuffer({ resolveWithObject: true });
}

async function compressOne(inputFile, args) {
  const originalBytes = fs.statSync(inputFile).size;
  const metadata = await sharp(inputFile, { limitInputPixels: false }).metadata();
  const originalWidth = metadata.width || args.maxWidth;
  let width = Math.min(originalWidth, args.maxWidth);

  const efforts = [
    { quality: 65, colors: 128 },
    { quality: 45, colors: 64 },
  ];

  let best = null;

  while (width >= args.minWidth) {
    for (const effort of efforts) {
      const result = await encode(inputFile, args.format, width, effort);
      const candidate = {
        buffer: result.data,
        bytes: result.data.length,
        width: result.info.width,
        height: result.info.height,
        quality: effort.quality,
        colors: effort.colors,
      };

      if (!best || candidate.bytes < best.bytes) {
        best = candidate;
      }

      if (candidate.bytes <= args.targetBytes) {
        return { ...candidate, originalBytes, hitTarget: true };
      }
    }

    width = Math.floor(width * 0.78);
  }

  return { ...best, originalBytes, hitTarget: best.bytes <= args.targetBytes };
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function main() {
  const args = parseArgs(process.argv);

  if (!fs.existsSync(args.input)) fail(`Input folder does not exist: ${args.input}`);

  const images = walkImages(args.input, args.include);
  if (!images.length) fail(`No images found in: ${args.input}`);

  fs.mkdirSync(args.output, { recursive: true });

  const report = [
    [
      "file",
      "original_kb",
      "output_kb",
      "saved_percent",
      "width",
      "height",
      "quality",
      "colors",
      "hit_target",
      "output",
    ],
  ];

  let hitTarget = 0;
  let totalOriginal = 0;
  let totalOutput = 0;

  console.log(`Compressing ${images.length} image(s) to ${args.format.toUpperCase()} target ${Math.round(args.targetBytes / 1024)} KB...\n`);

  let nextIndex = 0;

  async function worker() {
    while (nextIndex < images.length) {
      const inputFile = images[nextIndex];
      nextIndex++;
      await processImage(inputFile);
    }
  }

  async function processImage(inputFile) {
    const outputFile = outputPathFor(inputFile, args);
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });

    const result = await compressOne(inputFile, args);
    fs.writeFileSync(outputFile, result.buffer);

    totalOriginal += result.originalBytes;
    totalOutput += result.bytes;
    if (result.hitTarget) hitTarget++;

    const savedPercent = result.originalBytes > 0
      ? Math.round((1 - result.bytes / result.originalBytes) * 100)
      : 0;

    report.push([
      path.relative(args.input, inputFile),
      (result.originalBytes / 1024).toFixed(1),
      (result.bytes / 1024).toFixed(1),
      savedPercent,
      result.width,
      result.height,
      result.quality,
      args.format === "png" ? result.colors : "",
      result.hitTarget ? "yes" : "no",
      outputFile,
    ]);

    const status = result.hitTarget ? "OK" : "MIN";
    console.log(`[${status}] ${path.relative(args.input, inputFile)}: ${(result.originalBytes / 1024).toFixed(1)} KB -> ${(result.bytes / 1024).toFixed(1)} KB (${result.width}x${result.height})`);
  }

  const workers = Array.from(
    { length: Math.min(args.concurrency, images.length) },
    () => worker()
  );
  await Promise.all(workers);

  const reportPath = path.join(args.output, "compression-report.csv");
  fs.writeFileSync(
    reportPath,
    report.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n",
    "utf8"
  );

  console.log("\n" + "-".repeat(60));
  console.log(`Images processed: ${images.length}`);
  console.log(`Hit target:        ${hitTarget}/${images.length}`);
  console.log(`Original total:    ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Compressed total:  ${(totalOutput / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Report:            ${reportPath}`);
  console.log("-".repeat(60));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
