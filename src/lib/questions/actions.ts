'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Section } from '@/lib/types';

async function orgId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from('profiles').select('org_id').single();
  return data?.org_id as string | undefined;
}

export async function createQuestionSet(name: string) {
  const supabase = await createClient();
  const org = await orgId(supabase);
  if (!org) return { error: 'No organization for this user.' };

  const { data, error } = await supabase
    .from('question_sets')
    .insert({ org_id: org, name: name.trim() || 'Untitled set', sections: [{ name: 'Section 1', questions: [] }] })
    .select('id')
    .single();
  if (error) return { error: error.message };
  revalidatePath('/dashboard/questions');
  return { id: data.id as string };
}

export async function saveQuestionSet(id: string, name: string, sections: Section[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('question_sets')
    .update({ name: name.trim() || 'Untitled set', sections, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/questions/${id}`);
  revalidatePath('/dashboard/questions');
  return { ok: true as const };
}

export async function deleteQuestionSet(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('question_sets').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/questions');
  return { ok: true as const };
}
