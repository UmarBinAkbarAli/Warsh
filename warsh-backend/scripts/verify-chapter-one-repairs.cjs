// Regression checks; --sync-local updates only the two repaired local fixtures.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const root = path.resolve(__dirname, '..');
const fixture = n => JSON.parse(fs.readFileSync(path.join(root, `prisma/fixtures/chapter-01-lesson-0${n}.json`), 'utf8'));
const third = fixture(3);
const fourth = fixture(4);
const matching = third.exercises.find(e => e.id === 'ch01-l03-ex07');
for (const [left, right] of matching.correct_pairs) {
  assert.equal(matching.left_column[left].en, matching.right_column[right].en);
}
assert.equal(fourth.discover_cards[0].concept.ur, 'وہ (مؤنث)');
assert.equal(fourth.discover_cards[1].concept.ur, 'وہ ایک مدرسہ ہے۔');
const player = fs.readFileSync(path.join(root, '../warsh-app/app/(app)/lessons/[lessonId]/play.tsx'), 'utf8');
assert.match(player, /router\.replace\(`\/chapter-test\/\$\{lessonId\}`\)/);
assert.match(player, /warsh_lesson_checkpoint_v2_\$\{userId\}_\$\{id\}/);
assert.equal((player.match(/lessonCheckpointKey\(userId, lessonId\)/g) || []).length, 3);
console.log('Chapter 1 fixture and routing/checkpoint source regressions passed.');

async function sync() {
  // Hardcoded isolated Docker target: cannot accept production environment URLs.
  const client = new Client({ connectionString: 'postgresql://postgres@127.0.0.1:55432/warsh_staging' });
  await client.connect();
  try {
    assert.equal((await client.query('SELECT current_database() AS db')).rows[0].db, 'warsh_staging');
    await client.query('BEGIN');
    for (const [id, content] of [['ch01-l03', third], ['ch01-l04', fourth]]) {
      const result = await client.query('UPDATE "Lesson" l SET content=$1::jsonb FROM "Chapter" c WHERE l.id=$2 AND l."chapterId"=c.id AND c."order"=1 RETURNING l.id', [JSON.stringify(content), id]);
      assert.equal(result.rowCount, 1);
      const readback = await client.query('SELECT content FROM "Lesson" WHERE id=$1', [id]);
      assert.deepEqual(readback.rows[0].content, content);
    }
    await client.query('COMMIT');
    console.log('Two lessons synced and read back in isolated local staging. User progress untouched.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
}
if (process.argv.includes('--sync-local')) sync().catch(error => { console.error(error.message); process.exitCode = 1; });
