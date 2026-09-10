import { questions, publicQuestion, selectQuestion } from './questions';
import { bookNames, roundLength, type Answer, type Correction, type PublicQuestion, type Session } from './scripture';

type Stored = Session & { difficulty: number; currentQuestion: string };

const KEY = 'tcubed-sessions';

function load(): Stored[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(sessions: Stored[]) {
  localStorage.setItem(KEY, JSON.stringify(sessions.slice(-200)));
}

export function loadSessions(): Session[] {
  return load();
}

export function startGame(mode = 'standard', book = 'all') {
  if (!['standard', 'daily', 'quick', 'deep'].includes(mode)) mode = 'standard';
  if (!(bookNames as readonly string[]).includes(book)) book = 'all';
  if (book !== 'all' && mode === 'deep') mode = 'standard';
  const sessions = load();
  const history = sessions.slice(-30).flatMap((s) => s.answers);
  const q = selectQuestion([], history, book, 1, mode === 'daily');
  const now = new Date().toISOString();
  const session: Stored = { id: crypto.randomUUID(), mode, book, status: 'active', answers: [], createdAt: now, completedAt: null, difficulty: 1, currentQuestion: q.id };
  sessions.push(session);
  save(sessions);
  return { id: session.id, question: publicQuestion(q, session.id) as PublicQuestion, total: roundLength(mode), number: 1, score: 0 };
}

export function submitAnswer(gameId: string, questionId: string, answer: string) {
  const sessions = load();
  const s = sessions.find((x) => x.id === gameId);
  if (!s || s.status !== 'active') return { error: 'This round is no longer active.' };
  const q = questions.find((q) => q.id === s.currentQuestion);
  if (!q || q.id !== questionId || !q.options.includes(answer)) return { error: 'This answer does not match the current question.' };
  const correct = answer === q.answer;
  const entry: Answer = { questionId: q.id, selected: answer, correct, book: q.book, chapter: q.chapter, topic: q.topic, difficulty: q.difficulty };
  s.answers = [...s.answers, entry];
  s.difficulty = Math.max(1, Math.min(3, s.difficulty + (correct ? 1 : -1)));
  const finished = s.answers.length >= roundLength(s.mode);
  const history = sessions.slice(-30).flatMap((x) => x.answers);
  const next = finished ? null : selectQuestion(s.answers, history, s.book, s.difficulty, s.mode === 'daily');
  s.status = finished ? 'completed' : 'active';
  s.currentQuestion = next?.id ?? q.id;
  if (finished) s.completedAt = new Date().toISOString();
  save(sessions);
  const correction: Correction = { correct, answer: q.answer, reference: q.reference, verse: q.verse, book: q.book, chapter: q.chapter };
  return { correction, question: next ? (publicQuestion(next, s.id) as PublicQuestion) : null, finished, number: s.answers.length + 1, score: s.answers.filter((a) => a.correct).length * 100, answers: finished ? s.answers : undefined };
}
