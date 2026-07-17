import { LegalLayout, LegalSection } from '@/components/LegalLayout';

export const metadata = { title: 'Terms & Conditions · Quizzard' };

export default function TermsPage() {
  return (
    <LegalLayout title="Terms &amp; Conditions" updated="July 2026">
      <p style={{ marginTop: 0 }}>
        These Terms govern your use of Quizzard, a live quiz platform founded and operated by DMaths Academy.
        By creating an account or using the service you agree to these Terms.
      </p>

      <LegalSection heading="1. The service">
        <p>Quizzard lets schools build question banks and run live quiz competitions (Standard, Team, Speed and Quiz Bowl modes) on their own screens and devices. We may add, change or remove features to improve the product.</p>
      </LegalSection>

      <LegalSection heading="2. Accounts">
        <p>You are responsible for the accuracy of your account details and for keeping your login secure. You are responsible for activity that happens under your account and for the conduct of games you host.</p>
      </LegalSection>

      <LegalSection heading="3. Free trial &amp; payment">
        <p>New schools may start with a free trial. Continued live hosting requires a one-time activation paid via PayPal for the term or year, as shown on the pricing page. Activation unlocks hosting for the stated period; there is no automatic recurring subscription.</p>
      </LegalSection>

      <LegalSection heading="4. Refunds">
        <p>If activation does not work as described, contact us within 14 days and we will work with you to resolve it or provide a refund for the unused period at our discretion.</p>
      </LegalSection>

      <LegalSection heading="5. Acceptable use">
        <p>You agree not to misuse the service: no unlawful content, no attempts to disrupt or gain unauthorised access to the platform or other schools&rsquo; data, and no uploading of material you do not have the right to use. Question content you create is your responsibility.</p>
      </LegalSection>

      <LegalSection heading="6. Your content">
        <p>You keep ownership of the questions and materials you create. You grant us the limited right to store and display that content solely to operate the service for you.</p>
      </LegalSection>

      <LegalSection heading="7. Availability">
        <p>We aim for high availability but provide the service &ldquo;as is&rdquo; without warranty of uninterrupted operation. We are not liable for indirect or consequential losses arising from use of the service, to the extent permitted by law.</p>
      </LegalSection>

      <LegalSection heading="8. Termination">
        <p>You may stop using Quizzard at any time. We may suspend or terminate accounts that breach these Terms. On termination your right to use the service ends; you may request export or deletion of your data.</p>
      </LegalSection>

      <LegalSection heading="9. Contact">
        <p>Questions about these Terms can be sent to dmathstuition@gmail.com.</p>
      </LegalSection>
    </LegalLayout>
  );
}
