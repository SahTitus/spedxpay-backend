import { getEmailLayout, type EmailTemplateData } from "../base.template.js";

export interface TransactionCompletedEmailData extends EmailTemplateData {
  txRef: string;
  type: string;
  cryptocurrency: string;
  amount: number;
  transactionLink: string;
}

export const getTransactionCompletedEmail = (
  data: TransactionCompletedEmailData
) => {
  const isBuy = data.type.includes("BUY");
  const isSell = data.type.includes("SELL");

  const content = `
    <div class="greeting">Transaction Completed! 🎉</div>
    
    <div class="message">
      Hi ${data.userName || "there"},
    </div>

    <div class="success">
      Your transaction has been completed successfully!
    </div>

    <div class="info-box">
      <div class="info-box-title">Transaction Summary</div>
      <div class="info-item">
        <span class="info-label">Reference:</span>
        <span class="info-value">${data.txRef}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Type:</span>
        <span class="info-value">${isBuy ? "Buy" : isSell ? "Sell" : "Trade"} ${data.cryptocurrency}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Amount:</span>
        <span class="info-value">${data.amount}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Status:</span>
        <span class="info-value" style="color: #28a745;">✓ Completed</span>
      </div>
    </div>

    ${
      isBuy
        ? `
    <div class="message">
      The cryptocurrency has been sent to your wallet. Please check your wallet to confirm receipt.
    </div>
    `
        : isSell
          ? `
    <div class="message">
      Your payment has been processed and sent to your registered payment method.
    </div>
    `
          : ""
    }

    <div style="text-align: center;">
      <a href="${data.transactionLink}" class="button">View Transaction Details</a>
    </div>

    <div class="divider"></div>

    <div class="message" style="font-size: 14px; color: #6c757d;">
      Thank you for using sped_x_pay! We appreciate your business and look forward to serving you again.
    </div>
  `;

  return {
    subject: `Transaction Completed - ${data.txRef}`,
    html: getEmailLayout(
      content,
      "Your transaction has been completed successfully"
    ),
  };
};
