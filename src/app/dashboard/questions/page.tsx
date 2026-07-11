import { createClient } from '@/lib/supabase/server';
import type { Section } from '@/lib/types';
import { AdminShell, adminCard } from '@/components/AdminShell';
import { Library } from 'lucide-react';
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
    <AdminShell active="Questions" title="Question banks" subtitle="Build reusable sets, then launch any game mode from one.">
      <div style={{ ...adminCard, marginBottom: 22 }}>
        <NewSetButton />
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {(!sets || sets.length === 0) && <div style={{ ...adminCard, color: '#8b8296', textAlign: 'center', padding: '30px 20px', fontSize: 14 }}>No sets yet. Create one above.</div>}
        {sets?.map((s) => {
          const count = countQuestions(s.sections as Section[]);
          return (
            <div key={s.id} style={{ ...adminCard, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Library size={22} color="#60a5fa" />
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{s.name}</div>
                <div style={{ fontSize: 12.5, color: '#8b8296' }}>{count} question{count === 1 ? '' : 's'}</div>
              </div>
              <SetActions setId={s.id} canStart={count > 0} />
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
