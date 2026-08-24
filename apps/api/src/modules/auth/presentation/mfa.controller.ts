import type { Request, Response, NextFunction } from "express";
import { ResponseFormatter } from "@/shared/response/ResponseFormatter.js";
import type { SetupTotpUseCase, VerifyTotpUseCase } from "../application/use-cases/mfa.usecase.js";

export class MfaController {
  constructor(
    private readonly setupTotpUseCase: SetupTotpUseCase,
    private readonly verifyTotpUseCase: VerifyTotpUseCase,
  ) {}

  setupTotp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.setupTotpUseCase.execute(userId);

      ResponseFormatter.success(res, { message: "TOTP setup initialized", ...result });
    } catch (error) {
      next(error);
    }
  };

  verifyTotp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { token } = req.body;

      if (!token) {
        throw new Error("TOTP token is required"); // Will be handled by global error handler
      }

      await this.verifyTotpUseCase.execute(userId, token);

      ResponseFormatter.success(res, { message: "TOTP verified and enabled successfully" });
    } catch (error) {
      next(error);
    }
  };
}
