import { getVerse, type Answer, type PublicQuestion, bookNames } from './scripture';

// Each answer is an exact extract from the supplied KJV verse. No model-generated facts.
type Seed = [string, number, number, string, number, string, string, string[]];

const seeds: Seed[] = [
['1 Timothy',1,3,'People & places',1,'Where did Paul ask Timothy to remain?','Ephesus',['Crete','Rome','Nicopolis']],
['1 Timothy',1,5,'Faith & doctrine',2,'What is the end of the commandment, out of a pure heart?','charity',['godliness','patience','knowledge']],
['1 Timothy',1,20,'People & places',3,'Who is named alongside Hymenaeus in 1 Timothy 1?','Alexander',['Philetus','Demas','Tychicus']],
['1 Timothy',2,5,'Faith & doctrine',1,'Who is the one mediator between God and men?','Christ Jesus',['Paul','Timothy','Titus']],
['1 Timothy',2,8,'Christian living',2,'What does Paul say men should lift up in prayer?','holy hands',['a pure heart','the shield of faith','good works']],
['1 Timothy',2,7,'Calling & ministry',3,'Paul calls himself a teacher of whom in faith and verity?','the Gentiles',['the elders','the believers','the kings']],
['1 Timothy',3,1,'Church leadership',1,'Which office does Paul describe as desiring a good work?','a bishop',['a soldier','an evangelist','a servant']],
['1 Timothy',3,6,'Church leadership',2,'A bishop must not be what, lest he be lifted up with pride?','a novice',['a husband','a teacher','a father']],
['1 Timothy',3,15,'Faith & doctrine',3,'The church of the living God is the pillar and ground of what?','the truth',['the faith','good works','the promise']],
['1 Timothy',4,12,'Christian living',1,'Paul tells Timothy to let no man despise what?','thy youth',['thy doctrine','thy gift','thy faith']],
['1 Timothy',4,13,'Calling & ministry',2,'Alongside exhortation and doctrine, to what should Timothy give attendance?','reading',['fasting','hospitality','disputing']],
['1 Timothy',4,5,'Faith & doctrine',3,'Every creature of God is sanctified by the word of God and what?','prayer',['charity','patience','faith']],
['1 Timothy',5,1,'Christian living',1,'How should Timothy entreat an elder rather than rebuke him?','as a father',['as a soldier','as a brother','as a servant']],
['1 Timothy',5,9,'Church leadership',2,'What minimum age is stated for a widow to be taken into the number?','threescore years old',['forty years old','fifty years old','fourscore years old']],
['1 Timothy',5,18,'Church leadership',3,'The labourer is worthy of what?','his reward',['his office','his honour','his crown']],
['1 Timothy',6,10,'Christian living',1,'What does Paul call the root of all evil?','the love of money',['vain babblings','foolish questions','youthful lusts']],
['1 Timothy',6,6,'Christian living',2,'Godliness with what is great gain?','contentment',['knowledge','boldness','riches']],
['1 Timothy',6,20,'Faith & doctrine',3,'What kind of babblings must Timothy avoid?','profane and vain',['sound and faithful','foolish and unlearned','pure and peaceable']],
['2 Timothy',1,5,'People & places',1,'What was the name of Timothy\'s grandmother?','Lois',['Eunice','Claudia','Prisca']],
['2 Timothy',1,5,'People & places',2,'What was the name of Timothy\'s mother?','Eunice',['Lois','Claudia','Prisca']],
['2 Timothy',1,7,'Faith & doctrine',1,'God has not given us the spirit of what?','fear',['power','love','a sound mind']],
['2 Timothy',1,16,'People & places',3,'Whose household did Paul ask the Lord to give mercy to, because he often refreshed Paul?','Onesiphorus',['Erastus','Trophimus','Carpus']],
['2 Timothy',2,3,'Calling & ministry',1,'Timothy is told to endure hardness as a good what of Jesus Christ?','soldier',['husbandman','workman','steward']],
['2 Timothy',2,15,'Calling & ministry',2,'What is the approved workman to rightly divide?','the word of truth',['the gift of God','the good deposit','the crown of righteousness']],
['2 Timothy',2,17,'People & places',3,'Who is named alongside Hymenaeus in 2 Timothy 2?','Philetus',['Alexander','Demas','Hermogenes']],
['2 Timothy',2,22,'Christian living',2,'What is Timothy explicitly told to flee in this verse?','youthful lusts',['good works','sound words','godly edifying']],
['2 Timothy',3,16,'Faith & doctrine',1,'All Scripture is given by what?','inspiration of God',['the laying on of hands','the will of man','the commandment of Paul']],
['2 Timothy',3,15,'Faith & doctrine',2,'From what stage of life had Timothy known the holy scriptures?','a child',['a novice','an elder','a bishop']],
['2 Timothy',3,8,'People & places',3,'Jannes and Jambres withstood whom?','Moses',['Paul','Alexander','Timothy']],
['2 Timothy',4,7,'Calling & ministry',1,'Paul says: "I have fought a good fight, I have finished my course, I have kept" what?','the faith',['the law','the commandment','the promise']],
['2 Timothy',4,10,'People & places',2,'Who forsook Paul, having loved this present world?','Demas',['Luke','Mark','Titus']],
['2 Timothy',4,13,'People & places',3,'Where did Paul leave his cloke with Carpus?','Troas',['Miletum','Corinth','Ephesus']],
['2 Timothy',4,11,'People & places',2,'Who alone was with Paul, according to this verse?','Luke',['Mark','Tychicus','Erastus']],
['Titus',1,5,'People & places',1,'On which island did Paul leave Titus?','Crete',['Ephesus','Troas','Rome']],
['Titus',1,5,'Church leadership',2,'What was Titus to ordain in every city?','elders',['kings','soldiers','widows']],
['Titus',1,9,'Church leadership',3,'By what kind of doctrine should an elder exhort and convince the gainsayers?','sound doctrine',['endless genealogies','old wives\' fables','vain jangling']],
['Titus',2,3,'Christian living',1,'The aged women are to be teachers of what?','good things',['genealogies','fables','commandments of men']],
['Titus',2,7,'Christian living',2,'In all things Titus should show himself a pattern of what?','good works',['great riches','endless questions','worldly lusts']],
['Titus',2,12,'Christian living',3,'Denying ungodliness and worldly lusts, how should we live in this present world?','soberly, righteously, and godly',['in word, in conversation, in charity','in faith and verity','with wrath and doubting']],
['Titus',3,2,'Christian living',1,'Of how many people does Paul say to speak evil?','no man',['all men','the gainsayers','the unruly']],
['Titus',3,5,'Faith & doctrine',2,'According to what did God save us, rather than works of righteousness which we have done?','his mercy',['our works','our knowledge','the law']],
['Titus',3,12,'People & places',3,'Where had Paul determined to spend the winter?','Nicopolis',['Troas','Crete','Thessalonica']],
['Titus',3,13,'People & places',3,'What occupation is given for Zenas?','the lawyer',['the coppersmith','the bishop','the soldier']],
];

export type Question = PublicQuestion & { answer: string; reference: string; verse: string; chapter: number };

export const questions: Question[] = seeds.flatMap((s, i) => {
  const [book, chapter, verseNumber, topic, difficulty, prompt, answer, wrong] = s;
  const verse = getVerse(book, chapter, verseNumber);
  if (!verse.toLowerCase().includes(answer.toLowerCase())) throw new Error(`Unverified question ${i}: ${book} ${chapter}:${verseNumber} — ${answer}`);
  const base = { book, chapter, topic, difficulty, answer, reference: `${book} ${chapter}:${verseNumber}`, verse, options: [answer, ...wrong] };
  return [{...base, id: `q${i}`, prompt}, {...base, id: `c${i}`, difficulty: Math.min(3, difficulty + 1), prompt: `Complete ${book} ${chapter}:${verseNumber}:\n"${verse.replace(new RegExp(answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '________')}"` }];
});

export function publicQuestion(q: Question, seed: string): PublicQuestion {
  // Stable shuffled options prevent position changes on resume or failed requests.
  const hash = (s: string) => [...s].reduce((h,c) => Math.imul(31,h) + c.charCodeAt(0) | 0, 0) >>> 0;
  return { id: q.id, book: q.book, topic: q.topic, difficulty: q.difficulty, prompt: q.prompt, options: [...q.options].sort((a,b) => hash(seed+a)-hash(seed+b)) };
}

export function selectQuestion(answers: Answer[], history: Answer[], book: string, difficulty: number, daily = false): Question {
  const used = new Set(answers.map(a => a.questionId.slice(1)));
  let pool = questions.filter(q => !used.has(q.id.slice(1)) && (book === 'all' || q.book === book));
  if (book === 'all') {
    const counts = bookNames.map(b => ({b, n: answers.filter(a => a.book===b).length}));
    const least = Math.min(...counts.map(c=>c.n));
    pool = pool.filter(q=>counts.find(c=>c.b===q.book)!.n===least);
  }
  const day = Math.floor(Date.now()/86400000);
  const score = (q: Question) => {
    const relevant = history.filter(a=>a.book===q.book && a.topic===q.topic);
    // Beta(1,1) posterior: prioritize uncertainty and areas with lower mastery.
    const mastery = (1+relevant.filter(a=>a.correct).length)/(2+relevant.length);
    const recent = history.slice(-50).some(a=>a.questionId.slice(1)===q.id.slice(1));
    const exploration = daily ? ((Number(q.id.slice(1))*37 + day*13 + answers.length*19)%101)/101 : Math.random();
    return (1-mastery)*2 - Math.abs(q.difficulty-difficulty)*1.5 - (recent ? 2 : 0) + exploration;
  };
  return pool.map(q=>({q, s:score(q)})).sort((a,b)=>b.s-a.s)[0].q;
}
