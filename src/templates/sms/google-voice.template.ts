import { appConfig } from "@/config/app.config";

export const getGoogleVoiceOrderCreatedSMS = (
  orderId: string,
  amount: string
) => {
  return `${appConfig.appName}: Your Google Voice order ${orderId} has been created. Amount: ${amount}. Make payment to proceed.`;
};

export const getGoogleVoiceCompletedSMS = (
  orderId: string,
  phoneNumber: string
) => {
  return `${appConfig.appName}: Your Google Voice number is ready! Number: ${phoneNumber}. Check email for login details. You have 5 minutes to report issues.`;
};

export const getGoogleVoiceDisputeReceivedSMS = (orderId: string) => {
  return `${appConfig.appName}: Your dispute for order ${orderId} has been received. Our team will review it shortly.`;
};
