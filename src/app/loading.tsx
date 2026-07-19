// Route-level loading UI shown during server-component data fetches.
export default function Loading() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080511' }}>
      <style>{'@keyframes qzspin{to{transform:rotate(360deg)}}'}</style>
      <span
        aria-label="Loading"
        role="status"
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '3px solid rgba(255,255,255,.12)',
          borderTopColor: '#FF6A00',
          animation: 'qzspin .8s linear infinite',
        }}
      />
    </main>
  );
}
