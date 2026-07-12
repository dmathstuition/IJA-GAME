'use server';

import { createClient } from '@/lib/supabase/server';
import { notify } from '@/lib/notify';

/**
 * Send the "welcome / login affirmation" email to the signed-in organiser.
 * Called right after a school is created in onboarding. Best-effort.
 */
export async function sendWelcomeEmail() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false };
  const { data: org } = await supabase.from('organizations').select('name').maybeSingle();
  await notify('welcome', { to: user.email, school: org?.name ?? 'your school' });
  return { ok: true };
}
