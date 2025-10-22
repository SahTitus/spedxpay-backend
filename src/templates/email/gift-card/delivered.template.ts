import { getEmailLayout } from "../base.template"

export interface GiftCardDeliveredEmailData {
  userName: string
  giftCardType: string
  faceValue: number
  cardDetails: {
    pin?: string
    serial?: string
    code?: string
    redemptionUrl?: string
  }
  txRef: string
}

export const getGiftCardDeliveredEmail = (data: GiftCardDeliveredEmailData) => {
  const content = `
    <div class="greeting">Hello ${data.userName},</div>
    
    <div class="message">
      Your gift card purchase has been completed! Here are your card details:
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="label">Card Type:</span>
        <span class="value">${data.giftCardType.toUpperCase()}</span>
      </div>
      <div class="info-row">
        <span class="label">Face Value:</span>
        <span class="value">$${data.faceValue}</span>
      </div>
      <div class="info-row">
        <span class="label">Transaction Ref:</span>
        <span class="value">${data.txRef}</span>
      </div>
    </div>

    <div class="card-details-box">
      <div class="card-details-title">Card Details</div>
      ${data.cardDetails.pin ? `<div class="detail-row"><span class="detail-label">PIN:</span> <span class="detail-value">${data.cardDetails.pin}</span></div>` : ""}
      ${data.cardDetails.serial ? `<div class="detail-row"><span class="detail-label">Serial:</span> <span class="detail-value">${data.cardDetails.serial}</span></div>` : ""}
      ${data.cardDetails.code ? `<div class="detail-row"><span class="detail-label">Code:</span> <span class="detail-value">${data.cardDetails.code}</span></div>` : ""}
      ${data.cardDetails.redemptionUrl ? `<div class="detail-row"><span class="detail-label">Redeem at:</span> <a href="${data.cardDetails.redemptionUrl}" class="link">${data.cardDetails.redemptionUrl}</a></div>` : ""}
    </div>

    <div class="warning-box">
      <strong>Important:</strong> Please save these details securely. This information will not be sent again.
    </div>

    <div class="message">
      If you have any issues redeeming your card, please contact our support team.
    </div>
  `

  return {
    subject: `Your ${data.giftCardType.toUpperCase()} Gift Card - ${data.txRef}`,
    html: getEmailLayout(content, "Gift Card Delivered"),
  }
}
