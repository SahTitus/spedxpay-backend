import { getWelcomeEmail } from "@/templates/email/auth/welcome.template"
import { getPasswordResetEmail } from "@/templates/email/auth/password-reset.template"
import { getKycApprovedEmail } from "@/templates/email/kyc/kyc-approved.template"
import { getKycRejectedEmail } from "@/templates/email/kyc/kyc-rejected.template"
import { getCryptoSellCreatedEmail } from "@/templates/email/transactions/crypto-sell-created.template"
import { getCryptoBuyCreatedEmail } from "@/templates/email/transactions/crypto-buy-created.template"
import { getPaymentConfirmedEmail } from "@/templates/email/transactions/payment-confirmed.template"
import { getTransactionCompletedEmail } from "@/templates/email/transactions/transaction-completed.template"
import { getTransactionRejectedEmail } from "@/templates/email/transactions/transaction-rejected.template"
import { getUserActionAlertEmail } from "@/templates/email/admin/user-action-alert.template"
import { getGoogleVoiceDeliveredEmail } from "@/templates/email/google-voice/account-delivered.template"
import { getGiftCardSellCreatedEmail } from "@/templates/email/gift-card/sell-created.template"
import { getAdminGiftCardSentEmail } from "@/templates/email/admin/gift-card-sent.template"
import { getGiftCardDeliveredEmail } from "@/templates/email/gift-card/delivered.template"
import { getRoleAssignedEmail } from "@/templates/email/admin/role-assigned.template"
import { getAdminInvitationEmail } from "@/templates/email/admin/admin-invitation.template"
import * as authSMS from "@/templates/sms/auth.template"
import * as kycSMS from "@/templates/sms/kyc.template"
import * as transactionSMS from "@/templates/sms/transactions.template"
import * as giftCardSMS from "@/templates/sms/gift-cards.template"
import * as googleVoiceSMS from "@/templates/sms/google-voice.template"

export interface TemplateData {
  [key: string]: any
}

export class TemplateService {
  getEmailTemplate(type: string, data: TemplateData): { subject: string; html: string } | null {
    switch (type) {
      case "welcome":
        return getWelcomeEmail({
          userName: data.userName,
          verificationLink: data.verificationLink,
        })
      case "password_reset":
        return getPasswordResetEmail({
          userName: data.userName,
          resetLink: data.resetLink,
        })
      case "kyc_approved":
        return getKycApprovedEmail({
          userName: data.userName,
          dashboardLink: data.dashboardLink,
        })
      case "kyc_rejected":
        return getKycRejectedEmail({
          userName: data.userName,
          reason: data.reason,
          resubmitLink: data.resubmitLink,
        })
      case "crypto_sell_created":
        return getCryptoSellCreatedEmail({
          userName: data.userName,
          txRef: data.txRef,
          cryptocurrency: data.cryptocurrency,
          amountCrypto: data.amountCrypto,
          amountFiat: data.amountFiat,
          platformWalletAddress: data.platformWalletAddress,
          expiresAt: data.expiresAt,
          transactionLink: data.transactionLink,
        })
      case "crypto_buy_created":
        return getCryptoBuyCreatedEmail({
          userName: data.userName,
          txRef: data.txRef,
          cryptocurrency: data.cryptocurrency,
          amountCrypto: data.amountCrypto,
          amountFiat: data.amountFiat,
          paymentMethod: data.paymentMethod,
          platformPaymentDetails: data.platformPaymentDetails,
          transactionLink: data.transactionLink,
        })
      case "payment_confirmed":
        return getPaymentConfirmedEmail({
          userName: data.userName,
          txRef: data.txRef,
          cryptocurrency: data.cryptocurrency,
          amount: data.amount,
          transactionLink: data.transactionLink,
        })
      case "transaction_completed":
        return getTransactionCompletedEmail({
          userName: data.userName,
          txRef: data.txRef,
          type: data.type,
          cryptocurrency: data.cryptocurrency,
          amount: data.amount,
          transactionLink: data.transactionLink,
        })
      case "transaction_rejected":
        return getTransactionRejectedEmail({
          userName: data.userName,
          txRef: data.txRef,
          reason: data.reason,
          transactionLink: data.transactionLink,
        })
      case "admin_alert":
        return getUserActionAlertEmail({
          userName: data.userName,
          action: data.action,
          txRef: data.txRef,
          cryptocurrency: data.cryptocurrency,
          amount: data.amount,
          adminLink: data.adminLink,
          userEmail: data.userEmail,
        })
      case "google-voice-delivered":
        return getGoogleVoiceDeliveredEmail({
          userName: data.userName,
          txRef: data.txRef,
          quantity: data.quantity,
          accounts: data.accounts,
          expiresAt: data.expiresAt,
          reportWindowMinutes: data.reportWindowMinutes,
        })
      case "gift-card-sell-created":
        return getGiftCardSellCreatedEmail({
          userName: data.userName,
          giftCardType: data.giftCardType,
          faceValue: data.faceValue,
          amountToReceive: data.amountToReceive,
          txRef: data.txRef,
          dashboardLink: data.dashboardLink,
        })
      case "admin-gift-card-sent":
        return getAdminGiftCardSentEmail({
          userName: data.userName,
          userEmail: data.userEmail,
          txRef: data.txRef,
          giftCardType: data.giftCardType,
          faceValue: data.faceValue,
          reviewLink: data.reviewLink,
        })
      case "gift-card-delivered":
        return getGiftCardDeliveredEmail({
          userName: data.userName,
          giftCardType: data.giftCardType,
          faceValue: data.faceValue,
          cardDetails: data.cardDetails,
          txRef: data.txRef,
        })
      case "role-assigned":
        return getRoleAssignedEmail({
          userName: data.userName,
          oldRole: data.oldRole,
          newRole: data.newRole,
          assignedBy: data.assignedBy,
        })
      case "admin-invitation":
        return getAdminInvitationEmail({
          invitedBy: data.invitedBy,
          role: data.role,
          invitationLink: data.invitationLink,
          expiresAt: data.expiresAt,
        })
      default:
        return null
    }
  }

  getSMSTemplate(type: string, data: TemplateData): string | null {
    switch (type) {
      // Auth SMS
      case "welcome":
        return authSMS.getWelcomeSMS(data.userName, data.verificationCode)
      case "password_reset":
        return authSMS.getPasswordResetSMS(data.resetCode)
      case "email_verified":
        return authSMS.getEmailVerifiedSMS(data.userName)

      // KYC SMS
      case "kyc_approved":
        return kycSMS.getKycApprovedSMS(data.userName)
      case "kyc_rejected":
        return kycSMS.getKycRejectedSMS(data.userName, data.reason)
      case "kyc_submitted":
        return kycSMS.getKycSubmittedSMS(data.userName)

      // Transaction SMS
      case "transaction_created":
        return transactionSMS.getTransactionCreatedSMS(data.txRef, data.type, data.amount)
      case "payment_confirmed":
        return transactionSMS.getPaymentConfirmedSMS(data.txRef)
      case "transaction_completed":
        return transactionSMS.getTransactionCompletedSMS(data.txRef, data.type)
      case "transaction_rejected":
        return transactionSMS.getTransactionRejectedSMS(data.txRef, data.reason)
      case "payment_received":
        return transactionSMS.getPaymentReceivedSMS(data.amount)

      // Gift Card SMS
      case "gift_card_sell_created":
        return giftCardSMS.getGiftCardSellCreatedSMS(data.txRef, data.cardType, data.amount)
      case "gift_card_buy_created":
        return giftCardSMS.getGiftCardBuyCreatedSMS(data.txRef, data.cardType, data.amount)
      case "gift_card_completed":
        return giftCardSMS.getGiftCardCompletedSMS(data.txRef, data.cardType)

      // Google Voice SMS
      case "google_voice_created":
        return googleVoiceSMS.getGoogleVoiceOrderCreatedSMS(data.orderId, data.amount)
      case "google_voice_completed":
        return googleVoiceSMS.getGoogleVoiceCompletedSMS(data.orderId, data.phoneNumber)
      case "google_voice_dispute":
        return googleVoiceSMS.getGoogleVoiceDisputeReceivedSMS(data.orderId)

      default:
        return null
    }
  }
}
