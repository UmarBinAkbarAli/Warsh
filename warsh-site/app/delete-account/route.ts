import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Delete Your Warsh Account</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; padding: 40px 24px 80px; background: #F4EBD0; color: #4a3f35; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    main { max-width: 680px; margin: 0 auto; }
    .brand { margin-bottom: 32px; color: #C8972B; font-size: 22px; font-weight: 700; }
    h1, h2 { color: #1a1a2e; }
    h1 { margin: 0 0 12px; font-size: 30px; }
    h2 { margin: 30px 0 8px; font-size: 18px; }
    p, li { font-size: 15px; line-height: 1.7; }
    li { margin-bottom: 8px; }
    .card { margin: 24px 0; padding: 24px; border: 1px solid #d4b896; border-radius: 16px; background: #fffaf0; }
    .button { display: inline-block; margin-top: 10px; padding: 12px 18px; border-radius: 10px; background: #1a1a2e; color: #fff; font-weight: 700; text-decoration: none; }
    a { color: #8A5E0B; }
  </style>
</head>
<body>
  <main>
    <div class="brand">Warsh &middot; &#x648;&#x64E;&#x631;&#x652;&#x634;</div>
    <h1>Delete your Warsh account</h1>
    <p>This page is the external account-deletion resource for the Warsh app (<strong>com.warsh.app</strong>) by Umar Bin Akbar Ali.</p>

    <div class="card">
      <h2>Fastest method: delete inside the app</h2>
      <p>Sign in to Warsh, then open <strong>Settings &rarr; Account &rarr; Delete account</strong>. Confirm the deletion when prompted. This deletes the account and its associated Warsh database records.</p>
    </div>

    <div class="card">
      <h2>Request deletion without the app</h2>
      <p>Email us from the address registered to your Warsh account. Use the subject <strong>Warsh account deletion request</strong> and state that you want the account deleted. We may ask you to verify control of the account before completing the request.</p>
      <a class="button" href="mailto:support@warsh.app?subject=Warsh%20account%20deletion%20request&body=Please%20delete%20the%20Warsh%20account%20registered%20to%20this%20email%20address.">Email deletion request</a>
    </div>

    <h2>Data deleted with the account</h2>
    <ul>
      <li>name, email, account preferences, and authentication record;</li>
      <li>lesson, vocabulary, streak, achievement, and Tadabbur progress;</li>
      <li>Ustaad Noor messages and responses;</li>
      <li>Warsh subscription fields, Noor credit balance, and purchase-verification records; and</li>
      <li>other database records associated with the Warsh account.</li>
    </ul>

    <h2>Limited retention and Google Play</h2>
    <p>Limited security, fraud-prevention, transaction, backup, or legal records may be retained where reasonably necessary or required by law, as described in the <a href="/privacy">Warsh Privacy Policy</a>. Data retained independently by Google Play or another provider is governed by that provider's policy.</p>
    <p>Deleting a Warsh account does not automatically cancel a Google Play subscription. Manage or cancel subscriptions separately in Google Play.</p>

    <h2>Need help?</h2>
    <p>Contact <a href="mailto:support@warsh.app">support@warsh.app</a>.</p>
  </main>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
