import { getEmailLayout, type EmailTemplateData } from "../base.template";

export interface WelcomeEmailData extends EmailTemplateData {
  verificationLink: string;
}

export const getWelcomeEmail = (data: WelcomeEmailData) => {
  const content = `
    <div class="greeting">Welcome to sped_x_pay, ${data.userName || "there"}! 🎉</div>
    
    <div class="message">
      Thank you for joining sped_x_pay, your trusted crypto trading platform. We're excited to have you on board!
    </div>

    <div class="message">
      To get started and unlock all features, please verify your email address by clicking the button below:
    </div>

    <div style="text-align: center;">
      <a href="${data.verificationLink}" class="button">Verify Email Address</a>
    </div>

    <div class="message" style="font-size: 14px; color: #6c757d;">
      Or copy and paste this link into your browser:<br>
      <a href="${data.verificationLink}" style="color: #667eea; word-break: break-all;">${data.verificationLink}</a>
    </div>

    <div class="divider"></div>

    <div class="info-box">
      <div class="info-box-title">What's Next?</div>
      <ul style="margin-left: 20px; color: #555555;">
        <li style="margin: 10px 0;">Complete your KYC verification</li>
        <li style="margin: 10px 0;">Add your payment methods</li>
        <li style="margin: 10px 0;">Start trading crypto securely</li>
      </ul>
    </div>

    <div class="alert">
      <strong>Security Tip:</strong> This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.
    </div>
  `;

  return {
    subject: "Welcome to sped_x_pay - Verify Your Email",
    html: getEmailLayout(
      content,
      "Welcome to sped_x_pay! Verify your email to get started."
    ),
  };
};
