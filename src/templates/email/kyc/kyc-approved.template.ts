import { getEmailLayout, type EmailTemplateData } from "../base.template";

export interface KycApprovedEmailData extends EmailTemplateData {
  dashboardLink: string;
}

export const getKycApprovedEmail = (data: KycApprovedEmailData) => {
  const content = `
    <div class="greeting">KYC Verification Approved! ✅</div>
    
    <div class="message">
      Congratulations ${data.userName || "there"}!
    </div>

    <div class="success">
      Your KYC verification has been approved. You now have full access to all sped_x_pay trading features!
    </div>

    <div class="info-box">
      <div class="info-box-title">You Can Now:</div>
      <ul style="margin-left: 20px; color: #555555;">
        <li style="margin: 10px 0;">✓ Buy and sell cryptocurrencies</li>
        <li style="margin: 10px 0;">✓ Trade gift cards</li>
        <li style="margin: 10px 0;">✓ Purchase Google Voice numbers</li>
        <li style="margin: 10px 0;">✓ Access higher transaction limits</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${data.dashboardLink}" class="button">Go to Dashboard</a>
    </div>

    <div class="message">
      Thank you for completing your verification. We're committed to providing you with a secure and seamless trading experience.
    </div>
  `;

  return {
    subject: "KYC Verification Approved - Start Trading Now!",
    html: getEmailLayout(content, "Your KYC verification has been approved"),
  };
};
