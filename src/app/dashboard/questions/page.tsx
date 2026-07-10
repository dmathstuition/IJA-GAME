import { createClient } from '@/lib/supabase/server';
import type { Section } from '@/lib/types';
import { NewSetButton } from './NewSetButton';
import { SetActions } from './SetActions';

function countQuestions(sections: Section[] | null): number {
  return (sections ?? []).reduce((n, s) => n + (s.questions?.length ?? 0), 0);
}

export default async function QuestionsPage() {
  const supabase = await createClient();
  const { data: sets } = await supabase
    .from('question_sets')
    .select('id, name, sections, updated_at')
    .order('updated_at', { ascending: false });

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: 40, fontFamily: 'system-ui', color: '#e8eef5' }}>
      <a href="/dashboard" style={{ color: '#8a93a0', fontSize: 13, textDecoration: 'none' }}>← Dashboard</a>
      <h1 style={{ fontSize: 26, margin: '10px 0 4px' }}>Question banks</h1>
      <p style={{ color: '#8a93a0', fontSize: 14, marginBottom: 20 }}>Build reusable sets, then launch a live game from one.</p>

      <NewSetButton />

      <div style={{ display: 'grid', gap: 8, marginTop: 24 }}>
        {(!sets || sets.length === 0) && <p style={{ color: '#8a93a0', fontSize: 14 }}>No sets yet. Create one above.</p>}
        {sets?.map((s) => {
          const count = countQuestions(s.sections as Section[]);
          return (
            <div key={s.id} style={{ border: '1px solid #2a2f3e', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#8a93a0' }}>{count} question{count === 1 ? '' : 's'}</div>
              </div>
              <SetActions setId={s.id} canStart={count > 0} />
            </div>
          );
        })}
      </div>
    </main>
  );
}
