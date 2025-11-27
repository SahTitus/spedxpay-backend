import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware.js";
import { AdminRoleService } from "../../services/admin/admin-role.service.js";
import { successResponse } from "../../utils/response-formatter.js";
import { asyncHandler } from "../../middlewares/common/error.middleware.js";
import { USER_ROLE, type UserRole } from "../../constants/statuses.js";
import { createError } from "../../middlewares/common/error.middleware.js";
import { ERROR_CODES } from "../../constants/error-codes.js";

export class AdminRoleController {
  private adminRoleService: AdminRoleService;

  constructor() {
    this.adminRoleService = new AdminRoleService();
  }

  assignRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;
    const superAdminId = req.user!.userId;

    const user = await this.adminRoleService.assignRole(
      superAdminId,
      userId,
      role
    );

    res.status(200).json(successResponse("Role assigned successfully", user));
  });

  inviteAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, role } = req.body;
    const superAdminId = req.user!.userId;

    const invitation = await this.adminRoleService.inviteAdmin(
      superAdminId,
      email,
      role
    );

    res
      .status(201)
      .json(successResponse("Admin invitation sent successfully", invitation));
  });

  getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const search = req.query.search as string;
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 20;
    const roleFilterParam = req.query.role as string | undefined;

    let roleFilter: UserRole | undefined;
    if (roleFilterParam) {
      const validRoles = Object.values(USER_ROLE) as UserRole[];
      if (!validRoles.includes(roleFilterParam as UserRole)) {
        throw createError(
          "Invalid role filter. Must be one of: user, admin, assistant_admin, super_admin",
          400,
          ERROR_CODES.INVALID_INPUT
        );
      }
      roleFilter = roleFilterParam as UserRole;
    }

    const users = await this.adminRoleService.getAllUsers(
      page,
      limit,
      roleFilter,
      search
    );

    res
      .status(200)
      .json(successResponse("Users retrieved successfully", users));
  });

  getPendingInvitations = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const invitations = await this.adminRoleService.getPendingInvitations();

      res
        .status(200)
        .json(
          successResponse(
            "Pending invitations retrieved successfully",
            invitations
          )
        );
    }
  );

  cancelInvitation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { invitationId } = req.params;

    const invitation =
      await this.adminRoleService.cancelInvitation(invitationId);

    res
      .status(200)
      .json(successResponse("Invitation cancelled successfully", invitation));
  });

  resendInvitation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { invitationId } = req.params;

    const invitation =
      await this.adminRoleService.resendInvitation(invitationId);

    res
      .status(200)
      .json(successResponse("Invitation resent successfully", invitation));
  });
}
