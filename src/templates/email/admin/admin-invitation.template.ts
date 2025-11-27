import { getEmailLayout } from "../base.template.js";

export interface AdminInvitationEmailData {
  invitedBy: string;
  role: string;
  invitationLink: string;
  expiresAt: string;
}

export const getAdminInvitationEmail = (data: AdminInvitationEmailData) => {
  const roleNames: Record<string, string> = {
    admin: "Admin",
    assistant_admin: "Assistant Admin",
  };

  const content = `
    <div class="greeting">You've Been Invited!</div>
    
    <div class="message">
      ${data.invitedBy} has invited you to join the platform as <strong>${roleNames[data.role] || data.role}</strong>.
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Role:</span>
        <span class="info-value" style="color: #10b981; font-weight: 600;">${roleNames[data.role] || data.role}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Invitation Expires:</span>
        <span class="info-value">${data.expiresAt}</span>
      </div>
    </div>

    <div class="message">
      <p>As an ${roleNames[data.role]}, you will have access to:</p>
      <ul style="margin: 16px 0; padding-left: 24px;">
        <li>Admin dashboard and analytics</li>
        <li>User transaction management</li>
        <li>KYC review and approval</li>
        <li>Gift card order processing</li>
        <li>Google Voice order management</li>
        <li>Platform configuration</li>
      </ul>
    </div>

    <div class="cta-container">
      <a href="${data.invitationLink}" class="cta-button">Accept Invitation</a>
    </div>

    <div class="footer-note">
      This invitation link will expire on ${data.expiresAt}. If you didn't expect this invitation, you can safely ignore this email.
    </div>
  `;

  return {
    subject: "You've Been Invited to Join as Admin",
    html: getEmailLayout(content, "Admin Invitation"),
  };
};
