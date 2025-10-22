export const getKycApprovedSMS = (userName: string) => {
  return `Congratulations ${userName}! Your KYC verification has been approved. You can now trade on sped_x_pay.`;
};

export const getKycRejectedSMS = (userName: string, reason: string) => {
  return `Hi ${userName}, your KYC verification was not approved. Reason: ${reason}. Please resubmit your documents.`;
};

export const getKycSubmittedSMS = (userName: string) => {
  return `Hi ${userName}, your KYC documents have been received. We'll review them within 24-48 hours.`;
};
