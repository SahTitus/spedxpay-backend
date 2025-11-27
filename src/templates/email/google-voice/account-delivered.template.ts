import { getEmailLayout, type EmailTemplateData } from "../base.template.js";

export interface GoogleVoiceDeliveredEmailData extends EmailTemplateData {
  txRef: string;
  quantity: number;
  accounts: Array<{
    accountEmail: string;
    phoneNumber: string;
    recoveryEmail: string;
    password: string;
  }>;
  expiresAt: string;
  reportWindowMinutes: number;
}

export const getGoogleVoiceDeliveredEmail = (
  data: GoogleVoiceDeliveredEmailData
) => {
  const expiryDate = new Date(data.expiresAt);
  const formattedExpiry = expiryDate.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const accountsHtml = data.accounts
    .map(
      (account, index) => `
    <div class="info-box" style="margin: 20px 0; background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 20px; border-radius: 4px;">
      <div class="info-box-title" style="font-weight: 600; color: #2563eb; margin-bottom: 15px; font-size: 18px; text-align: center;">
        Account #${index + 1}${data.quantity > 1 ? ` of ${data.quantity}` : ""}
      </div>
      
      <div class="info-item">
        <span class="info-label">Email Address:</span>
        <span class="info-value">${account.accountEmail}</span>
      </div>
      
      <div class="info-item">
        <span class="info-label">Phone Number:</span>
        <span class="info-value">${account.phoneNumber}</span>
      </div>
      
      <div class="info-item">
        <span class="info-label">Recovery Email:</span>
        <span class="info-value">${account.recoveryEmail}</span>
      </div>
      
      <div class="info-item" style="border-bottom: none;">
        <span class="info-label">Password:</span>
        <span class="info-value" style="background-color: #fef3c7; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${account.password}</span>
      </div>
    </div>
  `
    )
    .join("");

  const content = `
    <div class="greeting">Your Google Voice Account${data.quantity > 1 ? "s" : ""} ${data.quantity > 1 ? "Are" : "Is"} Ready!</div>
    
    <div class="message">
      Great news! Your order <strong>${data.txRef}</strong> has been successfully delivered.
    </div>

    <div class="info-box">
      <div class="info-box-title">Order Summary</div>
      <div class="info-item">
        <span class="info-label">Total Accounts:</span>
        <span class="info-value">${data.quantity}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Order Reference:</span>
        <span class="info-value">${data.txRef}</span>
      </div>
      <div class="info-item" style="border-bottom: none;">
        <span class="info-label">Delivered At:</span>
        <span class="info-value">${new Date().toLocaleString()}</span>
      </div>
    </div>

    <div class="divider"></div>

    <div class="message" style="font-size: 18px; font-weight: 600; color: #333333;">
      Your Account Details
    </div>

    ${accountsHtml}

    <div class="divider"></div>

    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <div style="font-weight: 700; color: #dc2626; margin-bottom: 12px; font-size: 18px; text-align: center;">
        IMPORTANT - Report Window
      </div>
      <div style="color: #991b1b; font-size: 15px; line-height: 1.6; text-align: center; margin: 8px 0;">
        You have <strong>${data.reportWindowMinutes} minutes</strong> from delivery to report any issues with your account${data.quantity > 1 ? "s" : ""}.
      </div>
      <div style="color: #991b1b; font-size: 15px; line-height: 1.6; text-align: center; margin: 8px 0;">
        <strong>Report window expires at:</strong> ${formattedExpiry}
      </div>
      <div style="color: #991b1b; font-size: 15px; line-height: 1.6; text-align: center; margin: 8px 0;">
        After this time, the order will be automatically marked as completed and no disputes will be accepted.
      </div>
    </div>

    <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px; font-size: 16px;">
        What to Check:
      </div>
      <div style="color: #1e40af; font-size: 15px; line-height: 1.8; margin: 8px 0;">
        ✓ Login credentials work correctly
      </div>
      <div style="color: #1e40af; font-size: 15px; line-height: 1.8; margin: 8px 0;">
        ✓ Phone number is active and functional
      </div>
      <div style="color: #1e40af; font-size: 15px; line-height: 1.8; margin: 8px 0;">
        ✓ Recovery email is accessible
      </div>
      <div style="color: #1e40af; font-size: 15px; line-height: 1.8; margin: 8px 0;">
        ✓ Account has not been suspended or banned
      </div>
    </div>

    <div class="message" style="font-size: 14px; color: #6c757d; text-align: center;">
      If you encounter any issues, please report them immediately through your dashboard before the window expires.
    </div>

    <div class="message" style="text-align: center;">
      Thank you for your purchase!<br>
      <strong>The SpedXpay Support Team</strong>
    </div>
  `;

  return {
    subject: `Your Google Voice Account${data.quantity > 1 ? "s" : ""} Delivered - Order ${data.txRef}`,
    html: getEmailLayout(
      content,
      `Your Google Voice account${data.quantity > 1 ? "s have" : " has"} been delivered - Order ${data.txRef}`
    ),
  };
};
