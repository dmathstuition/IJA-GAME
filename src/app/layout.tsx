import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quizarena — live quiz competitions for schools',
  description:
    'Run branded, real-time quiz competitions on the big screen. Team battles, speed rounds, oral rounds and live leaderboards.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
