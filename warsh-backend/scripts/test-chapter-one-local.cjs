// Isolated local API integration test. Creates a fresh QA account; never uses learner accounts.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { Client } = require('pg');
const base = 'http://127.0.0.1:3000';
async function main() {
  const db = new Client({connectionString:'postgresql://postgres@127.0.0.1:55432/warsh_staging'});
  await db.connect();
  try {
    const email = `chapter1.qa.${randomUUID()}@warsh.local`;
    const reg = await fetch(base+'/api/auth/register', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:randomUUID(),name:'Chapter 1 isolated QA',nativeLanguage:'ur',translationLanguage:'ur',goal:'QURAN'})});
    assert.equal(reg.status,201);
    const session=(await reg.json()).data;
    assert.equal((await db.query('SELECT id FROM "User" WHERE id=$1',[session.user.id])).rowCount,1,'API must use isolated staging');
    const request=async(route,body,status=200)=>{
      const res=await fetch(base+route,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
      const json=await res.json();
      assert.equal(res.status,status,JSON.stringify(json));
      return json.data || json;
    };
    await request('/api/lessons/ch01-test',null,403);
    console.log('PASS: test locked before lessons completed');
    for(let n=1;n<=4;n++) {
      const id=`ch01-l0${n}`;
      const {lesson}=await request('/api/lessons/'+id);
      const result=await request(`/api/lessons/${id}/complete`,{exerciseResults:lesson.content.exercises.map(()=>true)});
      assert.notEqual(result.passed,false);
    }
    const {lesson}=await request('/api/lessons/ch01-test');
    assert.equal(lesson.isChapterTest,true);
    const questions=lesson.content.assessment.questions;
    assert.equal(questions.length,12);
    const source=(await db.query('SELECT content FROM "Lesson" WHERE id=$1',['ch01-test'])).rows[0].content.assessment.questions;
    const answers=source.map(q=>({questionId:q.id,selectedIndex:q.correct_index}));
    await request('/api/lessons/ch01-test/complete',{assessmentAnswers:answers.slice(1)},400);
    const wrong=source.map(q=>({questionId:q.id,selectedIndex:(q.correct_index+1)%q.options.length}));
    const fail=await request('/api/lessons/ch01-test/complete',{assessmentAnswers:wrong});
    assert.equal(fail.passed,false); assert.equal(fail.correctCount,0);
    console.log('PASS: 12 questions accessible; incomplete answers rejected; wrong answers fail');
    const pass=await request('/api/lessons/ch01-test/complete',{assessmentAnswers:answers});
    assert.equal(pass.passed,true); assert.equal(pass.correctCount,12); assert.equal(pass.chapterJustCompleted,true);
    const chapters=(await request('/api/chapters')).chapters;
    assert.equal(chapters.find(c=>c.order===1).isCompleted,true);
    const progress=await request('/api/progress');
    assert.equal(progress.completedLessons.length,5);
    const replay=await request('/api/lessons/ch01-test/complete',{assessmentAnswers:answers});
    assert.equal(replay.xpEarned,0);
    assert.equal((await request('/api/progress')).xp,progress.xp);
    console.log('PASS: 12/12 submits successfully, Chapter 1 completes, replay gives no duplicate XP');
    for(const file of ['tilka-far-tree-v1.png','taa-marbuta-school-v1.png']) {
      const media=await fetch(base+'/images/discover/'+file);
      assert.equal(media.status,200); assert.match(media.headers.get('content-type'),/image\/png/);
    }
    console.log('PASS: both illustration URLs return PNG images');
    console.log('QA account retained in local staging only: '+session.user.id);
  } finally {await db.end();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
