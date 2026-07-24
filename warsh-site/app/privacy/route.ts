import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Privacy Policy - Warsh</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F4EBD0; min-height: 100vh; padding: 40px 24px 80px; margin: 0; }
    .container { max-width: 760px; margin: 0 auto; }
    .brand { font-size: 22px; font-weight: 700; color: #C8972B; margin-bottom: 32px; }
    .brand span { color: #1a1a2e; font-weight: 400; }
    h1 { font-size: 28px; color: #1a1a2e; margin: 0 0 8px; }
    .last-updated { font-size: 13px; color: #8a7060; margin-bottom: 32px; }
    h2 { font-size: 18px; color: #1a1a2e; margin: 30px 0 10px; }
    p, li { font-size: 14px; color: #4a3f35; line-height: 1.7; }
    li { margin-bottom: 8px; }
    a { color: #9A6B13; text-decoration: underline; }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #d4b896; color: #8a7060; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">Warsh &middot; &#x648;&#x64E;&#x631;&#x652;&#x634; <span>&mdash; Where Arabic is crafted.</span></div>
    <h1>Privacy Policy</h1>
    <p class="last-updated"><strong>App:</strong> Warsh &middot; <strong>Package:</strong> com.warsh.app &middot; <strong>Developer:</strong> Umar Bin Akbar Ali<br />Last updated: July 20, 2026</p>

    <h2>1. Scope</h2>
    <p>This Privacy Policy explains how Warsh (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) accesses, collects, uses, shares, retains, and deletes information when you use the Warsh mobile application and related services (the &ldquo;Service&rdquo;).</p>

    <h2>2. Information We Collect</h2>
    <ul>
      <li><strong>Account and authentication data:</strong> the name and email address you provide, an internal user ID, a securely hashed password, preferred language, learning goal, level, placement choice, and daily goal.</li>
      <li><strong>Learning and app activity:</strong> lesson progress, answers and scores, XP, streaks, achievements, vocabulary and spaced-repetition history, Tadabbur progress, feature usage, and related app-interaction events.</li>
      <li><strong>Ustaad Noor messages:</strong> messages you send to the AI tutor and its responses. Recent messages may be used as context so the conversation can continue across sessions.</li>
      <li><strong>Purchase and entitlement data:</strong> Google Play product IDs, subscription status and expiry, purchase or order identifiers, a purchase-token value used to verify subscriptions, hashed one-time-purchase tokens, quantities, and credits granted. Google processes payment-card details; Warsh does not receive or store your full card number.</li>
      <li><strong>Diagnostics, analytics, and device data:</strong> app version, operating system and device information, pseudonymous user ID, crash and performance diagnostics, IP/network information processed by hosting providers, and app-interaction events used to operate, secure, troubleshoot, and improve the Service.</li>
      <li><strong>Support and security communications:</strong> information you include in support requests and records needed to send password-reset or account-security emails.</li>
    </ul>

    <h2>3. Microphone and Voice Recordings</h2>
    <p>Some speaking exercises request microphone permission after showing an in-app explanation. A voice recording created for shadow-speaking comparison remains in the app&rsquo;s local storage, is used only for playback and comparison on that device, and is deleted when you discard it, restart the exercise, advance, or leave the exercise. Warsh does not upload that raw recording to our servers or analytics providers.</p>

    <h2>4. How We Use Information</h2>
    <ul>
      <li>create and secure your account and provide the Service;</li>
      <li>personalize lessons and track learning progress;</li>
      <li>generate and preserve the visible Ustaad Noor conversation;</li>
      <li>verify Google Play purchases, grant entitlements or Noor credits, prevent duplicate grants, and support purchase restoration;</li>
      <li>send requested password-reset and account-security messages;</li>
      <li>measure feature usage, diagnose crashes, monitor performance, prevent abuse, and improve the Service; and</li>
      <li>comply with legal obligations and enforce our terms.</li>
    </ul>

    <h2>5. Service Providers and Data Sharing</h2>
    <p>We do not sell personal information and we do not use it for third-party advertising. We disclose data only as needed to operate the Service, process a user-requested feature, comply with law, or protect the Service. Our processors include:</p>
    <ul>
      <li><strong>OpenAI:</strong> receives Ustaad Noor message content and recent conversation context to generate tutor responses.</li>
      <li><strong>Mixpanel:</strong> receives a pseudonymous user ID, app-interaction events, and learning or subscription properties for product analytics. Raw Noor message text and voice recordings are not intentionally sent to Mixpanel.</li>
      <li><strong>Sentry:</strong> receives a pseudonymous user ID, crash reports, performance traces, app/device context, and scrubbed diagnostic details. Warsh filters common credential, email, token, message, prompt, transcript, and text fields before sending events.</li>
      <li><strong>Neon and Vercel:</strong> provide database, application hosting, network, and operational-log services.</li>
      <li><strong>Cloudflare:</strong> provides content delivery and media hosting for lesson and vocabulary assets.</li>
      <li><strong>Google Play:</strong> distributes the app, processes purchases, and provides purchase and subscription status used for verification.</li>
      <li><strong>Resend:</strong> sends password-reset and account-security emails when those functions are used.</li>
    </ul>
    <p>These providers may process technical information such as IP address, device/browser details, and request metadata as part of providing their services. They also apply their own privacy terms where they act independently.</p>

    <h2>6. Data Retention</h2>
    <p>Account, learning, Ustaad Noor conversation, and Warsh purchase-verification records are generally retained while your account is active so that progress, conversations, credits, and entitlements remain available across sessions. We may keep limited security, fraud-prevention, transaction, backup, or legal records for longer where reasonably necessary or required by law. Third-party providers retain data under their configured retention periods and applicable terms.</p>
    <p>Local speaking-practice recordings are temporary and are deleted by the app as described in Section 3.</p>

    <h2>7. Account and Data Deletion</h2>
    <p>You can delete your Warsh account from within the app at <strong>Settings &rarr; Account &rarr; Delete account</strong>. You can also initiate an external deletion request at <a href="https://warsh.app/delete-account">https://warsh.app/delete-account</a> or contact <a href="mailto:support@warsh.app">support@warsh.app</a>.</p>
    <p>Deleting your Warsh account deletes the account and associated Warsh database records, including learning progress, vocabulary state, Ustaad Noor messages, achievements, subscription fields, and purchase-verification records. Data already retained independently by Google Play or another provider is governed by that provider&rsquo;s policy. Deleting Warsh does not automatically cancel a Google Play subscription; subscription management remains available through Google Play.</p>

    <h2>8. Security</h2>
    <p>Warsh uses HTTPS/TLS for data in transit, hashes account passwords, restricts protected API access through authentication, and relies on cloud-provider encryption and access controls for stored data. No electronic system is completely secure, but we apply reasonable technical and organizational safeguards appropriate to the data we handle.</p>

    <h2>9. Children&rsquo;s Privacy</h2>
    <p>Warsh is not intended for children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided personal information, contact us so we can investigate and delete it.</p>

    <h2>10. Your Choices and Rights</h2>
    <p>Depending on your location, you may have rights to access, correct, obtain a copy of, object to certain processing of, or delete your personal information. You can disable microphone permission in Android settings and may contact us to exercise a data right.</p>

    <h2>11. Changes to This Policy</h2>
    <p>We may update this Privacy Policy when the Service or legal requirements change. We will update the date above and provide additional notice for material changes when required.</p>

    <h2>12. Contact</h2>
    <p>For privacy questions or requests, contact <a href="mailto:support@warsh.app">support@warsh.app</a>.</p>

    <div class="footer"><strong>Warsh &middot; &#x648;&#x64E;&#x631;&#x652;&#x634;</strong><p>Where Arabic is crafted.</p></div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
