import { getEmailLayout } from "../base.template"

export interface RoleAssignedEmailData {
  userName: string
  oldRole: string
  newRole: string
  assignedBy: string
}

export const getRoleAssignedEmail = (data: RoleAssignedEmailData) => {
  const roleNames: Record<string, string> = {
    user: "User",
    admin: "Admin",
    assistant_admin: "Assistant Admin",
    super_admin: "Super Admin",
  }

  const content = `
    <div class="greeting">Hello ${data.userName},</div>
    
    <div class="message">
      Your role has been updated by ${data.assignedBy}.
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Previous Role:</span>
        <span class="info-value">${roleNames[data.oldRole] || data.oldRole}</span>
      </div>
      <div class="info-row">
        <span class="info-label">New Role:</span>
        <span class="info-value" style="color: #10b981; font-weight: 600;">${roleNames[data.newRole] || data.newRole}</span>
      </div>
    </div>

    <div class="message">
      ${
        data.newRole === "admin" || data.newRole === "assistant_admin"
          ? `
        <p>You now have access to the admin panel. You can:</p>
        <ul style="margin: 16px 0; padding-left: 24px;">
          <li>Manage user transactions</li>
          <li>Review KYC submissions</li>
          <li>Handle gift card orders</li>
          <li>Manage Google Voice orders</li>
          <li>View platform analytics</li>
        </ul>
        <p>Please use your admin privileges responsibly.</p>
      `
          : `
        <p>Your access level has been changed. If you have any questions, please contact support.</p>
      `
      }
    </div>

    <div class="footer-note">
      If you believe this change was made in error, please contact our support team immediately.
    </div>
  `

  return {
    subject: "Your Role Has Been Updated",
    html: getEmailLayout(content, "Role Update Notification"),
  }
}
