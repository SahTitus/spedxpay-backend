import { getEmailLayout, type EmailTemplateData } from "../base.template"

export interface PasswordChangedEmailData extends EmailTemplateData {
  timestamp: string
  supportEmail?: string
}

export const getPasswordChangedEmail = (data: PasswordChangedEmailData) => {
  const content = `
    <div class="greeting">Password Successfully Changed</div>
    
    <div class="message">
      Hi ${data.userName || "there"},
    </div>

    <div class="message">
      Your password was successfully changed on <strong>${data.timestamp}</strong>.
    </div>

    <div class="alert" style="background-color: #d4edda; border-left: 4px solid #28a745;">
      <strong>✓ Security Confirmation:</strong> Your SpedXpay account password has been updated successfully.
    </div>

    <div class="divider"></div>

    <div class="alert">
      <strong>⚠️ Didn't make this change?</strong><br><br>
      If you didn't request this password change, your account may be compromised. Please take immediate action:
      <ul style="margin-left: 20px; margin-top: 10px;">
        <li>Reset your password again immediately</li>
        <li>Contact our support team at ${data.supportEmail || "support@spedxpay.com"}</li>
        <li>Review your recent account activity</li>
      </ul>
    </div>

    <div class="divider"></div>

    <div class="message" style="font-size: 14px; color: #6c757d;">
      <strong>Security Tips:</strong>
      <ul style="margin-left: 20px; margin-top: 10px;">
        <li>Use a strong, unique password for your SpedXpay account</li>
        <li>Never share your password with anyone</li>
        <li>Enable two-factor authentication for extra security</li>
        <li>Be cautious of phishing emails asking for your credentials</li>
      </ul>
    </div>
  `

  return {
    subject: "Your spedxpay Password Has Been Changed",
    html: getEmailLayout(content, "Password successfully changed"),
  }
}
