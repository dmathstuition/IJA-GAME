// Team seats — members of the signed-in school + pending invitations (RLS-scoped).
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/AdminShell';
import { TeamManager } from './TeamManager';

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: meRow } = await supabase.from('profiles').select('id, role').single();
  const [{ data: members }, { data: invites }] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name, role, created_at').order('created_at'),
    supabase.from('org_invites').select('id, email, role, created_at, expires_at, token').is('accepted_at', null).order('created_at', { ascending: false }),
  ]);
  const canManage = meRow?.role === 'owner' || meRow?.role === 'admin';

  return (
    <AdminShell active="Team" title="Team" subtitle="Invite colleagues to help build questions and host games.">
      <TeamManager
        meId={meRow?.id ?? null}
        canManage={canManage}
        members={members ?? []}
        invites={invites ?? []}
      />
    </AdminShell>
  );
}
