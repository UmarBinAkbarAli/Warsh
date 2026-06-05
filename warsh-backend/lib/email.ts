import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.SMTP_FROM_EMAIL ?? "noreply@warsh.app";

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return;
  }

  const { error } = await resend.emails.send({
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
    console.error("[email] Resend error:", error);
  }
}

export async function sendPasswordChangedEmail(toEmail: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const { error } = await resend.emails.send({
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
    console.error("[email] Resend error:", error);
  }
}
