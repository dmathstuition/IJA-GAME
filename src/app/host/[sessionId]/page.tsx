import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveTheme, themeToCssVars } from '@/lib/themes';
import { HostClient } from './HostClient';

export default async function HostPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('game_sessions')
    .select('id, join_code, org_id')
    .eq('id', sessionId)
    .maybeSingle();

  if (!session) notFound();
  const { data: org } = await supabase.from('org_public').select('theme').eq('id', session.org_id).maybeSingle();
  const theme = resolveTheme(org?.theme ?? undefined);

  return (
    <div style={{ ...(themeToCssVars(theme) as React.CSSProperties), minHeight: '100vh', background: 'linear-gradient(160deg,var(--bg-from),var(--bg-to))' }}>
      <HostClient sessionId={session.id} joinCode={session.join_code} />
    </div>
  );
}
