import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveTheme, themeToCssVars } from '@/lib/themes';
import { DisplayClient } from './DisplayClient';

export default async function DisplayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('game_sessions')
    .select('id, join_code, org_id')
    .eq('join_code', code.toUpperCase())
    .is('ended_at', null)
    .maybeSingle();

  if (!session) notFound();
  const { data: org } = await supabase.from('org_public').select('name, theme').eq('id', session.org_id).maybeSingle();
  const theme = resolveTheme(org?.theme ?? undefined);

  return (
    <div style={{ ...(themeToCssVars(theme) as React.CSSProperties), minHeight: '100vh', background: 'linear-gradient(160deg,var(--bg-from),var(--bg-to))' }}>
      <DisplayClient sessionId={session.id} joinCode={session.join_code} schoolName={org?.name ?? 'Quiz'} animation={theme.animation} />
    </div>
  );
}
