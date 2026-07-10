'use client';

import './game.css';
import { Shape } from './Shapes';
import type { Choice } from '@/lib/types';

type State = 'idle' | 'picked' | 'reveal-correct' | 'reveal-wrong';

export function AnswerTile({
  choice,
  label,
  onClick,
  disabled,
  state = 'idle',
  compact,
}: {
  choice: Choice;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  state?: State;
  compact?: boolean;
}) {
  const cls = ['kbtn', 'ans', choice];
  if (state === 'picked') cls.push('picked');
  if (state === 'reveal-correct') cls.push('reveal-correct');
  if (state === 'reveal-wrong') cls.push('reveal-wrong');

  return (
    <button
      className={cls.join(' ')}
      onClick={onClick}
      disabled={disabled}
      style={compact ? { minHeight: 64, padding: '12px 16px', fontSize: '1rem' } : undefined}
      aria-label={`Answer ${choice}: ${label}`}
    >
      <Shape choice={choice} />
      <span className="ans-txt">{label}</span>
      {state === 'reveal-correct' && <span style={{ fontSize: '1.4em' }}>✓</span>}
    </button>
  );
}
