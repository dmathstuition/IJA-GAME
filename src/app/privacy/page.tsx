import { LegalLayout, LegalSection } from '@/components/LegalLayout';

export const metadata = { title: 'Privacy Policy · Qizora' };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 2026">
      <p style={{ marginTop: 0 }}>
        This Privacy Policy explains how Qizora (&ldquo;we&rdquo;, &ldquo;us&rdquo;), a product founded and operated by DMaths Academy,
        collects and uses information when a school uses our live quiz platform.
      </p>

      <LegalSection heading="1. Information we collect">
        <p>
          <b>Organiser accounts.</b> When a teacher or school signs up we collect a name, email address and school name.
          <br />
          <b>Questions &amp; games.</b> Question banks, game settings and live scores you create are stored so you can run and revisit competitions.
          <br />
          <b>Players.</b> Students join a live game with a display name only. We do not require student emails, passwords or personal profiles; a temporary anonymous session identifies a player for the duration of a game.
        </p>
      </LegalSection>

      <LegalSection heading="2. How we use information">
        <p>We use information solely to provide the service: to authenticate organisers, run live games, calculate and display scores, and improve reliability. We do not sell personal information, and we do not show third-party advertising.</p>
      </LegalSection>

      <LegalSection heading="3. Payments">
        <p>Paid activation is processed by PayPal. We receive confirmation of a completed payment and a transaction reference; we never see or store your card or bank details, which are handled entirely by PayPal under their own privacy policy.</p>
      </LegalSection>

      <LegalSection heading="4. Data storage &amp; security">
        <p>Data is stored on managed cloud infrastructure (Supabase / Vercel) with access controls and row-level security so each school can only reach its own data. We take reasonable measures to protect information but no online service can guarantee absolute security.</p>
      </LegalSection>

      <LegalSection heading="5. Data retention">
        <p>We keep your account and question banks for as long as your account is active. You can delete sessions at any time, and you may request deletion of your account and associated data by emailing us.</p>
      </LegalSection>

      <LegalSection heading="6. Children&rsquo;s privacy">
        <p>Qizora is used in schools under the supervision of teachers. Students participate using only a display name chosen for the game. We do not knowingly collect personal contact information from children.</p>
      </LegalSection>

      <LegalSection heading="7. Your rights">
        <p>You may access, correct or delete your organiser information at any time from your dashboard or by contacting us. If you are in a region with data-protection laws (e.g. GDPR), you may exercise the rights those laws provide.</p>
      </LegalSection>

      <LegalSection heading="8. Changes">
        <p>We may update this policy from time to time; material changes will be reflected by the &ldquo;last updated&rdquo; date above.</p>
      </LegalSection>
    </LegalLayout>
  );
}
