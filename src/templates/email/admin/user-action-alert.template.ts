import { getEmailLayout, type EmailTemplateData } from "../base.template.js";

export interface UserActionAlertEmailData extends EmailTemplateData {
  action: string;
  txRef: string;
  cryptocurrency?: string;
  amount: string;
  adminLink: string;
  userEmail: string;
}

export const getUserActionAlertEmail = (data: UserActionAlertEmailData) => {
  const content = `
    <div class="greeting">⚠️ User Action Alert</div>
    
    <div class="alert">
      <strong>Action Required:</strong> A user has clicked "${data.action}" button
    </div>

    <div class="info-box">
      <div class="info-box-title">Transaction Details</div>
      <div class="info-item">
        <span class="info-label">User:</span>
        <span class="info-value">${data.userEmail}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Action:</span>
        <span class="info-value">${data.action}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Reference:</span>
        <span class="info-value">${data.txRef}</span>
      </div>
      ${
        data.cryptocurrency
          ? `
      <div class="info-item">
        <span class="info-label">Cryptocurrency:</span>
        <span class="info-value">${data.cryptocurrency}</span>
      </div>
      `
          : ""
      }
      <div class="info-item">
        <span class="info-label">Amount:</span>
        <span class="info-value">${data.amount}</span>
      </div>
    </div>

    <div class="message">
      ${
        data.action === "I Have Paid"
          ? "Please verify the payment and confirm the transaction."
          : data.action === "I Have Sent"
            ? "Please verify the blockchain transaction and process the payment."
            : "Please review and take appropriate action."
      }
    </div>

    <div style="text-align: center;">
      <a href="${data.adminLink}" class="button">Review Transaction</a>
    </div>

    <div class="message" style="font-size: 14px; color: #6c757d;">
      This is an automated alert from the sped_x_pay admin system.
    </div>
  `;

  return {
    subject: `[ADMIN ALERT] ${data.action} - ${data.txRef}`,
    html: getEmailLayout(content, `User action: ${data.action}`),
  };
};
