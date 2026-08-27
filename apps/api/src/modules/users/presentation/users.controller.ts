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
      const { companyName } = req.body;

      if (!companyName || typeof companyName !== "string") {
        res.status(400).json({ success: false, message: "companyName is required" });
        return;
      }

      const data = await usersUseCase.generateOnboardingUrl(superAdminId, companyName);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
