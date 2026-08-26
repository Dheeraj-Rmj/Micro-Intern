import { ResponseFormatter } from "@/shared/response/ResponseFormatter.js";
import { z } from "zod";

import { LoginSchema } from "@/modules/auth/application/dtos/auth.dto.js";

import type {
  InviteRecruiterUseCase,
  InviteAdminUseCase,
  AcceptInvitationUseCase,
} from "@/modules/auth/application/use-cases/invitation.usecase.js";
import type { ManagementLoginUseCase } from "@/modules/auth/application/use-cases/management-auth.usecase.js";
import type { Request, Response, NextFunction } from "express";

export const AcceptInvitationSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const InviteRecruiterSchema = z.object({
  email: z.string().email(),
  companyId: z.string().uuid(),
  companyName: z.string().min(1),
});

export const InviteAdminSchema = z.object({
  email: z.string().email(),
});

/**
 * Management Auth & Invitations Controller — presentation layer.
 *
 * Handles authentication for enterprise and platform management roles,
 * and manages onboarding invitations for recruiters and admins.
 */
export class ManagementController {
  constructor(
    private readonly managementLoginUseCase: ManagementLoginUseCase,
    private readonly inviteRecruiterUseCase: InviteRecruiterUseCase,
    private readonly inviteAdminUseCase: InviteAdminUseCase,
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = LoginSchema.parse(req.body);
      const ipAddress = req.ip || "";
      const result = await this.managementLoginUseCase.execute(dto, ipAddress);

      // Set httpOnly cookie for CSRF and XSS protection
      if ("tokens" in result && result.tokens && result.tokens.refreshToken) {
        res.cookie("refreshToken", result.tokens.refreshToken, {
          httpOnly: true,
          secure: process.env["NODE_ENV"] === "production",
          sameSite: process.env["NODE_ENV"] === "production" ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Remove refreshToken from the payload so it doesn't get stored in JS memory
        (result.tokens as any).refreshToken = undefined;
      }

      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  acceptInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = AcceptInvitationSchema.parse(req.body);
      const result = await this.acceptInvitationUseCase.execute(dto);
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  inviteRecruiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = InviteRecruiterSchema.parse(req.body);
      const invitedById = req.user?.id;
      if (invitedById === undefined) {
        res.status(401).json({ success: false, error: { message: "Unauthorized" } });
        return;
      }

      const result = await this.inviteRecruiterUseCase.execute({
        ...dto,
        invitedById,
      });

      ResponseFormatter.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  inviteAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = InviteAdminSchema.parse(req.body);
      const invitedById = req.user?.id;
      if (invitedById === undefined) {
        res.status(401).json({ success: false, error: { message: "Unauthorized" } });
        return;
      }

      const result = await this.inviteAdminUseCase.execute({
        ...dto,
        invitedById,
      });

      ResponseFormatter.created(res, result);
    } catch (error) {
      next(error);
    }
  };
}
