import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Section } from '@/lib/types';
import { AdminShell } from '@/components/AdminShell';
import { QuestionSetEditor } from './QuestionSetEditor';

export default async function EditSetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: set } = await supabase.from('question_sets').select('id, name, sections').eq('id', id).maybeSingle();
  if (!set) notFound();

  return (
    <AdminShell active="Questions">
      <QuestionSetEditor setId={set.id} initialName={set.name} initialSections={(set.sections as Section[]) ?? []} />
    </AdminShell>
  );
}
