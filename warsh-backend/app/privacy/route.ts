import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Privacy Policy — Warsh</title>
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
    .brand span {
      color: #1a1a2e;
      font-weight: 400;
    }
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

    <h1>Privacy Policy</h1>
    <p class="last-updated">Last updated: May 30, 2026</p>

    <p>Warsh (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices you have when you use the Warsh mobile application and our related services (together, the &ldquo;Service&rdquo;).</p>

    <h2>1. Information We Collect</h2>
    <p><strong>Account information:</strong> When you register for Warsh, we collect your email address and the name you provide. We do not require a phone number or real name.</p>
    <p><strong>Onboarding information:</strong> We collect your learning goal, native language, current Arabic level, and placement test responses to personalize your learning path.</p>
    <p><strong>Lesson progress:</strong> We record which lessons you complete, your quiz answers, streaks, XP, and achievements to track your learning progress.</p>
    <p><strong>Vocabulary data:</strong> We track the vocabulary words you have encountered and your spaced-repetition review history for those words.</p>
    <p><strong>Chat messages:</strong> Messages you exchange with Ustaad Noor (our AI tutor) are stored for up to 180 days and are used only to power that conversation. These messages are never used to train AI models.</p>
    <p><strong>Device and usage data:</strong> We collect basic device information (model, OS version, app version) and anonymous usage metrics to improve the app. This data is aggregated and non-identifying where possible.</p>

    <h2>2. How We Use Your Information</h2>
    <p>We use your information to:</p>
    <ul>
      <li>Provide and maintain the Warsh Service</li>
      <li>Track your lesson progress and learning streaks</li>
      <li>Deliver AI-powered tutoring via Ustaad Noor</li>
      <li>Manage your subscription and process payments</li>
      <li>Send you in-app notifications as described in the app</li>
      <li>Detect and address technical issues</li>
      <li>Improve and personalize the learning experience</li>
    </ul>

    <h2>3. Information We Do <em>Not</em> Collect</h2>
    <p>We do not collect precise location data, contacts, photos, or camera recordings. Voice audio captured during speaking practice stays on your device and is never uploaded or stored on our servers.</p>

    <h2>4. How We Share Your Information</h2>
    <p>We do not sell, trade, or rent your personal information to third parties. We share data only in these limited circumstances:</p>
    <ul>
      <li><strong>Service providers:</strong> We use trusted vendors (Neon (database), Vercel (hosting), OpenAI (AI), and Cloudflare (CDN)) who process your data only to deliver the Service.</li>
      <li><strong>App Store and Play Store:</strong> Payment processing is handled entirely by Apple and Google. We do not store payment card information.</li>
      <li><strong>Legal requirements:</strong> We may disclose information if required by law, such as in response to a court order or regulatory request.</li>
    </ul>

    <h2>5. Data Retention</h2>
    <p>Your account data is retained for as long as your account is active. You may request deletion of your account at any time from within the app (Settings &rarr; Account &rarr; Delete account). Upon deletion, all your personal data is removed from our servers within 30 days.</p>
    <p>Chat messages are automatically deleted after 180 days.</p>

    <h2>6. Your Rights</h2>
    <p>You have the right to access, correct, or delete your personal data at any time through the app or by emailing <a href="mailto:support@warsh.app">support@warsh.app</a>.</p>
    <p>You may also request a copy of the data we hold about you by contacting the same email.</p>

    <h2>7. Children's Privacy</h2>
    <p>Warsh is not directed to users under the age of 13, and we do not knowingly collect information children under 13.</p>

    <h2>8. Data Security</h2>
    <p>We use industry-standard encryption (HTTPS/TLS) for all data in transit. Data at rest is encrypted by our cloud providers (Neon, Cloudflare). No method of electronic transmission or storage is 100% secure, but we follow established best practices to protect your data.</p>

    <h2>9. Changes to This Policy</h2>
    <p>If we change this Privacy Policy, we will update the &ldquo;Last updated&rdquo; date and, for material changes, notify you by posting a notice within the app.</p>

    <h2>10. Contact Us</h2>
    <p>If you have questions about this Privacy Policy, contact us at <a href="mailto:support@warsh.app">support@warsh.app</a>.</p>

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
