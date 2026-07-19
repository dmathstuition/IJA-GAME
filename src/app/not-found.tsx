import { FullScreenMessage, fsmButton, fsmGhost } from '@/components/FullScreenMessage';

export default function NotFound() {
  return (
    <FullScreenMessage code="404" title="Page not found" message="The page you're looking for doesn't exist or has moved.">
      <a href="/" style={fsmButton}>Back to home</a>
      <a href="/dashboard" style={fsmGhost}>Go to dashboard</a>
    </FullScreenMessage>
  );
}
