import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Terms of Service — Warsh</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #F4EBD0;
      min-height: 100vh;
      padding: 40px 24px 80px;
    }
    .container {
      max-width: 680px;
      margin: 0 auto;
    }
    .brand {
      font-size: 22px;
      font-weight: 700;
      color: #C8972B;
      letter-spacing: -0.5px;
      margin-bottom: 32px;
    }
    .brand span { color: #1a1a2e; font-weight: 400; }
    h1 {
      font-size: 26px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 8px;
    }
    .last-updated {
      font-size: 13px;
      color: #8a7060;
      margin-bottom: 32px;
    }
    h2 {
      font-size: 17px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 28px 0 10px;
    }
    p, li {
      font-size: 14px;
      color: #4a3f35;
      line-height: 1.7;
      margin-bottom: 10px;
    }
    ul { padding-left: 20px; }
    li { margin-bottom: 6px; }
    a { color: #C8972B; text-decoration: underline; }
    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #d4b896;
      font-size: 13px;
      color: #8a7060;
      text-align: center;
    }
    .footer-brand { font-size: 16px; font-weight: 700; color: #C8972B; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">Warsh &middot; وَرْش <span>&mdash; Where Arabic is crafted.</span></div>

    <h1>Terms of Service</h1>
    <p class="last-updated">Last updated: May 30, 2026</p>

    <p>Welcome to Warsh. By using the Warsh mobile application and related services (the &ldquo;Service&rdquo;), you agree to the following terms. Please read them carefully.</p>

    <h2>1. Acceptance of Terms</h2>
    <p>By creating an account or using any part of the Service, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and our Privacy Policy. If you do not agree to these Terms, do not use the Service.</p>

    <h2>2. The Service</h2>
    <p>Warsh is a mobile application that teaches classical Arabic through interactive lessons, an AI-powered tutor (Ustaad Noor), a vocabulary bank, and related features. Warsh is offered as a subscription service with a free trial period.</p>
    <p>Warsh strives for accuracy in all educational content, but the Service is provided &ldquo;as is.&rdquo; We do not guarantee that the content is free from all errors or omissions. If you notice a mistake in any content, please contact us at <a href="mailto:support@warsh.app">support@warsh.app</a>.</p>

    <h2>3. Your Account</h2>
    <p>You are responsible for keeping your account credentials secure. You must be at least 13 years old to create an account. You are responsible for all activity that occurs under your account. If you believe your account has been compromised, notify us immediately at <a href="mailto:support@warsh.app">support@warsh.app</a>.</p>
    <p>Warsh reserves the right to suspend or terminate accounts that violate these Terms, including accounts used for fraudulent, abusive, or prohibited purposes.</p>

    <h2>4. Subscriptions and Billing</h2>
    <p>Warsh offers monthly and annual paid subscriptions. A free trial of seven days is available for new accounts. The trial period is governed by the terms described in our app.</p>
    <p>Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period. You can cancel your subscription at any time through your device&rsquo;s app store settings. Upon cancellation, you retain access to the paid Service until the end of your current billing period.</p>
    <p>All payments are processed by Apple (iOS) or Google (Android). Warsh does not store payment card information. Refund requests are handled by Apple and Google according to their own policies.</p>

    <h2>5. Free Vocabulary Bank</h2>
    <p>The Warsh Vocabulary Bank, including all vocabulary words, audio playback, and spaced-repetition review features, remains free for all users even after a subscription expires or is cancelled. This is a permanent offering and will not change without notice.</p>

    <h2>6. Acceptable Use</h2>
    <p>You agree not to:</p>
    <ul>
      <li>Use the Service for any unlawful or fraudulent purpose</li>
      <li>Attempt to reverse-engineer, decompile, or disassemble any part of the app</li>
      <li>Use automated tools to access or scrape the Service without our permission</li>
      <li>Share content from the Service (including AI tutor responses) as your own</li>
      <li>Impersonate Warsh or our team members</li>
      <li>Harass, abuse, or harm other users of the Service</li>
    </ul>

    <h2>7. Intellectual Property</h2>
    <p>The Warsh app, its content, design, branding, and all related materials are owned by Warsh and protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service for personal, non-commercial learning purposes.</p>
    <p>You retain ownership of content you submit to the Service (such as profile information). You grant us a license to use that content solely to deliver the Service.</p>
    <p>Content sourced from the Quran and classical Arabic texts is in the public domain. Our presentation and organization of that content is proprietary.</p>

    <h2>8. AI Tutor (Ustaad Noor)</h2>
    <p>Ustaad Noor is an AI assistant designed to support Arabic learning. Responses from Ustaad Noor reflect AI-generated content and should not be treated as religious rulings or scholarly fatwas. Users are encouraged to verify religious content with a qualified scholar.</p>
    <p>Chat messages with Ustaad Noor are stored for up to 180 days and are used only to deliver the tutoring service. They are never used to train AI models.</p>

    <h2>9. Data and Privacy</h2>
    <p>Your privacy is important to us. Please review our <a href="/privacy">Privacy Policy</a> to understand what information we collect and how we use it. By using the Service, you consent to our data practices as described in the Privacy Policy.</p>

    <h2>10. Subscription Restriction</h2>
    <p>Your use of the Service is limited to one account per subscription. Sharing account access with others or using a subscription across multiple accounts simultaneously may result in account suspension.</p>

    <h2>11. Disclaimers and Limitation of Liability</h2>
    <p>The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, whether express or implied. We do not warrant that the Service will be uninterrupted, error-free, or secure at all times.</p>
    <p>To the fullest extent permitted by law, Warsh shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, or goodwill, arising out of or related to your use of the Service.</p>
    <p>In any event, Warsh&rsquo;s total liability shall not exceed the total amount you have paid for the Service in the twelve (12) months preceding the event giving rise to the claim.</p>

    <h2>12. Modifications to the Service and Terms</h2>
    <p>We may modify the Service or these Terms at any time. For material changes, we will provide notice through the app or by updating the &ldquo;Last updated&rdquo; date above. Your continued use of the Service after any modification constitutes your acceptance of the updated Terms.</p>

    <h2>13. Governing Law</h2>
    <p>These Terms shall be governed by and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions. You agree to submit to the exclusive jurisdiction of the courts of Pakistan.</p>

    <h2>14. Account Deletion</h2>
    <p>You may delete your account at any time from within the app (Settings &rarr; Account &rarr; Delete account). Upon deletion, all your personal data will be removed from our servers within 30 days. Your subscription will continue on your app store account until you cancel it separately.</p>

    <h2>15. Contact Us</h2>
    <p>If you have questions about these Terms, contact us at <a href="mailto:support@warsh.app">support@warsh.app</a>.</p>

    <div class="footer">
      <div class="footer-brand">Warsh &middot; وَرْش</div>
      <p>Where Arabic is crafted.</p>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
