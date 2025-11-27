import { getEmailLayout, type EmailTemplateData } from "../base.template.js";

export interface PaymentConfirmedEmailData extends EmailTemplateData {
  txRef: string;
  cryptocurrency: string;
  amount: number;
  transactionLink: string;
}

export const getPaymentConfirmedEmail = (data: PaymentConfirmedEmailData) => {
  const content = `
    <div class="greeting">Payment Confirmed! ✅</div>
    
    <div class="message">
      Hi ${data.userName || "there"},
    </div>

    <div class="success">
      Great news! Your payment has been confirmed by our team.
    </div>

    <div class="info-box">
      <div class="info-box-title">Transaction Details</div>
      <div class="info-item">
        <span class="info-label">Reference:</span>
        <span class="info-value">${data.txRef}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Cryptocurrency:</span>
        <span class="info-value">${data.cryptocurrency}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Amount:</span>
        <span class="info-value">${data.amount}</span>
      </div>
    </div>

    <div class="message">
      We're now processing your transaction. You'll receive another notification once the crypto is sent to your wallet.
    </div>

    <div style="text-align: center;">
      <a href="${data.transactionLink}" class="button">View Transaction Status</a>
    </div>

    <div class="message" style="font-size: 14px; color: #6c757d;">
      Thank you for choosing sped_x_pay for your crypto trading needs!
    </div>
  `;

  return {
    subject: `Payment Confirmed - ${data.txRef}`,
    html: getEmailLayout(content, "Your payment has been confirmed"),
  };
};
