import type { Metadata } from 'next';
import { LegalLayout, H2, P, UL, LI, A } from '../components/LegalLayout';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of the Warsh app and related services.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" meta="Last updated: July 20, 2026">
      <P>
        Welcome to Warsh. By using the Warsh mobile application and related services (the
        &ldquo;Service&rdquo;), you agree to the following terms. Please read them carefully.
      </P>

      <H2>1. Acceptance of Terms</H2>
      <P>
        By creating an account or using any part of the Service, you agree to be bound by these
        Terms of Service (&ldquo;Terms&rdquo;) and our{' '}
        <A href="/privacy">Privacy Policy</A>. If you do not agree to these Terms, do not use the
        Service.
      </P>

      <H2>2. The Service</H2>
      <P>
        Warsh is a mobile application that teaches classical Arabic through interactive lessons,
        an AI-powered tutor (Ustaad Noor), a vocabulary bank, and related features. Warsh is
        offered as a subscription service with a free trial period.
      </P>
      <P>
        Warsh strives for accuracy in all educational content, but the Service is provided
        &ldquo;as is.&rdquo; We do not guarantee that the content is free from all errors or
        omissions. If you notice a mistake in any content, please contact us at{' '}
        <A href="mailto:support@warsh.app">support@warsh.app</A>.
      </P>

      <H2>3. Your Account</H2>
      <P>
        You are responsible for keeping your account credentials secure. You must be at least 13
        years old to create an account. You are responsible for all activity that occurs under
        your account. If you believe your account has been compromised, notify us immediately at{' '}
        <A href="mailto:support@warsh.app">support@warsh.app</A>.
      </P>
      <P>
        Warsh reserves the right to suspend or terminate accounts that violate these Terms,
        including accounts used for fraudulent, abusive, or prohibited purposes.
      </P>

      <H2>4. Subscriptions and Billing</H2>
      <P>
        Warsh offers monthly and annual paid subscriptions. A free trial of seven days is
        available for new accounts. The trial period is governed by the terms described in our
        app.
      </P>
      <P>
        Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current
        period. You can cancel your subscription at any time through your device&rsquo;s app
        store settings. Upon cancellation, you retain access to the paid Service until the end of
        your current billing period.
      </P>
      <P>
        All payments are processed by Apple (iOS) or Google (Android). Warsh does not store
        payment card information. Refund requests are handled by Apple and Google according to
        their own policies.
      </P>

      <H2>5. Free Vocabulary Bank</H2>
      <P>
        The Warsh Vocabulary Bank, including all vocabulary words, audio playback, and
        spaced-repetition review features, remains free for all users even after a subscription
        expires or is cancelled. This is a permanent offering and will not change without notice.
      </P>

      <H2>6. Acceptable Use</H2>
      <P>You agree not to:</P>
      <UL>
        <LI>Use the Service for any unlawful or fraudulent purpose</LI>
        <LI>Attempt to reverse-engineer, decompile, or disassemble any part of the app</LI>
        <LI>Use automated tools to access or scrape the Service without our permission</LI>
        <LI>Share content from the Service (including AI tutor responses) as your own</LI>
        <LI>Impersonate Warsh or our team members</LI>
        <LI>Harass, abuse, or harm other users of the Service</LI>
      </UL>

      <H2>7. Intellectual Property</H2>
      <P>
        The Warsh app, its content, design, branding, and all related materials are owned by
        Warsh and protected by intellectual property laws. You are granted a limited,
        non-exclusive, non-transferable license to use the Service for personal, non-commercial
        learning purposes.
      </P>
      <P>
        You retain ownership of content you submit to the Service (such as profile information).
        You grant us a license to use that content solely to deliver the Service.
      </P>
      <P>
        Content sourced from the Quran and classical Arabic texts is in the public domain. Our
        presentation and organization of that content is proprietary.
      </P>

      <H2>8. AI Tutor (Ustaad Noor)</H2>
      <P>
        Ustaad Noor is an AI assistant designed to support Arabic learning. Responses from Ustaad
        Noor reflect AI-generated content and should not be treated as religious rulings or
        scholarly fatwas. Users are encouraged to verify religious content with a qualified
        scholar.
      </P>
      <P>
        Chat messages with Ustaad Noor are retained while your Warsh account is active so the
        visible conversation can continue across sessions. They are used to deliver and maintain
        the tutoring service and are deleted with your Warsh account, subject to the limited
        retention described in the Privacy Policy.
      </P>

      <H2>9. Data and Privacy</H2>
      <P>
        Your privacy is important to us. Please review our <A href="/privacy">Privacy Policy</A>{' '}
        to understand what information we collect and how we use it. By using the Service, you
        consent to our data practices as described in the Privacy Policy.
      </P>

      <H2>10. Subscription Restriction</H2>
      <P>
        Your use of the Service is limited to one account per subscription. Sharing account
        access with others or using a subscription across multiple accounts simultaneously may
        result in account suspension.
      </P>

      <H2>11. Disclaimers and Limitation of Liability</H2>
      <P>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
        warranties of any kind, whether express or implied. We do not warrant that the Service
        will be uninterrupted, error-free, or secure at all times.
      </P>
      <P>
        To the fullest extent permitted by law, Warsh shall not be liable for any indirect,
        incidental, special, consequential, or punitive damages, or any loss of data, profits, or
        goodwill, arising out of or related to your use of the Service.
      </P>
      <P>
        In any event, Warsh&rsquo;s total liability shall not exceed the total amount you have
        paid for the Service in the twelve (12) months preceding the event giving rise to the
        claim.
      </P>

      <H2>12. Modifications to the Service and Terms</H2>
      <P>
        We may modify the Service or these Terms at any time. For material changes, we will
        provide notice through the app or by updating the &ldquo;Last updated&rdquo; date above.
        Your continued use of the Service after any modification constitutes your acceptance of
        the updated Terms.
      </P>

      <H2>13. Governing Law</H2>
      <P>
        These Terms shall be governed by and construed in accordance with the laws of Pakistan,
        without regard to its conflict of law provisions. You agree to submit to the exclusive
        jurisdiction of the courts of Pakistan.
      </P>

      <H2>14. Account Deletion</H2>
      <P>
        You may delete your account at any time from within the app (Settings &rarr; Account
        &rarr; Delete account) or use the external deletion resource linked in our Privacy
        Policy. Deleting your Warsh account removes its associated Warsh database records.
        Limited security, fraud-prevention, transaction, backup, or legal records may be retained
        where reasonably necessary or required by law, as described in the Privacy Policy. Your
        subscription will continue on your app store account until you cancel it separately.
      </P>

      <H2>15. Contact Us</H2>
      <P>
        If you have questions about these Terms, contact us at{' '}
        <A href="mailto:support@warsh.app">support@warsh.app</A>.
      </P>
    </LegalLayout>
  );
}
