import crypto from "crypto";
import { UserRepository } from "../../repositories/user.repository.js";
import { AdminInvitationRepository } from "../../repositories/admin-invitation.repository.js";
import { NotificationService } from "../../services/shared/notification.service.js";
import { ERROR_CODES, ERROR_MESSAGES } from "../../constants/error-codes.js";
import { createError } from "../../middlewares/common/error.middleware.js";
import { USER_ROLE } from "../../constants/statuses.js";
import type { UserRole } from "../../constants/statuses.js";

export class AdminRoleService {
  private userRepository: UserRepository;
  private invitationRepository: AdminInvitationRepository;
  private notificationService: NotificationService;

  constructor() {
    this.userRepository = new UserRepository();
    this.invitationRepository = new AdminInvitationRepository();
    this.notificationService = new NotificationService();
  }

  async assignRole(superAdminId: string, userId: string, newRole: UserRole) {
    // Validate role
    const allowedRoles = [
      USER_ROLE.USER,
      USER_ROLE.ADMIN,
      USER_ROLE.ASSISTANT_ADMIN,
    ] as UserRole[];
    if (!allowedRoles.includes(newRole)) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.INVALID_INPUT],
        400,
        ERROR_CODES.INVALID_INPUT
      );
    }

    // Cannot assign super_admin role
    if (newRole === USER_ROLE.SUPER_ADMIN) {
      throw createError(
        "Cannot assign super admin role",
        403,
        ERROR_CODES.FORBIDDEN
      );
    }

    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND],
        404,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    // Cannot change super admin's role
    if (user.role === USER_ROLE.SUPER_ADMIN) {
      throw createError(
        "Cannot change super admin role",
        403,
        ERROR_CODES.FORBIDDEN
      );
    }

    const oldRole = user.role;

    // Update role
    const updatedUser = await this.userRepository.update(userId, {
      role: newRole,
    } as any);

    await this.notificationService.send({
      userId,
      type: "role_change",
      title: "Your Role Has Been Updated",
      message: `Your role has been changed from ${oldRole} to ${newRole} by ${user.name}`,
      channels: ["email"],
      userEmail: user.email,
      userName: user.name,
      templateType: "role-assigned",
      templateData: {
        userName: user.name,
        oldRole,
        newRole,
        assignedBy: user.name,
      },
    });

    return updatedUser;
  }

  async inviteAdmin(superAdminId: string, email: string, role: UserRole) {
    // Validate role
    const allowedRoles = [
      USER_ROLE.ADMIN,
      USER_ROLE.ASSISTANT_ADMIN,
    ] as UserRole[];
    if (!allowedRoles.includes(role)) {
      throw createError(
        "Can only invite admin or assistant admin",
        400,
        ERROR_CODES.INVALID_INPUT
      );
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw createError(
        "User with this email already exists. Use assign role instead.",
        400,
        ERROR_CODES.USER_ALREADY_EXISTS
      );
    }

    // Check if there's already a pending invitation
    const existingInvitation =
      await this.invitationRepository.findByEmail(email);
    if (existingInvitation && existingInvitation.status === "pending") {
      throw createError(
        "Invitation already sent to this email",
        400,
        ERROR_CODES.INVITATION_ALREADY_EXISTS
      );
    }

    // Get super admin details
    const superAdmin = await this.userRepository.findById(superAdminId);
    if (!superAdmin) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND],
        404,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation
    const invitation = await this.invitationRepository.create({
      email,
      role,
      invitedBy: superAdminId,
      token,
      expiresAt,
      status: "pending",
    } as any);

    const invitationLink = `${process.env.FRONTEND_URL}/admin/accept-invitation?token=${token}`;

    await this.notificationService.send({
      userId: superAdminId, // Use super admin's ID for notification record
      type: "admin_invitation",
      title: "You've Been Invited to Join as Admin",
      message: `${superAdmin.name} has invited you to join the platform as ${role}`,
      channels: ["email"],
      userEmail: email,
      userName: email.split("@")[0], // Use email prefix as temporary name
      templateType: "admin-invitation",
      templateData: {
        invitedBy: superAdmin.name,
        role,
        invitationLink,
        expiresAt: expiresAt.toLocaleDateString(),
      },
    });

    return invitation;
  }

  async getAllUsers(
    page = 1,
    limit = 20,
    roleFilter?: UserRole,
    search?: string
  ) {
    const skip = (page - 1) * limit;
    const filters: any = {};
    if (roleFilter) {
      filters.role = roleFilter;
    }

    const [users, total] = await Promise.all([
      this.userRepository.findAllWithPagination(skip, limit, filters, search),
      this.userRepository.countWithFilters(filters, search),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPendingInvitations() {
    // Expire old invitations first
    await this.invitationRepository.expireOldInvitations();

    return this.invitationRepository.getPendingInvitations();
  }

  async cancelInvitation(invitationId: string) {
    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation) {
      throw createError(
        "Invitation not found",
        404,
        ERROR_CODES.INVITATION_NOT_FOUND
      );
    }

    if (invitation.status !== "pending") {
      throw createError(
        "Can only cancel pending invitations",
        400,
        ERROR_CODES.INVALID_INPUT
      );
    }

    return this.invitationRepository.update(invitationId, {
      status: "expired",
    } as any);
  }

  async resendInvitation(invitationId: string) {
    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation) {
      throw createError(
        "Invitation not found",
        404,
        ERROR_CODES.INVITATION_NOT_FOUND
      );
    }

    if (invitation.status !== "pending") {
      throw createError(
        "Can only resend pending invitations",
        400,
        ERROR_CODES.INVALID_INPUT
      );
    }

    // Generate new token and extend expiry
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.invitationRepository.update(invitationId, {
      token,
      expiresAt,
    } as any);

    // Get inviter details
    const inviter = await this.userRepository.findById(
      invitation.invitedBy.toString()
    );

    const invitationLink = `${process.env.FRONTEND_URL}/admin/accept-invitation?token=${token}`;

    await this.notificationService.send({
      userId: invitation.invitedBy.toString(),
      type: "admin_invitation",
      title: "Reminder: Admin Invitation",
      message: `${inviter?.name || "Admin"} has invited you to join the platform`,
      channels: ["email"],
      userEmail: invitation.email,
      userName: invitation.email.split("@")[0],
      templateType: "admin-invitation",
      templateData: {
        invitedBy: inviter?.name || "Admin",
        role: invitation.role,
        invitationLink,
        expiresAt: expiresAt.toLocaleDateString(),
      },
    });

    return invitation;
  }
}
