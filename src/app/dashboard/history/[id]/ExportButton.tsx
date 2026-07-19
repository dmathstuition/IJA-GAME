'use client';

import { Download } from 'lucide-react';
import { downloadCsv } from '@/lib/game/exportCsv';

interface Standing { name: string; score: number; avatar?: string | null }

export function ExportButton({ joinCode, standings }: { joinCode: string; standings: Standing[] }) {
  return (
    <button
      onClick={() =>
        downloadCsv(
          `qizora-${joinCode}-results.csv`,
          ['Rank', 'Name', 'Score'],
          standings.map((p, i) => [i + 1, p.name, p.score]),
        )
      }
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 11, border: '1px solid rgba(255,255,255,.16)', background: 'rgba(255,255,255,.05)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
    >
      <Download size={15} /> Export CSV
    </button>
  );
}
