import { NextResponse } from "next/server";

// Web landing page for password reset links.
// Email → clicks link → opens this page → page opens warsh:// deep link → app handles it.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";

  const encodedToken = encodeURIComponent(token);
  const deepLink = `warsh://reset-password?token=${encodedToken}`;
  // Android intent URI (works when app is installed; falls back gracefully)
  const intentUri = `intent://reset-password?token=${encodedToken}#Intent;scheme=warsh;package=com.warsh.app;end`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your Warsh password</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #F4EBD0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      padding: 40px 32px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .brand {
      font-size: 28px;
      font-weight: 700;
      color: #C8972B;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 24px 0 12px;
    }
    .body {
      font-size: 15px;
      color: #6b5e52;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .btn {
      display: block;
      background: #C8972B;
      color: #fff;
      text-decoration: none;
      padding: 16px 24px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 16px;
      transition: opacity 0.15s;
    }
    .btn:active { opacity: 0.85; }
    .note {
      font-size: 13px;
      color: #8a7060;
      line-height: 1.5;
    }
    .expired {
      color: #c0392b;
      font-size: 14px;
      margin-top: 12px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">Warsh · وَرْش</div>
    <div class="title">Reset your password</div>
    <p class="body">
      Tap the button below to open the Warsh app and set a new password.<br>
      This link expires in 1 hour.
    </p>
    ${token ? `<a class="btn" href="${intentUri}" id="open-btn">Open Warsh app</a>` : `<p style="color:#c0392b;font-weight:700;">Invalid or missing reset token.</p>`}
    <p class="note">
      If the app doesn't open, make sure Warsh is installed on this device.
    </p>
    <p class="expired" id="expired-msg">
      This link may have expired. Please request a new one from the app.
    </p>
  </div>
  <script>
    // Auto-open the app on page load
    (function() {
      var token = ${JSON.stringify(token)};
      if (!token) return;
      var deepLink = ${JSON.stringify(deepLink)};
      var intentUri = ${JSON.stringify(intentUri)};

      // Try the intent URI first (Android), fall back to scheme
      var isAndroid = /android/i.test(navigator.userAgent);
      window.location.href = isAndroid ? intentUri : deepLink;

      // If still on page after 2.5s, show the button prominently
      setTimeout(function() {
        var btn = document.getElementById('open-btn');
        if (btn) btn.style.boxShadow = '0 0 0 3px rgba(200,151,43,0.35)';
      }, 2500);
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
