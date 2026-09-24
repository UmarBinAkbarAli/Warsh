import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

// The results screen lists each question's topic. A topic that repeats one of
// its own options turns the topic into the answer, so name the idea instead.
test("no chapter-test topic repeats one of its question's options", () => {
  const dir = path.join(__dirname, "..", "prisma", "fixtures");
  const leaks: string[] = [];
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".json"))) {
    const assessment = JSON.parse(readFileSync(path.join(dir, file), "utf8")).assessment;
    for (const question of assessment?.questions ?? []) {
      for (const language of ["en", "ur"] as const) {
        const topic = question.topic?.[language]?.trim().toLowerCase();
        if (!topic) continue;
        const hit = question.options.some((option: Record<string, string | undefined>) =>
          option[language]?.trim().toLowerCase() === topic || option.arabic?.trim() === topic);
        if (hit) leaks.push(`${file} ${question.id} ${language}`);
      }
    }
  }
  assert.deepEqual(leaks, []);
});
