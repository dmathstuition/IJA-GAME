'use client';

// Renders only when the root layout itself throws, so it must supply its own
// <html>/<body> and cannot rely on globals.css or the layout's font.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, background: '#080511', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Something went wrong</div>
        <p style={{ color: '#a49db3', fontSize: 15, maxWidth: 420, lineHeight: 1.6, marginBottom: 22 }}>
          The app hit an unexpected error. Please try again.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={reset} style={{ padding: '13px 22px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#FF6A00,#FF2D55)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Try again</button>
          <a href="/" style={{ padding: '13px 22px', borderRadius: 12, border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.04)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>Back to home</a>
        </div>
      </body>
    </html>
  );
}
