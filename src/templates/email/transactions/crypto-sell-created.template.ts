import { getEmailLayout, type EmailTemplateData } from "../base.template"

export interface CryptoSellCreatedEmailData extends EmailTemplateData {
  txRef: string
  cryptocurrency: string
  amountCrypto: number
  amountFiat: number
  platformWalletAddress: string
  expiresAt: Date
  transactionLink: string
}

export const getCryptoSellCreatedEmail = (data: CryptoSellCreatedEmailData) => {
  const content = `
    <div class="greeting">Sell Crypto Transaction Created</div>
    
    <div class="message">
      Hi ${data.userName || "there"},
    </div>

    <div class="success">
      Your sell crypto transaction has been created successfully!
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
        <span class="info-value">${data.amountCrypto} ${data.cryptocurrency}</span>
      </div>
      <div class="info-item">
        <span class="info-label">You'll Receive:</span>
        <span class="info-value">${data.amountFiat.toLocaleString()} NGN</span>
      </div>
      <div class="info-item">
        <span class="info-label">Expires:</span>
        <span class="info-value">${new Date(data.expiresAt).toLocaleString()}</span>
      </div>
    </div>

    <div class="message">
      <strong>Next Steps:</strong>
    </div>

    <div class="message">
      1. Send <strong>${data.amountCrypto} ${data.cryptocurrency}</strong> to our platform wallet:
    </div>

    <div class="info-box" style="background-color: #fff3cd;">
      <div style="font-size: 14px; color: #856404; word-break: break-all;">
        <strong>Wallet Address:</strong><br>
        ${data.platformWalletAddress}
      </div>
    </div>

    <div class="message">
      2. After sending, click "I Have Sent" button in your dashboard to notify our team.
    </div>

    <div class="message">
      3. Our team will verify the blockchain transaction and process your payment.
    </div>

    <div style="text-align: center;">
      <a href="${data.transactionLink}" class="button">View Transaction</a>
    </div>

    <div class="alert">
      <strong>Important:</strong> This transaction will expire in 30 minutes. Please complete it before ${new Date(data.expiresAt).toLocaleTimeString()}.
    </div>
  `

  return {
    subject: `Sell ${data.cryptocurrency} Transaction Created - ${data.txRef}`,
    html: getEmailLayout(content, `Send ${data.amountCrypto} ${data.cryptocurrency} to complete your transaction`),
  }
}
