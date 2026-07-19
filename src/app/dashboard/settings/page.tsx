// Account & settings — profile, credentials, school, and danger zone.
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/AdminShell';
import { AccountSettings } from './AccountSettings';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: org }] = await Promise.all([
    supabase.from('profiles').select('full_name, role').maybeSingle(),
    supabase.from('organizations').select('name, slug').maybeSingle(),
  ]);

  return (
    <AdminShell active="Account" title="Account & settings" subtitle={user?.email ?? undefined}>
      <AccountSettings
        email={user?.email ?? ''}
        fullName={profile?.full_name ?? ''}
        role={profile?.role ?? 'host'}
        orgName={org?.name ?? ''}
        orgSlug={org?.slug ?? ''}
      />
    </AdminShell>
  );
}
