import { getEmailLayout, type EmailTemplateData } from "../base.template.js";

export interface TransactionRejectedEmailData extends EmailTemplateData {
  txRef: string;
  reason: string;
  transactionLink: string;
}

export const getTransactionRejectedEmail = (
  data: TransactionRejectedEmailData
) => {
  const content = `
    <div class="greeting">Transaction Update</div>
    
    <div class="message">
      Hi ${data.userName || "there"},
    </div>

    <div class="alert">
      Unfortunately, your transaction <strong>${data.txRef}</strong> could not be completed.
    </div>

    <div class="info-box">
      <div class="info-box-title">Reason:</div>
      <p style="color: #555555; margin-top: 10px;">${data.reason}</p>
    </div>

    <div class="message">
      If you believe this is an error or need clarification, please contact our support team.
    </div>

    <div style="text-align: center;">
      <a href="${data.transactionLink}" class="button">View Transaction Details</a>
    </div>

    <div class="divider"></div>

    <div class="message" style="font-size: 14px; color: #6c757d;">
      Need help? Contact us at support@sped_x_pay.com or visit our help center.
    </div>
  `;

  return {
    subject: `Transaction Update - ${data.txRef}`,
    html: getEmailLayout(content, "Your transaction requires attention"),
  };
};
