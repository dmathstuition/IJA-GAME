'use server';

import { createClient } from '@/lib/supabase/server';

type Supa = Awaited<ReturnType<typeof createClient>>;

async function me(supabase: Supa) {
  const { data } = await supabase.from('profiles').select('id, org_id, role').single();
  return data as { id: string; org_id: string; role: string } | null;
}

/** Invite a colleague to the signed-in organiser's school. Owner/admin only. */
export async function inviteMember(email: string, role: 'admin' | 'host') {
  const clean = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) return { error: 'Enter a valid email address.' };
  const supabase = await createClient();
  const profile = await me(supabase);
  if (!profile) return { error: 'No organization for this user.' };
  if (profile.role !== 'owner' && profile.role !== 'admin') return { error: 'Only owners and admins can invite members.' };

  // Already a member?
  const { data: existing } = await supabase.from('profiles').select('id').eq('org_id', profile.org_id).eq('email', clean).maybeSingle();
  if (existing) return { error: 'Someone with that email is already on your team.' };

  // Replace any prior pending invite for this email (unique index is on the pending ones).
  await supabase.from('org_invites').delete().eq('org_id', profile.org_id).eq('email', clean).is('accepted_at', null);

  const { data, error } = await supabase
    .from('org_invites')
    .insert({ org_id: profile.org_id, email: clean, role, invited_by: profile.id })
    .select('token')
    .single();
  if (error) return { error: error.message };
  return { token: data.token as string };
}

/** Revoke a pending invitation. */
export async function revokeInvite(inviteId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('org_invites').delete().eq('id', inviteId).select('id');
  if (error) return { error: error.message };
  if (!data?.length) return { error: 'That invite could not be revoked.' };
  return { ok: true };
}

/** Remove a team member (owner/admin only — enforced in the RPC). */
export async function removeMember(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('remove_member', { p_user_id: userId });
  return error ? { error: error.message } : { ok: true };
}

/** Rename the school. Owner/admin only. */
export async function renameOrg(name: string) {
  const clean = name.trim();
  if (clean.length < 2) return { error: 'School name is too short.' };
  const supabase = await createClient();
  const profile = await me(supabase);
  if (!profile) return { error: 'No organization for this user.' };
  if (profile.role !== 'owner' && profile.role !== 'admin') return { error: 'Only owners and admins can rename the school.' };
  const { error } = await supabase.from('organizations').update({ name: clean }).eq('id', profile.org_id);
  return error ? { error: error.message } : { ok: true };
}

/** Update the signed-in organiser's display name. */
export async function updateDisplayName(name: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({ full_name: name.trim() || null }).eq('id', (await me(supabase))?.id ?? '');
  return error ? { error: error.message } : { ok: true };
}

/** Permanently delete the whole school. Owner only (enforced in the RPC). */
export async function deleteOrg() {
  const supabase = await createClient();
  const { error } = await supabase.rpc('delete_organization');
  return error ? { error: error.message } : { ok: true };
}
