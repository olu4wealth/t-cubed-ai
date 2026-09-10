import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { gameSessions } from '@/db/schema';
import { questions, publicQuestion, selectQuestion } from '@/lib/questions';
import { bookNames, roundLength } from '@/lib/scripture';

async function player() {
  const jar = await cookies();
  let id = jar.get('tcubed-player')?.value;
  if (!id || !/^[a-f0-9-]{36}$/.test(id)) {
    id = crypto.randomUUID();
    jar.set('tcubed-player', id, {httpOnly:true, sameSite:'lax', path:'/', maxAge:31536000, secure:process.env.NODE_ENV==='production' && process.env.COOKIE_SECURE==='true'});
  }
  return id;
}

export async function GET() {
  try {
    const id = await player();
    const sessions = await db.select().from(gameSessions).where(eq(gameSessions.playerId,id)).orderBy(desc(gameSessions.createdAt)).limit(200);
    return NextResponse.json({sessions: sessions.map(({currentQuestion: _q, playerId: _p, ...s})=>s)});
  } catch(e) { console.error(e); return NextResponse.json({error:'Your progress could not be loaded. Please try again.'},{status:500}); }
}

export async function POST(req: NextRequest) {
  try {
    const playerId = await player();
    const body = await req.json();
    let mode = ['standard','daily','quick','deep'].includes(body.mode) ? body.mode : 'standard';
    const book = bookNames.includes(body.book) ? body.book : 'all';
    if (book !== 'all' && mode === 'deep') mode='standard';
    const past = await db.select().from(gameSessions).where(eq(gameSessions.playerId,playerId)).orderBy(desc(gameSessions.createdAt)).limit(30);
    const history = past.reverse().flatMap(s=>s.answers);
    const question = selectQuestion([],history,book,1,mode==='daily');
    const [session] = await db.insert(gameSessions).values({playerId,mode,book,currentQuestion:question.id}).returning();
    return NextResponse.json({id:session.id, question:publicQuestion(question,session.id), total:roundLength(mode), number:1, score:0});
  } catch(e) { console.error(e); return NextResponse.json({error:'We couldn\'t start your challenge. Please try again.'},{status:500}); }
}

export async function PATCH(req: NextRequest) {
  try {
    const playerId = await player();
    const body = await req.json();
    if (typeof body.id !== 'string' || !/^[a-f0-9-]{36}$/.test(body.id)) return NextResponse.json({error:'Invalid session.'},{status:400});
    const result = await db.transaction(async tx => {
      const [session] = await tx.select().from(gameSessions).where(and(eq(gameSessions.id,body.id),eq(gameSessions.playerId,playerId))).for('update');
      if (!session || session.status !== 'active') return {error:'This round is no longer active.'};
      const q = questions.find(q=>q.id===session.currentQuestion)!;
      if (q.id !== body.questionId || !q.options.includes(body.answer)) return {error:'This answer does not match the current question.'};
      const correct = body.answer===q.answer;
      const answers = [...session.answers, {questionId:q.id,selected:body.answer,correct,book:q.book,chapter:q.chapter,topic:q.topic,difficulty:q.difficulty}];
      const difficulty = Math.max(1,Math.min(3,session.difficulty+(correct ? 1 : -1)));
      const finished = answers.length >= roundLength(session.mode);
      const past = await tx.select().from(gameSessions).where(eq(gameSessions.playerId,playerId)).orderBy(desc(gameSessions.createdAt)).limit(30);
      const next = finished ? null : selectQuestion(answers,past.reverse().flatMap(s=>s.answers),session.book,difficulty,session.mode==='daily');
      await tx.update(gameSessions).set({answers,difficulty,status:finished?'completed':'active',currentQuestion:next?.id??q.id,completedAt:finished?new Date():null}).where(eq(gameSessions.id,session.id));
      return { correction:{correct,answer:q.answer,reference:q.reference,verse:q.verse,book:q.book,chapter:q.chapter}, question: next ? publicQuestion(next,session.id):null, finished, number:answers.length+1, score:answers.filter(a=>a.correct).length*100, answers:finished?answers:undefined };
    });
    return NextResponse.json(result,{status:'error' in result?400:200});
  } catch(e) { console.error(e); return NextResponse.json({error:'Your answer could not be saved. Please retry.'},{status:500}); }
}
