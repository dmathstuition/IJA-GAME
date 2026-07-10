import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveTheme, themeToCssVars } from '@/lib/themes';
import { PlayClient } from './PlayClient';

export default async function PlayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('game_sessions')
    .select('id, org_id, join_code')
    .eq('join_code', code.toUpperCase())
    .is('ended_at', null)
    .maybeSingle();

  if (!session) notFound();
  const { data: org } = await supabase.from('org_public').select('name, theme').eq('id', session.org_id).maybeSingle();
  const theme = resolveTheme(org?.theme ?? undefined);

  return (
    <div style={{ ...(themeToCssVars(theme) as React.CSSProperties), minHeight: '100vh', background: 'linear-gradient(160deg,var(--bg-from),var(--bg-to))' }}>
      <PlayClient sessionId={session.id} orgId={session.org_id} schoolName={org?.name ?? 'Quiz'} />
    </div>
  );
}
