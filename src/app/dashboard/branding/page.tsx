import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/AdminShell';
import { BrandingEditor } from './BrandingEditor';

export default async function BrandingPage() {
  const supabase = await createClient();
  const { data: org } = await supabase.from('organizations').select('theme').maybeSingle();
  const theme = (org?.theme as { preset?: string; animation?: string } | null) ?? {};

  return (
    <AdminShell active="Branding" title="Branding" subtitle="Pick a look — it re-skins your whole game: lobby, questions, leaderboard and celebration.">
      <BrandingEditor initialPreset={theme.preset ?? 'steam'} initialAnimation={theme.animation ?? ''} />
    </AdminShell>
  );
}
