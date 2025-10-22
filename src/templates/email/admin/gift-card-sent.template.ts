import { getEmailLayout } from "@/templates/email/base.template"

export interface AdminGiftCardSentEmailData {
  userName: string
  userEmail: string
  txRef: string
  giftCardType: string
  faceValue: number
  reviewLink: string
}

export const getAdminGiftCardSentEmail = (data: AdminGiftCardSentEmailData) => {
  const content = `
    <div class="greeting">Hello Admin! 👋</div>
    
    <div class="message">
      ${data.userName} marked payment as sent for a gift card order
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">User:</span>
        <span class="info-value">${data.userName} (${data.userEmail})</span>
      </div>
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
    </div>

    <div class="message">
      <strong>Action Required:</strong>
    </div>

    <ol style="margin: 20px 0; padding-left: 20px; color: #4b5563;">
      <li style="margin-bottom: 10px;">Review the gift card submission details</li>
      <li style="margin-bottom: 10px;">Verify the card photos/details provided</li>
      <li style="margin-bottom: 10px;">Approve or reject the submission</li>
      <li style="margin-bottom: 10px;">If approved, process payment to user's account</li>
    </ol>

    <div class="cta-container">
      <a href="${data.reviewLink}" class="cta-button">Review Submission</a>
    </div>
  `

  return {
    subject: `[Action Required] User Has Sent Gift Card - ${data.txRef}`,
    html: getEmailLayout(content, "Gift card submission ready for review"),
  }
}
