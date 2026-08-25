import type { Metadata } from 'next';
import { LegalLayout, H2, P, UL, LI, A } from '../components/LegalLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Warsh collects, uses, shares, retains, and deletes information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      meta="App: Warsh · Package: com.warsh.app · Developer: Umar Bin Akbar Ali · Last updated: July 20, 2026"
    >
      <H2>1. Scope</H2>
      <P>
        This Privacy Policy explains how Warsh (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
        &ldquo;us&rdquo;) accesses, collects, uses, shares, retains, and deletes information when
        you use the Warsh mobile application and related services (the &ldquo;Service&rdquo;).
      </P>

      <H2>2. Information We Collect</H2>
      <UL>
        <LI>
          <strong>Account and authentication data:</strong> the name and email address you
          provide, an internal user ID, a securely hashed password, preferred language, learning
          goal, level, placement choice, and daily goal.
        </LI>
        <LI>
          <strong>Learning and app activity:</strong> lesson progress, answers and scores, XP,
          streaks, achievements, vocabulary and spaced-repetition history, Tadabbur progress,
          feature usage, and related app-interaction events.
        </LI>
        <LI>
          <strong>Ustaad Noor messages:</strong> messages you send to the AI tutor and its
          responses. Recent messages may be used as context so the conversation can continue
          across sessions.
        </LI>
        <LI>
          <strong>Purchase and entitlement data:</strong> Google Play product IDs, subscription
          status and expiry, purchase or order identifiers, a purchase-token value used to verify
          subscriptions, hashed one-time-purchase tokens, quantities, and credits granted. Google
          processes payment-card details; Warsh does not receive or store your full card number.
        </LI>
        <LI>
          <strong>Diagnostics, analytics, and device data:</strong> app version, operating system
          and device information, pseudonymous user ID, crash and performance diagnostics,
          IP/network information processed by hosting providers, and app-interaction events used
          to operate, secure, troubleshoot, and improve the Service.
        </LI>
        <LI>
          <strong>Support and security communications:</strong> information you include in
          support requests and records needed to send password-reset or account-security emails.
        </LI>
      </UL>

      <H2>3. Microphone and Voice Recordings</H2>
      <P>
        Some speaking exercises request microphone permission after showing an in-app
        explanation. A voice recording created for shadow-speaking comparison remains in the
        app&rsquo;s local storage, is used only for playback and comparison on that device, and
        is deleted when you discard it, restart the exercise, advance, or leave the exercise.
        Warsh does not upload that raw recording to our servers or analytics providers.
      </P>

      <H2>4. How We Use Information</H2>
      <UL>
        <LI>create and secure your account and provide the Service;</LI>
        <LI>personalize lessons and track learning progress;</LI>
        <LI>generate and preserve the visible Ustaad Noor conversation;</LI>
        <LI>
          verify Google Play purchases, grant entitlements or Noor credits, prevent duplicate
          grants, and support purchase restoration;
        </LI>
        <LI>send requested password-reset and account-security messages;</LI>
        <LI>
          measure feature usage, diagnose crashes, monitor performance, prevent abuse, and
          improve the Service; and
        </LI>
        <LI>comply with legal obligations and enforce our terms.</LI>
      </UL>

      <H2>5. Service Providers and Data Sharing</H2>
      <P>
        We do not sell personal information and we do not use it for third-party advertising. We
        disclose data only as needed to operate the Service, process a user-requested feature,
        comply with law, or protect the Service. Our processors include:
      </P>
      <UL>
        <LI>
          <strong>OpenAI:</strong> receives Ustaad Noor message content and recent conversation
          context to generate tutor responses.
        </LI>
        <LI>
          <strong>Mixpanel:</strong> receives a pseudonymous user ID, app-interaction events, and
          learning or subscription properties for product analytics. Raw Noor message text and
          voice recordings are not intentionally sent to Mixpanel.
        </LI>
        <LI>
          <strong>Sentry:</strong> receives a pseudonymous user ID, crash reports, performance
          traces, app/device context, and scrubbed diagnostic details. Warsh filters common
          credential, email, token, message, prompt, transcript, and text fields before sending
          events.
        </LI>
        <LI>
          <strong>Neon and Vercel:</strong> provide database, application hosting, network, and
          operational-log services.
        </LI>
        <LI>
          <strong>Cloudflare:</strong> provides content delivery and media hosting for lesson and
          vocabulary assets.
        </LI>
        <LI>
          <strong>Google Play:</strong> distributes the app, processes purchases, and provides
          purchase and subscription status used for verification.
        </LI>
        <LI>
          <strong>Resend:</strong> sends password-reset and account-security emails when those
          functions are used.
        </LI>
      </UL>
      <P>
        These providers may process technical information such as IP address, device/browser
        details, and request metadata as part of providing their services. They also apply their
        own privacy terms where they act independently.
      </P>

      <H2>6. Data Retention</H2>
      <P>
        Account, learning, Ustaad Noor conversation, and Warsh purchase-verification records are
        generally retained while your account is active so that progress, conversations,
        credits, and entitlements remain available across sessions. We may keep limited security,
        fraud-prevention, transaction, backup, or legal records for longer where reasonably
        necessary or required by law. Third-party providers retain data under their configured
        retention periods and applicable terms.
      </P>
      <P>Local speaking-practice recordings are temporary and are deleted by the app as described in Section 3.</P>

      <H2>7. Account and Data Deletion</H2>
      <P>
        You can delete your Warsh account from within the app at{' '}
        <strong>Settings &rarr; Account &rarr; Delete account</strong>. You can also initiate an
        external deletion request at <A href="https://warsh.app/delete-account">https://warsh.app/delete-account</A>{' '}
        or contact <A href="mailto:support@warsh.app">support@warsh.app</A>.
      </P>
      <P>
        Deleting your Warsh account deletes the account and associated Warsh database records,
        including learning progress, vocabulary state, Ustaad Noor messages, achievements,
        subscription fields, and purchase-verification records. Data already retained
        independently by Google Play or another provider is governed by that provider&rsquo;s
        policy. Deleting Warsh does not automatically cancel a Google Play subscription;
        subscription management remains available through Google Play.
      </P>

      <H2>8. Security</H2>
      <P>
        Warsh uses HTTPS/TLS for data in transit, hashes account passwords, restricts protected
        API access through authentication, and relies on cloud-provider encryption and access
        controls for stored data. No electronic system is completely secure, but we apply
        reasonable technical and organizational safeguards appropriate to the data we handle.
      </P>

      <H2>9. Children&rsquo;s Privacy</H2>
      <P>
        Warsh is not intended for children under 13, and we do not knowingly collect personal
        information from children under 13. If you believe a child under 13 has provided
        personal information, contact us so we can investigate and delete it.
      </P>

      <H2>10. Your Choices and Rights</H2>
      <P>
        Depending on your location, you may have rights to access, correct, obtain a copy of,
        object to certain processing of, or delete your personal information. You can disable
        microphone permission in Android settings and may contact us to exercise a data right.
      </P>

      <H2>11. Changes to This Policy</H2>
      <P>
        We may update this Privacy Policy when the Service or legal requirements change. We will
        update the date above and provide additional notice for material changes when required.
      </P>

      <H2>12. Contact</H2>
      <P>
        For privacy questions or requests, contact <A href="mailto:support@warsh.app">support@warsh.app</A>.
      </P>
    </LegalLayout>
  );
}
