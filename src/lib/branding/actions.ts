'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/** Save the school's theme preset + animation style to organizations.theme. */
export async function updateBranding(preset: string, animation: string) {
  const supabase = await createClient();
  const { data: prof } = await supabase.from('profiles').select('org_id').single();
  if (!prof?.org_id) return { error: 'No organization for this user.' };

  const { error } = await supabase
    .from('organizations')
    .update({ theme: { preset, animation } })
    .eq('id', prof.org_id as string);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/branding');
  return { ok: true as const };
}
