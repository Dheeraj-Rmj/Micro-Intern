import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';
import { parseDeviceFromRequest } from '@/shared/utils/device-parser.js';

import {
  LoginSchema,
  RegisterCandidateSchema,
  RefreshTokenSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from '../application/dtos/auth.dto.js';
import { z } from 'zod';

import type {
  LoginUseCase,
  RegisterCandidateUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
} from '../application/use-cases/auth.usecase.js';
import type {
  VerifyEmailUseCase,
  ResendVerificationEmailUseCase,
} from '../application/use-cases/email-verification.usecase.js';
import type {
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
} from '../application/use-cases/password-reset.usecase.js';
import type {
  ListSessionsUseCase,
  RevokeSessionUseCase,
  RevokeOtherSessionsUseCase,
} from '../application/use-cases/session.usecase.js';
import type { Request, Response, NextFunction } from 'express';

const ResendVerificationSchema = z.object({
  email: z.string().email(),
});

/**
 * Auth Controller — presentation layer.
 *
 * Responsibilities:
 * - Parse and validate HTTP request (delegate to validate middleware)
 * - Extract client device telemetry
 * - Call the appropriate use case
 * - Format the response
 */
export class AuthController {
  // OAuth Callbacks
  handleOAuthCallback = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = req.user as Record<string, unknown> | undefined;
      if (result === undefined || result === null || typeof result !== 'object') {
        res.status(401).json({ success: false, error: { message: 'OAuth failed' } });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerCandidateUseCase: RegisterCandidateUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationEmailUseCase: ResendVerificationEmailUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly listSessionsUseCase: ListSessionsUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
    private readonly revokeOtherSessionsUseCase: RevokeOtherSessionsUseCase,
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metadata = parseDeviceFromRequest(req);
      const result = await this.loginUseCase.execute(
        req.body as ReturnType<typeof LoginSchema.parse>,
        metadata,
      );
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  registerCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metadata = parseDeviceFromRequest(req);
      const result = await this.registerCandidateUseCase.execute(
        req.body as ReturnType<typeof RegisterCandidateSchema.parse>,
        metadata,
      );
      ResponseFormatter.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metadata = parseDeviceFromRequest(req);
      const { refreshToken } = req.body as ReturnType<typeof RefreshTokenSchema.parse>;
      const result = await this.refreshTokenUseCase.execute(refreshToken, metadata);
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user === undefined) {
        ResponseFormatter.noContent(res);
        return;
      }
      await this.logoutUseCase.execute(req.user.id, req.user.sessionId);
      ResponseFormatter.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  me = (req: Request, res: Response): void => {
    ResponseFormatter.success(res, req.user);
  };

  // ── Device Logins & Session History ──────────────────────────────────────

  getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      const sessions = await this.listSessionsUseCase.execute(req.user.id, req.user.sessionId);
      ResponseFormatter.success(res, { sessions });
    } catch (error) {
      next(error);
    }
  };

  revokeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      const { sessionId } = req.params as { sessionId: string };
      const result = await this.revokeSessionUseCase.execute(req.user.id, sessionId);
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  revokeOtherSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      const result = await this.revokeOtherSessionsUseCase.execute(req.user.id, req.user.sessionId);
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  // ── Verification & Password Resets ────────────────────────────────────────

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = VerifyEmailSchema.parse(req.query);
      await this.verifyEmailUseCase.execute(token);
      ResponseFormatter.success(res, { message: 'Email successfully verified' });
    } catch (error) {
      next(error);
    }
  };

  resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = ResendVerificationSchema.parse(req.body);
      await this.resendVerificationEmailUseCase.execute(email);
      ResponseFormatter.success(res, { message: 'If an account exists, a verification email has been sent' });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = ForgotPasswordSchema.parse(req.body);
      await this.forgotPasswordUseCase.execute(email);
      ResponseFormatter.success(res, { message: 'If an account exists, a password reset email has been sent' });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = ResetPasswordSchema.parse(req.body);
      await this.resetPasswordUseCase.execute(token, newPassword);
      ResponseFormatter.success(res, { message: 'Password has been reset successfully' });
    } catch (error) {
      next(error);
    }
  };
}
