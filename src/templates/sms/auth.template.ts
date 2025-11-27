import { appConfig } from "../../config/app.config.js";

export const getWelcomeSMS = (userName: string, verificationCode?: string) => {
  return `Welcome to ${appConfig.appName}, ${userName}! ${verificationCode ? `Your verification code is: ${verificationCode}` : "Please check your email to verify your account."}`;
};

export const getPasswordResetSMS = (resetCode: string) => {
  return `Your ${appConfig.appName} password reset code is: ${resetCode}. This code expires in 1 hour.`;
};

export const getEmailVerifiedSMS = (userName: string) => {
  return `Hi ${userName}, your ${appConfig.appName} email has been verified successfully! You can now access all features.`;
};
