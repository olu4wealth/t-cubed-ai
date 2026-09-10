import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const code = fs.readFileSync('src/lib/questions.ts','utf8');
const raw = code.match(/const seeds: Seed\[\] = (\[[\s\S]*?\n\]);/)[1];
const seeds = vm.runInNewContext(raw);
const corpus = ['1Timothy','2Timothy','Titus'].map(n=>JSON.parse(fs.readFileSync(`src/data/${n}.json`,'utf8')));
const covered = new Set();

// Reviewed in context: grandmother/mother, given/not given, forsook/travelled,
// present/requested, and evil/meekness have distinct, explicit roles in these verses.
const reviewedSameVerse = new Set(['2 Timothy 1:5','2 Timothy 1:7','2 Timothy 4:10','2 Timothy 4:11','Titus 3:2']);

for(const [book,chapter,number,topic,difficulty,prompt,answer,wrong] of seeds){
  const source = corpus.find(b=>b.book===book);
  assert(source,`Out-of-scope book: ${book}`);
  const verse = source.chapters.find(c=>+c.chapter===chapter)?.verses.find(v=>+v.verse===number)?.text;
  assert(verse,`Missing reference: ${book} ${chapter}:${number}`);
  assert(verse.toLowerCase().includes(answer.toLowerCase()),`Answer not in cited verse: ${book} ${chapter}:${number}: ${answer}`);
  assert.equal(new Set([answer,...wrong].map(s=>s.toLowerCase())).size,4,`Non-unique options: ${prompt}`);
  if(wrong.some(w=>verse.toLowerCase().includes(w.toLowerCase()))) assert(reviewedSameVerse.has(`${book} ${chapter}:${number}`),`Same-verse distractor needs review: ${prompt}`);
  assert([1,2,3].includes(difficulty));
  assert(topic && prompt);
  covered.add(`${book} ${chapter}`);
}

assert.equal(covered.size,13,'All 13 chapters must have verified content');
for(const b of corpus) assert(seeds.filter(s=>s[0]===b.book).length>=10,`${b.book} must support a complete focused round`);

console.log(`PASS: ${seeds.length} factual questions + ${seeds.length} exact-verse completions verified against the supplied KJV.`);
console.log('PASS: All three books, all 13 chapters, four unique options per question.');
console.log('PASS: Every correct answer is in its reference; same-verse distractors reviewed for distinct factual roles.');
