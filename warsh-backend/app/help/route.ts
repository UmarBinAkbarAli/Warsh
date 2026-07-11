import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Help & FAQ — Warsh</title>
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
    .subtitle {
      font-size: 15px;
      color: #6b5e52;
      margin-bottom: 32px;
    }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #8a7060;
      margin-bottom: 12px;
    }
    .faq-item {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #d4b896;
      margin-bottom: 10px;
      overflow: hidden;
    }
    .faq-q {
      padding: 16px 20px;
      font-size: 15px;
      font-weight: 600;
      color: #1a1a2e;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: 1.4;
    }
    .faq-q::after {
      content: '+';
      font-size: 20px;
      color: #C8972B;
      font-weight: 400;
      flex-shrink: 0;
      margin-left: 12px;
    }
    .faq-item.open .faq-q::after {
      content: '\\2212';
    }
    .faq-a {
      display: none;
      padding: 0 20px 16px;
      font-size: 14px;
      color: #4a3f35;
      line-height: 1.7;
    }
    .faq-item.open .faq-a {
      display: block;
    }
    .contact-box {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #d4b896;
      padding: 24px 20px;
      text-align: center;
      margin-top: 32px;
    }
    .contact-box h3 {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 8px;
    }
    .contact-box p {
      font-size: 14px;
      color: #4a3f35;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .contact-btn {
      display: inline-block;
      background: #C8972B;
      color: #fff;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
    }
    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #d4b896;
      font-size: 13px;
      color: #8a7060;
      text-align: center;
    }
    .footer-brand { font-size: 16px; font-weight: 700; color: #C8972B; margin-bottom: 8px; }
    .footer-links { margin-bottom: 8px; }
    .footer-links a { color: #8a7060; text-decoration: none; margin: 0 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">Warsh &middot; وَرْش <span>&mdash; Where Arabic is crafted.</span></div>

    <h1>Help & FAQ</h1>
    <p class="subtitle">Find answers to common questions about Warsh below. Can't find what you need? Reach out to us directly.</p>

    <!-- Subscription -->
    <div class="section-label">Subscriptions & Billing</div>

    <div class="faq-item">
      <div class="faq-q">How does the free trial work?</div>
      <div class="faq-a">Every new account starts with 7 full days of free access to all Warsh features. Your trial begins the moment you create an account, and you may explore as much of the 72-chapter course as you can during those 7 days. Chapter progress never ends the trial early. After 7 days, you will need a paid subscription to continue accessing lessons, Noor, and Tadabbur; the Vocabulary Bank remains free.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">How do I cancel my subscription?</div>
      <div class="faq-a">You cancel directly in your device's app store settings. On Android, open Google Play Store &rarr; tap your profile icon &rarr; <em>Payments & subscriptions</em> &rarr; <em>Subscriptions</em> &rarr; Warsh &rarr; <em>Cancel subscription</em>. On iOS, go to Settings &rarr; Apple ID &rarr; <em>Subscriptions</em> &rarr; Warsh &rarr; Cancel. Your access continues until the end of your current billing period.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Can I get a refund?</div>
      <div class="faq-a">Refunds are handled by Apple and Google according to their policies. Please contact your app store's support directly to request a refund. We are unable to process refunds ourselves.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">What happens to my Vocabulary Bank if I cancel?</div>
      <div class="faq-a">The Vocabulary Bank stays free forever, even after your subscription ends or is cancelled. You will never lose access to the words you have already learned.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">I subscribed but don't have access. What do I do?</div>
      <div class="faq-a">First, try tapping &ldquo;Restore purchases&rdquo; on the subscription paywall screen in the app. If that doesn't work, email us at <a href="mailto:support@warsh.app">support@warsh.app</a> with the email address registered to your account and we will investigate.</div>
    </div>

    <!-- Account -->
    <div class="section-label" style="margin-top: 24px;">Account & Access</div>

    <div class="faq-item">
      <div class="faq-q">I forgot my password. How do I reset it?</div>
      <div class="faq-a">On the Warsh login screen, tap &ldquo;Forgot password?&rdquo; and enter the email address registered to your account. You will receive a reset link within a few minutes. If you don't see it, check your spam or junk folder.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">How do I delete my account?</div>
      <div class="faq-a">Open the Warsh app &rarr; go to the You tab &rarr; Settings &rarr; Account &rarr; Delete account. This is permanent and cannot be undone. All your personal data will be removed from our servers within 30 days.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Can I use Warsh on multiple devices?</div>
      <div class="faq-a">Yes. As long as you log in with the same account on all your devices, your progress, streaks, and subscription sync automatically. Purchases are tied to your app store account and can be restored on any device signed into the same store account.</div>
    </div>

    <!-- Learning -->
    <div class="section-label" style="margin-top: 24px;">Learning</div>

    <div class="faq-item">
      <div class="faq-q">How is Warsh different from other Arabic learning apps?</div>
      <div class="faq-a">Warsh is built around the Madinah Arabic Reader curriculum &mdash; the same structured path used in Islamic universities for over 50 years. Unlike apps that teach random vocabulary or modern dialect, Warsh teaches classical Fus'ha Arabic of the Quran, structured around the Quran itself. It also includes Ustaad Noor, an AI tutor who knows the curriculum deeply and can answer your questions in context.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">What level of Arabic do I need to start?</div>
      <div class="faq-a">None. Warsh is designed for complete beginners who want to learn the Arabic of the Quran from scratch. Our placement test ensures you start at the right chapter for your level.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">I already know some Arabic. Is Warsh still for me?</div>
      <div class="faq-a">Yes. Warsh includes a placement test that can place you at Chapter 4, 6, or 8 depending on what you already know. Even if you can read basic Arabic but want to understand grammar and Quranic structure, Warsh will help.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">What is Ustaad Noor?</div>
      <div class="faq-a">Ustaad Noor is our AI-powered Arabic tutor inside the app. You can ask him anything about Arabic grammar, vocabulary, or the Quranic context of a word. He knows the Warsh curriculum deeply. You get 5 free messages with him per day; additional message packs can be purchased inside the app.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Does Warsh teach speaking Arabic?</div>
      <div class="faq-a">Yes. Warsh includes speaking practice lessons (SHADOW_REPEAT and SPOKEN_PHRASES) where you listen to native pronunciation and practice saying it yourself. While Warsh does not currently use speech recognition for pronunciation grading, audio playback and shadow practice help build spoken Fus'ha fluency over time.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">What is the Vocabulary Bank?</div>
      <div class="faq-a">The Vocabulary Bank is a free feature containing 600+ Arabic words with audio pronunciation, English and Urdu translations, and Quranic examples. It uses spaced repetition (SM-2 algorithm) to help you retain words long-term. The Vocabulary Bank is free forever, even without a subscription.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">What is Tadabbur?</div>
      <div class="faq-a">Tadabbur is Warsh's feature for understanding the Quran word by word. As you complete chapters, you unlock Surahs to study. Vocabulary words from your lessons light up inside real Quranic ayat, so you see exactly how each word functions in context.</div>
    </div>

    <!-- Technical -->
    <div class="section-label" style="margin-top: 24px;">Technical</div>

    <div class="faq-item">
      <div class="faq-q">The app isn't loading lessons. What do I do?</div>
      <div class="faq-a">First, check that you have a stable internet connection. If the problem persists, try closing and reopening the app. If the issue continues, email us at <a href="mailto:support@warsh.app">support@warsh.app</a> with your device model, OS version, and the lesson you were trying to open.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">The audio doesn't play. What should I do?</div>
      <div class="faq-a">Check that your device's volume is turned up and that audio permission is granted to the Warsh app. If audio still doesn't play, try closing and reopening the app. If the issue persists, contact support.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Which devices does Warsh support?</div>
      <div class="faq-a">Warsh currently supports Android devices running Android 8 (API 26) or later. iOS support is planned for a future release.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">I found an error in the content. What do I do?</div>
      <div class="faq-a">If you find a mistake in a lesson, vocabulary entry, or any Arabic text, please email us at <a href="mailto:support@warsh.app">support@warsh.app</a> with the chapter, lesson number, and a description of the issue.</div>
    </div>

    <!-- Contact -->
    <div class="contact-box">
      <h3>Still need help?</h3>
      <p>Email us at <a href="mailto:support@warsh.app">support@warsh.app</a> and we will get back to you as soon as possible, in sha Allah.</p>
      <a class="contact-btn" href="mailto:support@warsh.app">Email support</a>
    </div>

    <div class="footer">
      <div class="footer-brand">Warsh &middot; وَرْش</div>
      <div class="footer-links">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
      </div>
      <p>Where Arabic is crafted.</p>
    </div>
  </div>

  <script>
    document.querySelectorAll('.faq-q').forEach(function(q) {
      q.addEventListener('click', function() {
        var item = q.parentElement;
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(function(el) { el.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });
    });
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
