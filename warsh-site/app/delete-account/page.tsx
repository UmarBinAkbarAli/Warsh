import type { Metadata } from 'next';
import { LegalLayout, H2, P, UL, LI, A } from '../components/LegalLayout';

export const metadata: Metadata = {
  title: 'Delete Your Account',
  description: 'How to delete your Warsh account and what data is removed.',
  alternates: { canonical: '/delete-account' },
};

export default function DeleteAccountPage() {
  return (
    <LegalLayout title="Delete your Warsh account">
      <P>
        This page is the external account-deletion resource for the Warsh app (
        <strong>com.warsh.app</strong>) by Umar Bin Akbar Ali.
      </P>

      <div className="mt-4 rounded-lg border border-navy/10 bg-parchment-bg p-6">
        <h2 className="font-display text-lg font-semibold text-navy">
          Fastest method: delete inside the app
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-deep">
          Sign in to Warsh, then open <strong>Settings &rarr; Account &rarr; Delete account</strong>.
          Confirm the deletion when prompted. This deletes the account and its associated Warsh
          database records.
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-navy/10 bg-parchment-bg p-6">
        <h2 className="font-display text-lg font-semibold text-navy">
          Request deletion without the app
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-deep">
          Email us from the address registered to your Warsh account. Use the subject{' '}
          <strong>Warsh account deletion request</strong> and state that you want the account
          deleted. We may ask you to verify control of the account before completing the request.
        </p>
        <a
          href="mailto:support@warsh.app?subject=Warsh%20account%20deletion%20request&body=Please%20delete%20the%20Warsh%20account%20registered%20to%20this%20email%20address."
          className="mt-4 inline-block rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-cream-bg"
        >
          Email deletion request
        </a>
      </div>

      <H2>Data deleted with the account</H2>
      <UL>
        <LI>name, email, account preferences, and authentication record;</LI>
        <LI>lesson, vocabulary, streak, achievement, and Tadabbur progress;</LI>
        <LI>Ustaad Noor messages and responses;</LI>
        <LI>Warsh subscription fields, Noor credit balance, and purchase-verification records; and</LI>
        <LI>other database records associated with the Warsh account.</LI>
      </UL>

      <H2>Limited retention and Google Play</H2>
      <P>
        Limited security, fraud-prevention, transaction, backup, or legal records may be retained
        where reasonably necessary or required by law, as described in the{' '}
        <A href="/privacy">Warsh Privacy Policy</A>. Data retained independently by Google Play
        or another provider is governed by that provider&rsquo;s policy.
      </P>
      <P>
        Deleting a Warsh account does not automatically cancel a Google Play subscription. Manage
        or cancel subscriptions separately in Google Play.
      </P>

      <H2>Need help?</H2>
      <P>
        Contact <A href="mailto:support@warsh.app">support@warsh.app</A>.
      </P>
    </LegalLayout>
  );
}
