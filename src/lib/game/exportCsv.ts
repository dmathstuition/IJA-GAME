'use client';

// Download an array of rows as a CSV file (client-side, no dependency).
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(esc).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Ranked player leaderboard → CSV. */
export function exportLeaderboard(joinCode: string, players: { name: string; score: number }[]) {
  const ranked = [...players].sort((a, b) => b.score - a.score);
  downloadCsv(
    `qizora-${joinCode}-results.csv`,
    ['Rank', 'Name', 'Score'],
    ranked.map((p, i) => [i + 1, p.name, p.score]),
  );
}
