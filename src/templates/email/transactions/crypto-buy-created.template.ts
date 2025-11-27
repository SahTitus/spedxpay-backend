import { getEmailLayout, type EmailTemplateData } from "../base.template.js";

export interface CryptoBuyCreatedEmailData extends EmailTemplateData {
  txRef: string;
  cryptocurrency: string;
  amountCrypto: number;
  amountFiat: number;
  paymentMethod: string;
  platformPaymentDetails: any;
  transactionLink: string;
}

export const getCryptoBuyCreatedEmail = (data: CryptoBuyCreatedEmailData) => {
  const content = `
    <div class="greeting">Buy Crypto Transaction Created</div>
    
    <div class="message">
      Hi ${data.userName || "there"},
    </div>

    <div class="success">
      Your buy crypto transaction has been created successfully!
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
        <span class="info-label">You'll Receive:</span>
        <span class="info-value">${data.amountCrypto} ${data.cryptocurrency}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Amount to Pay:</span>
        <span class="info-value">${data.amountFiat.toLocaleString()} NGN</span>
      </div>
      <div class="info-item">
        <span class="info-label">Payment Method:</span>
        <span class="info-value">${data.paymentMethod}</span>
      </div>
    </div>

    <div class="message">
      <strong>Next Steps:</strong>
    </div>

    <div class="message">
      1. Make payment of <strong>${data.amountFiat.toLocaleString()} NGN</strong> using the details below:
    </div>

    <div class="info-box" style="background-color: #d4edda;">
      <div class="info-box-title">Payment Details</div>
      ${
        data.paymentMethod === "bank_transfer"
          ? `
      <div class="info-item">
        <span class="info-label">Bank Name:</span>
        <span class="info-value">${data.platformPaymentDetails.bankName || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Account Number:</span>
        <span class="info-value">${data.platformPaymentDetails.accountNumber || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Account Name:</span>
        <span class="info-value">${data.platformPaymentDetails.accountName || "N/A"}</span>
      </div>
      `
          : data.paymentMethod === "momo"
            ? `
      <div class="info-item">
        <span class="info-label">Mobile Money Number:</span>
        <span class="info-value">${data.platformPaymentDetails.momoNumber || "N/A"}</span>
      </div>
      `
            : `<p style="color: #555;">Payment details will be provided in your dashboard.</p>`
      }
    </div>

    <div class="message">
      2. After making payment, click "I Have Paid" button in your dashboard.
    </div>

    <div class="message">
      3. Our team will verify your payment and send crypto to your wallet.
    </div>

    <div style="text-align: center;">
      <a href="${data.transactionLink}" class="button">View Transaction & Pay</a>
    </div>

    <div class="alert">
      <strong>Important:</strong> Please ensure you make the exact payment amount and click "I Have Paid" to notify our team.
    </div>
  `;

  return {
    subject: `Buy ${data.cryptocurrency} Transaction Created - ${data.txRef}`,
    html: getEmailLayout(
      content,
      `Pay ${data.amountFiat.toLocaleString()} NGN to receive ${data.amountCrypto} ${data.cryptocurrency}`
    ),
  };
};
