import { appConfig } from "../../config/app.config.js";

export const getGiftCardSellCreatedSMS = (
  txRef: string,
  cardType: string,
  amount: string
) => {
  return `${appConfig.appName}: Your ${cardType} gift card sell order ${txRef} has been created. Amount: ${amount}. Upload your card details to proceed.`;
};

export const getGiftCardBuyCreatedSMS = (
  txRef: string,
  cardType: string,
  amount: string
) => {
  return `${appConfig.appName}: Your ${cardType} gift card purchase ${txRef} is ready. Amount: ${amount}. Make payment to receive your card.`;
};

export const getGiftCardCompletedSMS = (txRef: string, cardType: string) => {
  return `${appConfig.appName}: Your ${cardType} gift card transaction ${txRef} is complete. Check your email for details.`;
};
