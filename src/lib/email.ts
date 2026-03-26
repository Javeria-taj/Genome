import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  try {
    await resend.emails.send({
      from: "Genome <noreply@genome.io>",
      to,
      subject: "Reset your Genome password",
      html: `
        <div style="font-family: 'Courier New', monospace; max-width: 480px; padding: 20px; color: #0f0e0d; background: #f5f0e8; border: 2px solid #0f0e0d;">
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #0f0e0d; padding-bottom: 10px;">Genome / v3.3</div>
          <p style="font-size: 14px; margin-bottom: 16px;">Hi ${name},</p>
          <p style="font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
            A password reset was requested for your account. If you did not make this request, please ignore this email.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; background: #0f0e0d; color: #f5f0e8;
                      padding: 12px 24px; text-decoration: none; font-size: 13px;
                      font-weight: bold; letter-spacing: .05em; border: none;">
              SET NEW PASSWORD →
            </a>
          </div>
          <p style="color: #7a756e; font-size: 11px; margin-top: 32px; border-top: 1px solid rgba(15,14,13,0.12); padding-top: 16px;">
            This link will expire in 1 hour. For security, do not share this link with anyone.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
}
