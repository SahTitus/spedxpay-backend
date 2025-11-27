import { getEmailLayout, type EmailTemplateData } from "../base.template.js";

export interface KycRejectedEmailData extends EmailTemplateData {
  reason: string;
  resubmitLink: string;
}

export const getKycRejectedEmail = (data: KycRejectedEmailData) => {
  const content = `
    <div class="greeting">KYC Verification Update</div>
    
    <div class="message">
      Hi ${data.userName || "there"},
    </div>

    <div class="alert">
      Unfortunately, we were unable to approve your KYC verification at this time.
    </div>

    <div class="info-box">
      <div class="info-box-title">Reason:</div>
      <p style="color: #555555; margin-top: 10px;">${data.reason}</p>
    </div>

    <div class="message">
      Don't worry! You can resubmit your verification documents with the correct information.
    </div>

    <div style="text-align: center;">
      <a href="${data.resubmitLink}" class="button">Resubmit KYC</a>
    </div>

    <div class="divider"></div>

    <div class="message" style="font-size: 14px; color: #6c757d;">
      <strong>Tips for successful verification:</strong>
      <ul style="margin-left: 20px; margin-top: 10px;">
        <li>Ensure all documents are clear and readable</li>
        <li>Make sure your ID is not expired</li>
        <li>Provide accurate personal information</li>
        <li>Upload high-quality images</li>
      </ul>
    </div>

    <div class="message">
      If you have any questions, please contact our support team at support@sped_x_pay.com
    </div>
  `;

  return {
    subject: "KYC Verification - Action Required",
    html: getEmailLayout(content, "Your KYC verification needs attention"),
  };
};
