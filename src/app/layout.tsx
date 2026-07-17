import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

// Qizora brand typeface.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Qizora — live quiz competitions for schools',
  description:
    'Run branded, real-time quiz competitions on the big screen. Team battles, speed rounds, quiz bowls and live leaderboards. Learn. Practice. Win.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
