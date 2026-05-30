/**
 * Patch: replace all empty translit strings with "—" in fixture files.
 */
const fs = require("node:fs");
const path = require("node:path");

const fixturesDir = path.join(__dirname, "fixtures");

function patchTranslit(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(patchTranslit);
  } else if (obj !== null && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (key === "translit" && obj[key] === "") {
        obj[key] = "—";
      } else {
        patchTranslit(obj[key]);
      }
    }
  }
}

const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith(".json")).sort();
for (const fileName of files) {
  const filePath = path.join(fixturesDir, fileName);
  const lesson = JSON.parse(fs.readFileSync(filePath, "utf8"));
  patchTranslit(lesson);
  fs.writeFileSync(filePath, JSON.stringify(lesson, null, 2), "utf8");
  console.log(`Patched: ${fileName}`);
}

console.log("Done.");
