import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";

// Constructed lazily: the Resend client throws when the key is absent, and doing
// that at module scope fails `next build` page-data collection on any deployment
// without RESEND_API_KEY. Every caller below already skips sending when unset.
let client: Resend | null = null;

function getResend(): Resend {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

// Vercel stores an environment value verbatim, so a value pasted straight out
// of a .env file keeps its surrounding quotes. That turned the header into
// `Warsh <"noreply@warsh.app">`, which Resend rejects with a 422
// validation_error — every password reset failed on it. Strip quotes and
// whitespace rather than trusting the value to be clean, and treat an empty
// result as unset so the default still applies.
function cleanAddress(value: string | undefined): string | undefined {
  const cleaned = value?.trim().replace(/^["']+|["']+$/g, "").trim();
  return cleaned || undefined;
}

const FROM = cleanAddress(process.env.SMTP_FROM_EMAIL) ?? "noreply@warsh.app";

// Resend returns delivery failures in the response body, not as a thrown error,
// and every caller here is fire-and-forget behind a 200 — so a rejected key or
// an unverified sending domain produced no error anywhere, and the password
// reset simply never arrived. Report it so a broken mail path is an alert
// rather than something nobody learns until a user complains.
function reportEmailFailure(kind: string, toEmail: string, error: unknown): void {
  Sentry.captureException(error instanceof Error ? error : new Error(JSON.stringify(error)), {
    level: "error",
    tags: { subsystem: "email", email_kind: kind },
    extra: { recipientDomain: toEmail.split("@")[1] ?? "unknown" },
  });
  console.error(`[email] ${kind} send failed:`, error);
}

function reportMissingKey(kind: string): void {
  Sentry.captureMessage(`[email] RESEND_API_KEY not set — ${kind} not sent`, {
    level: "error",
    tags: { subsystem: "email", email_kind: kind },
  });
  console.warn(`[email] RESEND_API_KEY not set — skipping ${kind}`);
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    reportMissingKey("password-reset");
    return;
  }

  const { error } = await getResend().emails.send({
    from: `Warsh <${FROM}>`,
    to: [toEmail],
    subject: "Reset your Warsh password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1a1a2e; font-size: 24px; margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #6b5e52; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          As-salamu alaykum,<br><br>
          We received a request to reset your Warsh password. Click the button below to set a new password.
          This link will expire in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #C8972B; color: #fff; text-decoration: none;
           padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 16px;">
          Reset password
        </a>
        <p style="color: #8a7060; font-size: 13px; margin-top: 24px; line-height: 1.5;">
          If you did not request this, you can safely ignore this email — your password will not be changed.
        </p>
      </div>
    `,
  });

  if (error) {
    reportEmailFailure("password-reset", toEmail, error);
  }
}

export async function sendPasswordChangedEmail(toEmail: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    reportMissingKey("password-changed");
    return;
  }

  const { error } = await getResend().emails.send({
    from: `Warsh <${FROM}>`,
    to: [toEmail],
    subject: "Your Warsh password was changed",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1a1a2e; font-size: 24px; margin-bottom: 8px;">Password changed</h2>
        <p style="color: #6b5e52; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          As-salamu alaykum,<br><br>
          Your Warsh account password was successfully changed. If you made this change, no action is needed.
        </p>
        <p style="color: #6b5e52; font-size: 16px; line-height: 1.6;">
          If you did <strong>not</strong> make this change, please reset your password immediately using the
          "Forgot password" option on the login screen.
        </p>
      </div>
    `,
  });

  if (error) {
    reportEmailFailure("password-changed", toEmail, error);
  }
}
