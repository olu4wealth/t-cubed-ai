import first from '@/data/1Timothy.json';
import second from '@/data/2Timothy.json';
import titus from '@/data/Titus.json';

export const scripture = [first, second, titus];
export const bookNames = ['1 Timothy', '2 Timothy', 'Titus'] as const;

export function getVerse(book: string, chapter: number, verse: number) {
  return scripture.find(b => b.book === book)?.chapters.find(c => +c.chapter === chapter)?.verses.find(v => +v.verse === verse)?.text ?? '';
}

export type Answer = { questionId: string; selected: string; correct: boolean; book: string; chapter: number; topic: string; difficulty: number };
export type PublicQuestion = { id: string; book: string; topic: string; difficulty: number; prompt: string; options: string[] };
export type Correction = { correct: boolean; answer: string; reference: string; verse: string; book: string; chapter: number };
export type Session = { id: string; mode: string; book: string; status: string; answers: Answer[]; createdAt: string; completedAt: string | null };

export function roundLength(mode: string) { return mode === 'quick' ? 5 : mode === 'deep' ? 15 : 10; }
