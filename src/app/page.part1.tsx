'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Bookmark, Check, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Download, Flame, Heart, LayoutDashboard, Library, Loader2, Menu, Play, Plus, Settings, ShieldCheck, Sparkles, Sprout, Target, TrendingUp, Trophy, X, Zap, BarChart3, CheckCircle2, Circle, Lightbulb, Quote } from 'lucide-react';
import { scripture, bookNames, type Answer, type Correction, type PublicQuestion, type Session } from '@/lib/scripture';

type View = 'dashboard' | 'play' | 'progress' | 'library' | 'saved';
type SavedVerse = { reference: string; verse: string; book: string; chapter: number };
type Game = { id: string; question: PublicQuestion; total: number; number: number; score: number };
type Feedback = { correction: Correction; question: PublicQuestion | null; finished: boolean; number: number; score: number; answers?: Answer[] };

const dailyVerse: SavedVerse = { reference: '2 Timothy 1:7', verse: 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.', book: '2 Timothy', chapter: 1 };

const bookDetails = [
  { name: '1 Timothy', chapters: 6, subtitle: 'A life of faith. A church with purpose.', color: 'lavender', theme: 'Faith & leadership' },
  { name: '2 Timothy', chapters: 4, subtitle: 'Stand firm. Keep the faith.', color: 'peach', theme: 'Courage & calling' },
  { name: 'Titus', chapters: 3, subtitle: 'Sound doctrine. Everyday living.', color: 'green', theme: 'Truth & good works' },
];

const modes = [
  { id: 'quick', name: 'Quick fire', description: 'A little time. A lot to discover.', meta: '5 questions · ~2 min', icon: Zap, color: 'peach' },
  { id: 'standard', name: 'Adaptive challenge', description: 'A challenge that grows with you.', meta: '10 questions · ~5 min', icon: Sparkles, color: 'lavender' },
  { id: 'deep', name: 'Deep dive', description: 'Slow down. Dig a little deeper.', meta: '15 questions · ~8 min', icon: Target, color: 'green' },
];

function stats(answers: Answer[]) {
  const correct = answers.filter(a=>a.correct).length;
  return { total: answers.length, correct, accuracy: answers.length ? Math.round(correct / answers.length * 100) : 0 };
}

function grouped(answers: Answer[], field: 'book' | 'topic' | 'chapter') {
  const map = new Map<string, Answer[]>();
  answers.forEach(a=> { const key = field==='chapter' ? `${a.book} ${a.chapter}` : a[field]; map.set(key,[...(map.get(key)??[]),a]); });
  return [...map].map(([name, list])=>({name,...stats(list)})).sort((a,b)=>b.accuracy-a.accuracy);
}

export default function Home() {
  const [view,setView] = useState<View>('dashboard');
  const [sessions,setSessions] = useState<Session[]>([]);
  const [loaded,setLoaded] = useState(false);
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const [game,setGame] = useState<Game|null>(null);
  const [selected,setSelected] = useState('');
  const [feedback,setFeedback] = useState<Feedback|null>(null);
  const [report,setReport] = useState<Answer[]|null>(null);
  const [modal,setModal] = useState<'guide'|'settings'|null>(null);
  const [mobileMenu,setMobileMenu] = useState(false);
  const [name,setName] = useState('Friend');
  const [nameDraft,setNameDraft] = useState('');
  const [saved,setSaved] = useState<SavedVerse[]>([]);
  const [readerBook,setReaderBook] = useState('1 Timothy');
  const [chapter,setChapter] = useState(1);
  const [toast,setToast] = useState('');
  const [confirmExit,setConfirmExit] = useState(false);

  async function loadProgress() {
    try { const r=await fetch('/api/game'); const d=await r.json(); if(!r.ok) throw new Error(d.error); setSessions(d.sessions); setLoaded(true); } catch(e) { setError(e instanceof Error?e.message:'Could not load your progress.'); }
  }

  useEffect(()=> { loadProgress(); try {setName(localStorage.getItem('tcubed-name') || 'Friend'); setSaved(JSON.parse(localStorage.getItem('tcubed-verses')||'[]'));} catch {} },[]);
  useEffect(()=> { if(toast) {const t=setTimeout(()=>setToast(''),3000);return()=>clearTimeout(t);} },[toast]);
  useEffect(()=> {document.body.style.overflow=game||report||modal?'hidden':'';return()=>{document.body.style.overflow='';};},[game,report,modal]);

  function navigate(v: View) {setView(v);setMobileMenu(false);setError('');window.scrollTo({top:0,behavior:'smooth'});}
  function saveVerse(v: SavedVerse) { const exists=saved.some(s=>s.reference===v.reference);const next=exists?saved.filter(s=>s.reference!==v.reference):[v,...saved];setSaved(next);localStorage.setItem('tcubed-verses',JSON.stringify(next));setToast(exists?'Verse removed from your collection':'Verse saved for a little reflection'); }
  function openChapter(book: string,c: number) {setReaderBook(book);setChapter(c);navigate('library');}

  async function start(mode='standard', book='all') {
    if(busy)return;setBusy(true);setError('');
    try {const r=await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,book})});const d=await r.json();if(!r.ok)throw new Error(d.error);setGame(d);setSelected('');setFeedback(null);setReport(null);setConfirmExit(false);}catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}
  }

  async function submit() {
    if(!game||!selected||busy)return;setBusy(true);setError('');
    try {const r=await fetch('/api/game',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:game.id,questionId:game.question.id,answer:selected})});const d=await r.json();if(!r.ok)throw new Error(d.error);setFeedback(d);if(d.finished)loadProgress();}catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}
  }

  function nextQuestion() { if(!feedback||!game)return; if(feedback.finished){setReport(feedback.answers??[]);setGame(null);}else if(feedback.question){setGame({...game,question:feedback.question,number:feedback.number,score:feedback.score});}setFeedback(null);setSelected(''); }

  function exportReport(answers: Answer[]) {
    const s=stats(answers);const text=`T-CUBED — PERSONAL STUDY REPORT\n${new Date().toLocaleDateString()}\n\n${s.correct}/${s.total} correct · ${s.accuracy}% accuracy\n\nBOOKS\n${grouped(answers,'book').map(g=>`${g.name}: ${g.correct}/${g.total} (${g.accuracy}%)`).join('\n')}\n\nCHAPTERS TO REVISIT\n${grouped(answers,'chapter').filter(g=>g.accuracy<100).map(g=>`${g.name} — ${g.correct}/${g.total} correct`).join('\n')||'No missed questions in this sample.'}\n\nSUBJECTS\n${grouped(answers,'topic').map(g=>`${g.name}: ${g.correct}/${g.total}`).join('\n')}\n\nBased only on answered questions, not a complete measure of Scripture knowledge.\nScripture: King James Version. 1 Timothy, 2 Timothy, Titus only.`;
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='t-cubed-study-report.txt';a.click();URL.revokeObjectURL(url);setToast('Your study report has been downloaded');
  }

  const allAnswers=sessions.flatMap(s=>s.answers);
  const overall=stats(allAnswers);
  const completed=sessions.filter(s=>s.status==='completed');
  const explored=new Set(allAnswers.map(a=>a.book)).size;
  const touchedChapters=new Set(allAnswers.map(a=>`${a.book}-${a.chapter}`)).size;
  const today=new Date().toLocaleDateString();
  const playedToday=completed.some(s=>new Date(s.completedAt!).toLocaleDateString()===today);

  let streak=0;for(let i=playedToday?0:1;i<366;i++){const date=new Date();date.setDate(date.getDate()-i);if(completed.some(s=>new Date(s.completedAt!).toLocaleDateString()===date.toLocaleDateString()))streak++;else break;}

  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-((d.getDay()+6)%7)+i);return {label:['M','T','W','T','F','S','S'][i],today:d.toLocaleDateString()===today,future:d>new Date(),played:completed.some(s=>new Date(s.completedAt!).toLocaleDateString()===d.toLocaleDateString())};});

  const navItems: {id:View;label:string;icon:typeof BookOpen}[]=[
    {id:'dashboard',label:'Overview',icon:LayoutDashboard},
    {id:'play',label:'Play a challenge',icon:Play},
    {id:'progress',label:'My progress',icon:BarChart3},
    {id:'library',label:'Scripture library',icon:Library},
    {id:'saved',label:'Saved verses',icon:Bookmark}
  ];

  const renderModes=()=> <div className="mode-grid">{modes.map(m=><button className="mode-card" key={m.id} onClick={()=>start(m.id)} disabled={busy}><div className={`mode-icon ${m.color}`}><m.icon size={20}/></div><ArrowUpRight className="mode-arrow" size={17}/><h3>{m.name}</h3><p>{m.description}</p><span>{m.meta}</span></button>)}</div>;

  const renderBooks=()=> <div className="book-grid">{bookDetails.map((b,i)=>{const s=stats(allAnswers.filter(a=>a.book===b.name));return <article key={b.name} className={`book-card book-${b.color}`}><div className="book-top"><div className={`book-icon ${b.color}`}><BookOpen size={23}/><span>{i+1}</span></div><span className="chapter-count">{b.chapters} chapters</span></div><button className="book-title" onClick={()=>start('standard',b.name)} disabled={busy}>{b.name}<ArrowUpRight size={18}/></button><p>{b.subtitle}</p><div className="book-progress-label"><span>{s.total?`${s.total} questions explored`:'Your story starts here'}</span><b>{s.accuracy}%</b></div><div className="progress-track"><span style={{width:`${s.accuracy}%`}}/></div></article>;})}</div>;

  const renderReport=(answers:Answer[],inModal=false)=> {const s=stats(answers);const books=grouped(answers,'book');const chapters=grouped(answers,'chapter');const topics=grouped(answers,'topic');const weakest=[...books].sort((a,b)=>a.accuracy-b.accuracy)[0];const strongest=books[0];return <div className="report-content"><div className="report-score"><div className="report-trophy"><Trophy size={30}/></div><span className="eyebrow">EVERY QUESTION IS A STEP FORWARD</span><h2>{s.accuracy>=80?'Rooted in the Word.':s.accuracy>=50?'Your understanding is growing.':'A good place to grow.'}</h2><p>{s.correct} of {s.total} correct · <b>{s.accuracy}% accuracy</b> · {s.correct*100} points</p></div><div className="report-highlights"><div className="strength"><TrendingUp size={20}/><span>Strongest in this sample</span><h3>{strongest?.name||'Not enough data'}</h3><p>{strongest?`${strongest.correct} of ${strongest.total} correct`:'Play a round to discover your strengths.'}</p></div><div className="weakness"><Sprout size={20}/><span>Your next growth opportunity</span><h3>{weakest?.name||'Your first challenge'}</h3><p>{weakest?`${weakest.correct} of ${weakest.total} correct · ${weakest.accuracy===100?'Keep building on this foundation':'A little more study will go a long way'}`:'Your study path begins with a question.'}</p></div></div><h3 className="report-section-title">Your book-by-book picture</h3>{books.map(b=><div className="report-bar" key={b.name}><span>{b.name}</span><div className="progress-track"><span style={{width:`${b.accuracy}%`}}/></div><b>{b.accuracy}%</b><small>{b.correct}/{b.total}</small></div>)}<div className="report-details"><div><h3>Chapters to revisit</h3>{chapters.filter(c=>c.accuracy<100).length?chapters.filter(c=>c.accuracy<100).sort((a,b)=>a.accuracy-b.accuracy).map(c=><button key={c.name} className="chapter-link" onClick={()=>{const split=c.name.lastIndexOf(' ');setReport(null);openChapter(c.name.slice(0,split),+c.name.slice(split+1));}}><BookOpen size={15}/>{c.name}<ArrowUpRight size={15}/></button>):<p>No missed chapters in this sample. Try a deeper challenge!</p>}</div><div><h3>Subject breakdown</h3>{topics.map(t=><div className="topic-row" key={t.name}><span>{t.name}</span><b>{t.correct}/{t.total}</b></div>)}</div></div><p className="sample-note"><ShieldCheck size={15}/> Based on your answers, not a complete measure of your knowledge.</p><div className="report-actions"><button className="button primary" onClick={()=>start('standard',weakest?.name||'all')} disabled={busy}>Keep growing<ArrowRight size={17}/></button><button className="button secondary" onClick={()=>exportReport(answers)}><Download size={16}/>Save report</button>{inModal&&<button className="text-button" onClick={()=>{setReport(null);navigate('progress');}}>View all progress</button>}</div></div>;};