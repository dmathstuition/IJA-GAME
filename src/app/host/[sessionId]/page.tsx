import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveTheme, themeToCssVars } from '@/lib/themes';
import type { Section, Question } from '@/lib/types';
import { HostClient } from './HostClient';
import { TeamHostClient } from './TeamHostClient';

export default async function HostPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('game_sessions')
    .select('id, join_code, org_id, question_set_id, mode')
    .eq('id', sessionId)
    .maybeSingle();

  if (!session) notFound();
  const { data: org } = await supabase.from('org_public').select('theme').eq('id', session.org_id).maybeSingle();
  const theme = resolveTheme(org?.theme ?? undefined);

  // Flatten the chosen question set into the launch list (falls back to samples).
  let questions: Question[] = [];
  if (session.question_set_id) {
    const { data: qs } = await supabase.from('question_sets').select('sections').eq('id', session.question_set_id).maybeSingle();
    questions = ((qs?.sections as Section[]) ?? []).flatMap((s) => s.questions ?? []);
  }

  return (
    <div style={{ ...(themeToCssVars(theme) as React.CSSProperties), minHeight: '100vh', background: 'linear-gradient(160deg,var(--bg-from),var(--bg-to))' }}>
      {session.mode === 'team' ? (
        <TeamHostClient sessionId={session.id} joinCode={session.join_code} questions={questions} />
      ) : (
        <HostClient sessionId={session.id} joinCode={session.join_code} questions={questions} />
      )}
    </div>
  );
}
