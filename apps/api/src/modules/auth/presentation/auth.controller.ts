import { config } from '@/core/config.js';
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
      const result = req.user as any;
      if (!result || !result.tokens) {
        res.redirect(`${config.FRONTEND_URL}/?error=OAuthFailed`);
        return;
      }
      
      const { accessToken, refreshToken } = result.tokens;

      // Set httpOnly cookie for refresh token
      if (refreshToken) {
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      // Redirect to frontend callback route with access token
      res.redirect(`${config.FRONTEND_URL}/oauth/callback?token=${accessToken}`);
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

      // Set httpOnly cookie for CSRF and XSS protection
      if (result.tokens && result.tokens.refreshToken) {
        res.cookie('refreshToken', result.tokens.refreshToken, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        // Remove refreshToken from the payload so it doesn't get stored in JS memory
        result.tokens.refreshToken = undefined as any;
      }

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

      // Set httpOnly cookie for CSRF and XSS protection
      if (result.tokens && result.tokens.refreshToken) {
        res.cookie('refreshToken', result.tokens.refreshToken, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        result.tokens.refreshToken = undefined as any;
      }

      ResponseFormatter.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metadata = parseDeviceFromRequest(req);
      // Try to get token from body first, then fallback to cookie
      const tokenFromBody = req.body?.refreshToken;
      const tokenFromCookie = req.cookies?.['refreshToken'] as string | undefined;
      const refreshTokenValue = tokenFromBody || tokenFromCookie;
      
      if (!refreshTokenValue) {
        res.status(401).json({ success: false, error: { message: 'Refresh token required' } });
        return;
      }

      const result = await this.refreshTokenUseCase.execute(refreshTokenValue, metadata);
      
      // Update the httpOnly cookie with the new refresh token if one was issued
      if ((result as any).refreshToken) {
        res.cookie('refreshToken', (result as any).refreshToken, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        (result as any).refreshToken = undefined;
      }

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
