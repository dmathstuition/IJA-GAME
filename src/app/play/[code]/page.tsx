import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveTheme, themeToCssVars } from '@/lib/themes';
import { PlayClient } from './PlayClient';
import { TeamPlayClient } from './TeamPlayClient';
import { SpeedPlayClient } from './SpeedPlayClient';
import { OralPlayClient } from './OralPlayClient';

export default async function PlayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('game_sessions')
    .select('id, org_id, join_code, mode')
    .eq('join_code', code.toUpperCase())
    .is('ended_at', null)
    .maybeSingle();

  if (!session) notFound();
  const { data: org } = await supabase.from('org_public').select('name, theme').eq('id', session.org_id).maybeSingle();
  const theme = resolveTheme(org?.theme ?? undefined);

  return (
    <div style={{ ...(themeToCssVars(theme) as React.CSSProperties), minHeight: '100vh', background: 'linear-gradient(160deg,var(--bg-from),var(--bg-to))' }}>
      {session.mode === 'team' ? (
        <TeamPlayClient sessionId={session.id} orgId={session.org_id} schoolName={org?.name ?? 'Quiz'} animation={theme.animation} />
      ) : session.mode === 'speed' ? (
        <SpeedPlayClient sessionId={session.id} orgId={session.org_id} schoolName={org?.name ?? 'Quiz'} animation={theme.animation} />
      ) : session.mode === 'oral' ? (
        <OralPlayClient sessionId={session.id} orgId={session.org_id} schoolName={org?.name ?? 'Quiz'} animation={theme.animation} />
      ) : (
        <PlayClient sessionId={session.id} orgId={session.org_id} schoolName={org?.name ?? 'Quiz'} animation={theme.animation} />
      )}
    </div>
  );
}
