import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { Question } from "../lib/core500Assessment";
import type { CoreExample } from "../lib/core500Examples";
import fs from "node:fs";
import path from "node:path";

test("Core 500 routes: auth, locks, resume, retry, concurrency, legacy compatibility and SRS preservation", { skip: !process.env.CORE500_TEST_DATABASE_URL }, async () => {
  const url = new URL(process.env.CORE500_TEST_DATABASE_URL!);
  assert.ok(["127.0.0.1", "localhost"].includes(url.hostname) && /core500.*test/.test(url.pathname), "Integration tests require a dedicated loopback Core 500 test database.");
  process.env.DATABASE_URL = url.toString();
  process.env.JWT_SECRET = "local-core500-integration-secret-not-for-deployment";
  const { prisma } = await import("../lib/prisma");
  const { signToken } = await import("../lib/auth");
  const assessment = await import("../app/api/core500/sets/[setNumber]/assessment/route");
  const legacy = await import("../app/api/core500/sets/[setNumber]/complete/route");
  const getSet = await import("../app/api/core500/sets/[setNumber]/route");
  const id = randomUUID();
  const users: string[] = []; const wordIds: string[] = [];
  const authRequest = (userId: string, body?: unknown) => new Request("http://localhost/api/core500", {
    method: body ? "POST" : "GET", headers: { Authorization: `Bearer ${signToken(userId)}`, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}),
  });
  async function post(userId: string, body: unknown, set = "1") {
    const response = await assessment.POST(authRequest(userId, body), { params: { setNumber: set } });
    return { status: response.status, body: await response.json() };
  }
  try {
    assert.equal(await prisma.vocabularyWord.count({ where: { quranicRank: { lte: 10 } } }), 0, "Use an empty dedicated test DB.");
    for (let rank = 1; rank <= 10; rank++) {
      const word = await prisma.vocabularyWord.create({ data: { arabic: `كلمة ${rank}`, arabicPlain: `test-${id}-${rank}`, transliteration: `test ${rank}`,
        translationEn: `meaning ${rank}`, translationUr: `معنی ${rank}`, wordType: "noun", topicCategories: [], status: "PUBLISHED", quranicRank: rank, coreSetNumber: rank <= 5 ? 1 : 2, frequencyInQuran: 100 } });
      wordIds.push(word.id);
    }
    for (let i = 0; i < 3; i++) users.push((await prisma.user.create({ data: { email: `core500-${id}-${i}@example.invalid`, passwordHash: "local-test", name: "Core test" } })).id);
    const user = users[0];
    const examples = JSON.parse(fs.readFileSync(path.join(__dirname, "../content/core500-ayah-examples.json"), "utf8")).words[0].examples as CoreExample[];
    await prisma.core500AyahExample.createMany({ data: examples.map((e, i) => ({ ...e, wordId: wordIds[0], position: i + 1, status: "DRAFT" as const })) });
    let setView = await (await getSet.GET(authRequest(user), { params: { setNumber: "1" } })).json();
    assert.equal(setView.data.assessmentSupported, true);
    assert.equal(setView.data.examplesReady, false);
    assert.equal(setView.data.words[0].ayahExamples.length, 0, "Draft examples must not reach learners.");
    await prisma.core500AyahExample.updateMany({ where: { wordId: wordIds[0], position: { lte: 2 } }, data: { status: "PUBLISHED" } });
    setView = await (await getSet.GET(authRequest(user), { params: { setNumber: "1" } })).json();
    assert.equal(setView.data.words[0].ayahExamples.length, 0, "A partial publication must not present fewer than three examples.");
    await prisma.core500AyahExample.updateMany({ where: { wordId: wordIds[0] }, data: { status: "PUBLISHED" } });
    setView = await (await getSet.GET(authRequest(user), { params: { setNumber: "1" } })).json();
    assert.equal(setView.data.words[0].ayahExamples.length, 3);
    assert.equal((await assessment.GET(new Request("http://localhost"), { params: { setNumber: "1" } })).status, 401);
    assert.equal((await post(user, { action: "start", language: "en" }, "2")).status, 403);
    assert.equal((await post(user, { action: "start", language: "en" }, "1junk")).status, 404);
    const duplicate = await legacy.POST(authRequest(users[2], { knownWordIds: Array(5).fill(wordIds[0]) }), { params: { setNumber: "1" } });
    assert.equal((await duplicate.json()).data.completed, false);
    assert.equal((await prisma.userCoreSetProgress.findUnique({ where: { userId_setNumber: { userId: users[2], setNumber: 1 } } }))!.completedAt, null);
    const nextReviewDate = new Date("2030-01-01T00:00:00Z");
    const original = await prisma.userVocabularyWord.create({ data: { userId: user, wordId: wordIds[0], repetitions: 6, intervalDays: 88, easeFactor: 2.9, isFavorite: true, nextReviewDate } });
    let view = (await post(user, { action: "start", language: "ur" })).body.data;
    assert.equal(view.language, "ur"); assert.equal("correctOptionId" in view.question, false);
    const row = await prisma.core500Assessment.findUniqueOrThrow({ where: { userId_setNumber: { userId: user, setNumber: 1 } } });
    const questions = row.questions as unknown as Question[];
    const other = (await post(users[1], { action: "start", language: "en" })).body.data;
    assert.equal((await post(users[1], { action: "answer", questionId: view.question.id, optionId: view.question.options[0].id, round: 1 })).status, 409);
    assert.equal(other.passedCount, 0);
    await prisma.vocabularyWord.update({ where: { id: wordIds[0] }, data: { translationUr: "changed after test start" } });
    for (let i = 0; i < 5; i++) {
      const q = questions.find(q => q.id === view.question.id)!;
      const optionId = i === 2 ? q.options.find(o => o.id !== q.correctOptionId)!.id : q.correctOptionId;
      view = (await post(user, { action: "answer", questionId: q.id, optionId, round: 1 })).body.data;
    }
    assert.equal(view.phase, "REVIEW"); assert.equal(view.passedCount, 4);
    assert.equal(await prisma.userVocabularyWord.count({ where: { userId: user } }), 1, "Partial test must not credit new words.");
    const resume = await assessment.GET(authRequest(user), { params: { setNumber: "1" } });
    assert.equal((await resume.json()).data.phase, "REVIEW");
    view = (await post(user, { action: "retry", round: 1 })).body.data;
    assert.equal(view.total, 1); assert.equal(view.round, 2);
    const q = questions.find(q => q.id === view.question.id)!;
    assert.equal((await post(user, { action: "answer", questionId: q.id, optionId: q.correctOptionId, round: 1 })).status, 409);
    const answers = await Promise.all([1, 2].map(() => post(user, { action: "answer", questionId: q.id, optionId: q.correctOptionId, round: 2 })));
    assert.ok(answers.every(a => a.status === 200 && a.body.data.completed));
    assert.equal(answers.filter(a => a.body.data.streakAdvanced).length, 1);
    assert.equal(await prisma.userVocabularyWord.count({ where: { userId: user } }), 5);
    const preserved = await prisma.userVocabularyWord.findUniqueOrThrow({ where: { userId_wordId: { userId: user, wordId: wordIds[0] } } });
    assert.deepEqual(preserved, original, "Test completion must preserve every existing SRS field and timestamp.");
    const progress = await prisma.userCoreSetProgress.findUniqueOrThrow({ where: { userId_setNumber: { userId: user, setNumber: 1 } } });
    await legacy.POST(authRequest(user, { knownWordIds: wordIds.slice(0, 5) }), { params: { setNumber: "1" } });
    assert.equal((await prisma.userCoreSetProgress.findUniqueOrThrow({ where: { id: progress.id } })).completedAt?.toISOString(), progress.completedAt?.toISOString());
    assert.equal((await prisma.streak.findUniqueOrThrow({ where: { userId: user } })).currentStreak, 1);
    assert.equal((await getSet.GET(authRequest(user), { params: { setNumber: "2" } })).status, 200);
    assert.equal((await post(user, { action: "start", language: "en" })).body.data.language, "ur", "Resume keeps the original test language and meanings.");
    view = (await post(user, { action: "start", language: "en", restart: true })).body.data;
    assert.equal(view.phase, "QUIZ"); assert.equal(view.passedCount, 0); assert.equal(view.round, 3);
    const practiceRow = await prisma.core500Assessment.findUniqueOrThrow({ where: { userId_setNumber: { userId: user, setNumber: 1 } } });
    const practice = practiceRow.questions as unknown as Question[];
    while (view.question) {
      const question = practice.find(q => q.id === view.question.id)!;
      view = (await post(user, { action: "answer", questionId: question.id, optionId: question.correctOptionId, round: 3 })).body.data;
    }
    assert.equal(view.completed, true); assert.equal(view.streakAdvanced, false);
    assert.equal((await prisma.userCoreSetProgress.findUniqueOrThrow({ where: { id: progress.id } })).completedAt?.toISOString(), progress.completedAt?.toISOString());
    assert.deepEqual(await prisma.userVocabularyWord.findUniqueOrThrow({ where: { id: original.id } }), original);
  } finally {
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    await prisma.vocabularyWord.deleteMany({ where: { id: { in: wordIds } } });
    await prisma.$disconnect();
  }
});
