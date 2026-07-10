import type { Question, Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];

/**
 * Parse the organiser's import format (same shape as the original game):
 *   [{ "text": "Q?", "options": {"A":"","B":"","C":"","D":""}, "answer": "A", "timeLimit": 30 }]
 * Lenient: coerces types, defaults timeLimit, and reports the first bad row.
 */
export function parseQuestionsJSON(raw: string): { questions?: Question[]; error?: string } {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { error: 'That is not valid JSON.' };
  }
  if (!Array.isArray(data)) return { error: 'Expected a JSON array of questions.' };

  const out: Question[] = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i] as Record<string, unknown>;
    const text = String(row?.text ?? '').trim();
    if (!text) return { error: `Question ${i + 1}: missing "text".` };

    const opts = (row?.options ?? {}) as Record<string, unknown>;
    const options = {} as Record<Choice, string>;
    for (const c of CHOICES) options[c] = String(opts[c] ?? '').trim();
    if (CHOICES.some((c) => !options[c])) return { error: `Question ${i + 1}: needs options A, B, C and D.` };

    const answer = String(row?.answer ?? '').toUpperCase() as Choice;
    if (!CHOICES.includes(answer)) return { error: `Question ${i + 1}: "answer" must be A, B, C or D.` };

    const timeLimit = Number(row?.timeLimit ?? 30);
    out.push({ text, options, answer, timeLimit: Number.isFinite(timeLimit) ? timeLimit : 30 });
  }
  return { questions: out };
}

export const IMPORT_EXAMPLE =
  '[{"text":"12 × 8 = ?","options":{"A":"84","B":"96","C":"102","D":"88"},"answer":"B","timeLimit":20}]';
