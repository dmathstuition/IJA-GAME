// Marketing landing (apex domain). A themed React port of the original portal
// page. On a tenant subdomain this route will instead show the school's own
// join/host portal — wired in P1 once tenant lookup is live.
import Link from 'next/link';

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 20px',
        background: 'linear-gradient(160deg, var(--bg-from), var(--bg-to))',
      }}
    >
      <p
        style={{
          color: 'var(--accent)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          fontSize: 12,
          fontWeight: 900,
        }}
      >
        ★ Quizarena ★
      </p>
      <h1
        style={{
          fontSize: 'clamp(40px, 9vw, 96px)',
          color: 'var(--accent)',
          margin: '12px 0',
          lineHeight: 1,
          textShadow: '0 6px 30px rgba(255,214,0,.25)',
        }}
      >
        Live quiz competitions,
        <br /> for every school.
      </h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 18, maxWidth: 560 }}>
        Team battles, speed rounds and live leaderboards on the big screen —
        branded in your school&apos;s colours. Migrated from the IJA STEAM game
        into a platform any school can run.
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/signup"
          style={{
            background: 'var(--primary)',
            color: '#fff',
            padding: '14px 32px',
            borderRadius: 100,
            fontWeight: 900,
            textDecoration: 'none',
          }}
        >
          Start free trial →
        </Link>
        <Link
          href="/pricing"
          style={{
            border: '2px solid var(--text-dim)',
            color: 'var(--text)',
            padding: '14px 32px',
            borderRadius: 100,
            fontWeight: 900,
            textDecoration: 'none',
          }}
        >
          See pricing
        </Link>
      </div>
      <p style={{ marginTop: 52, color: 'var(--text-dim)', fontSize: 12, letterSpacing: 3 }}>
        POWERED BY D-MATHS ED-TECH HUB
      </p>
    </main>
  );
}
