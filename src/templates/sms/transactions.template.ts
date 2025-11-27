import { appConfig } from "../../config/app.config";

export const getTransactionCreatedSMS = (
  txRef: string,
  type: string,
  amount: string
) => {
  return `${appConfig.appName}: Your ${type} transaction ${txRef} has been created. Amount: ${amount}. Check your email for details.`;
};

export const getPaymentConfirmedSMS = (txRef: string) => {
  return `${appConfig.appName}: Payment confirmed for transaction ${txRef}. We're processing your order now.`;
};

export const getTransactionCompletedSMS = (txRef: string, type: string) => {
  return `${appConfig.appName}: Your ${type} transaction ${txRef} has been completed successfully! Thank you for using ${appConfig.appName}.`;
};

export const getTransactionRejectedSMS = (txRef: string, reason: string) => {
  return `${appConfig.appName}: Transaction ${txRef} was not completed. Reason: ${reason}. Contact support for help.`;
};

export const getPaymentReceivedSMS = (amount: string) => {
  return `${appConfig.appName}: We've received your payment of ${amount}. Your transaction is being processed.`;
};
