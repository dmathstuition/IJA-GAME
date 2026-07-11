// ============================================================================
//  Question import parser — ports the original organiser's `normalQ` / `runImport`.
//  Pure & framework-agnostic so the controller can preview a paste client-side
//  before committing it, and the server action can re-use the same normaliser.
//
//  Accepts the loose shapes teachers actually paste:
//    • text | question | q                       → question text
//    • options: ["a","b","c","d"] | {A,B,C,D}    → four choices
//    • a / b / c / d  (flat keys)                → four choices
//    • answer | correct : "B"  or full-text      → correct choice letter
//    • timeLimit | time : 30                      → seconds (default 30)
//  Top level may be an array of questions, or { sections: [{name, questions}] },
//  or a single question object.
// ============================================================================

import type { Choice, Question, Section } from '@/lib/types';

const LETTERS: Choice[] = ['A', 'B', 'C', 'D'];

function str(v: unknown): string {
  return v == null ? '' : String(v).trim();
}

/** Normalise one loose object into a strict Question (best-effort). */
export function normalizeQuestion(raw: Record<string, unknown>): Question | null {
  const text = str(raw.text ?? raw.question ?? raw.q ?? raw.prompt);
  if (!text) return null;

  // options can be an array, an {A,B,C,D} object, or flat a/b/c/d keys
  let opts: string[] = [];
  const ro = raw.options ?? raw.choices ?? raw.answers;
  if (Array.isArray(ro)) {
    opts = ro.map(str);
  } else if (ro && typeof ro === 'object') {
    const o = ro as Record<string, unknown>;
    opts = LETTERS.map((L) => str(o[L] ?? o[L.toLowerCase()]));
  } else {
    opts = [str(raw.a), str(raw.b), str(raw.c), str(raw.d)];
  }

  const options: Record<Choice, string> = {
    A: opts[0] ?? '',
    B: opts[1] ?? '',
    C: opts[2] ?? '',
    D: opts[3] ?? '',
  };

  // answer may be a letter, an index (0-3 / 1-4), or the full option text
  let answer: Choice = 'A';
  const rawAns = str(raw.answer ?? raw.correct ?? raw.correctAnswer).toUpperCase();
  if ((LETTERS as string[]).includes(rawAns)) {
    answer = rawAns as Choice;
  } else if (/^[1-4]$/.test(rawAns)) {
    answer = LETTERS[Number(rawAns) - 1];
  } else if (/^[0-3]$/.test(rawAns) && raw.answer != null && typeof raw.answer === 'number') {
    answer = LETTERS[Number(rawAns)];
  } else if (rawAns) {
    const byText = LETTERS.find((L) => options[L].toUpperCase() === rawAns);
    if (byText) answer = byText;
  }

  const tl = Number(raw.timeLimit ?? raw.time ?? raw.seconds ?? 30);
  const timeLimit = Number.isFinite(tl) && tl > 0 ? Math.round(tl) : 30;

  return { text, options, answer, timeLimit };
}

export interface ParseResult {
  questions: Question[];
  errors: string[];
}

/** Parse a pasted / uploaded JSON string into a flat Question[] list. */
export function parseImport(input: string): ParseResult {
  const errors: string[] = [];
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch (e) {
    return { questions: [], errors: [`Invalid JSON: ${(e as Error).message}`] };
  }

  // Pull a list of raw question objects out of whatever container was pasted.
  let rawList: unknown[] = [];
  if (Array.isArray(data)) {
    rawList = data;
  } else if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.questions)) {
      rawList = d.questions;
    } else if (Array.isArray(d.sections)) {
      rawList = (d.sections as Section[]).flatMap((s) =>
        Array.isArray((s as unknown as Record<string, unknown>).questions)
          ? ((s as unknown as Record<string, unknown>).questions as unknown[])
          : [],
      );
    } else {
      rawList = [d]; // a single question object
    }
  } else {
    return { questions: [], errors: ['Expected a JSON array or object of questions.'] };
  }

  const questions: Question[] = [];
  rawList.forEach((r, i) => {
    if (!r || typeof r !== 'object') {
      errors.push(`Item ${i + 1}: not an object — skipped.`);
      return;
    }
    const q = normalizeQuestion(r as Record<string, unknown>);
    if (!q) {
      errors.push(`Item ${i + 1}: missing question text — skipped.`);
      return;
    }
    questions.push(q);
  });

  return { questions, errors };
}

/** A copy-paste example teachers can start from. */
export const IMPORT_EXAMPLE = JSON.stringify(
  [
    {
      text: 'What is the chemical symbol for gold?',
      options: ['Au', 'Ag', 'Gd', 'Go'],
      answer: 'A',
      timeLimit: 20,
    },
    { text: 'How many continents are there?', a: '5', b: '6', c: '7', d: '8', answer: 'C' },
  ],
  null,
  2,
);
