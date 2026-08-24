import { Request, Response, NextFunction } from "express";
import { UsersUseCase } from "../application/use-cases/users.usecase.js";
import { prisma } from "@/core/database.js";

const usersUseCase = new UsersUseCase(prisma as any);

export class UsersController {
  /**
   * Generates a new onboarding token and URL.
   * Used by Super Admin.
   */
  async generateUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const superAdminId = req.user?.id || "unknown";
      const data = await usersUseCase.generateOnboardingUrl(superAdminId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
