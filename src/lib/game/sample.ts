import type { Question } from '@/lib/types';

// A tiny starter bank so a new organiser can launch a live game in one click.
export const SAMPLE_QUESTIONS: Question[] = [
  { text: 'What is 12 × 8?', options: { A: '84', B: '96', C: '102', D: '88' }, answer: 'B', timeLimit: 20 },
  { text: 'Which is a prime number?', options: { A: '21', B: '27', C: '29', D: '33' }, answer: 'C', timeLimit: 20 },
  { text: 'The square root of 144 is…', options: { A: '11', B: '12', C: '13', D: '14' }, answer: 'B', timeLimit: 15 },
  { text: 'What is 15% of 200?', options: { A: '25', B: '30', C: '35', D: '40' }, answer: 'B', timeLimit: 25 },
  { text: 'Angles in a triangle add up to…', options: { A: '90°', B: '180°', C: '270°', D: '360°' }, answer: 'B', timeLimit: 15 },
];
