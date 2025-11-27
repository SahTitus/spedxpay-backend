import { getEmailLayout, type EmailTemplateData } from "../base.template.js";

export interface PasswordResetEmailData extends EmailTemplateData {
  resetLink: string;
}

export const getPasswordResetEmail = (data: PasswordResetEmailData) => {
  const content = `
    <div class="greeting">Password Reset Request</div>
    
    <div class="message">
      Hi ${data.userName || "there"},
    </div>

    <div class="message">
      We received a request to reset your password for your sped_x_pay account. Click the button below to create a new password:
    </div>

    <div style="text-align: center;">
      <a href="${data.resetLink}" class="button">Reset Password</a>
    </div>

    <div class="message" style="font-size: 14px; color: #6c757d;">
      Or copy and paste this link into your browser:<br>
      <a href="${data.resetLink}" style="color: #667eea; word-break: break-all;">${data.resetLink}</a>
    </div>

    <div class="alert">
      <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
    </div>

    <div class="divider"></div>

    <div class="message" style="font-size: 14px; color: #6c757d;">
      For security reasons, we recommend:
      <ul style="margin-left: 20px; margin-top: 10px;">
        <li>Using a strong, unique password</li>
        <li>Enabling two-factor authentication</li>
        <li>Never sharing your password with anyone</li>
      </ul>
    </div>
  `;

  return {
    subject: "Reset Your sped_x_pay Password",
    html: getEmailLayout(content, "Reset your sped_x_pay account password"),
  };
};
