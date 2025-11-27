import { getEmailLayout } from "../../../templates/email/base.template"

export interface GiftCardSellCreatedEmailData {
  userName: string
  giftCardType: string
  faceValue: number
  amountToReceive: number
  txRef: string
  dashboardLink: string
}

export const getGiftCardSellCreatedEmail = (data: GiftCardSellCreatedEmailData) => {
  const content = `
    <div class="greeting">Hello ${data.userName}! 👋</div>
    
    <div class="message">
      Your gift card sale order has been created successfully.
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Transaction Reference:</span>
        <span class="info-value">${data.txRef}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Gift Card Type:</span>
        <span class="info-value">${data.giftCardType}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Face Value:</span>
        <span class="info-value">$${data.faceValue.toFixed(2)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">You Will Receive:</span>
        <span class="info-value">GHS ${data.amountToReceive.toFixed(2)}</span>
      </div>
    </div>

    <div class="message">
      <strong>Next Steps:</strong>
    </div>

    <ol style="margin: 20px 0; padding-left: 20px; color: #4b5563;">
      <li style="margin-bottom: 10px;">Go sell your gift card (redeem it or sell to someone)</li>
      <li style="margin-bottom: 10px;">After selling, click the <strong>"I Have Sent"</strong> button in your dashboard</li>
      <li style="margin-bottom: 10px;">Our team will review your submission</li>
      <li style="margin-bottom: 10px;">Once approved, you'll receive payment to your registered payment method</li>
    </ol>

    <div class="cta-container">
      <a href="${data.dashboardLink}" class="cta-button">View Order Details</a>
    </div>

    <div class="message" style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
      <strong>⚠️ Important:</strong> Only click "I Have Sent" after you have actually sold/redeemed the gift card. 
      False submissions may result in account suspension.
    </div>
  `

  return {
    subject: `Gift Card Sale Order Created - ${data.txRef}`,
    html: getEmailLayout(content, "Gift card sale order created"),
  }
}
