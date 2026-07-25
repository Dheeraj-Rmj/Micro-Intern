import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';

import {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  RegisterCompanyOwnerSchema
} from '../application/dtos/auth.dto.js';

import type {
  LoginSchema,
  RegisterCandidateSchema,
  RefreshTokenSchema} from '../application/dtos/auth.dto.js';
import type {
  LoginUseCase,
  RegisterCandidateUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
} from '../application/use-cases/auth.usecase.js';
import type { Request, Response, NextFunction } from 'express';



/**
 * Auth Controller — presentation layer.
 *
 * Responsibilities:
 * - Parse and validate HTTP request (delegate to validate middleware)
 * - Call the appropriate use case
 * - Format the response
 *
 * Controllers MUST NOT contain business logic.
 * Controllers MUST NOT make direct DB calls.
 * Controllers are thin adapters between HTTP and application layer.
 */
export class AuthController {
  // OAuth Callbacks
  handleOAuthCallback = (req: Request, res: Response, next: NextFunction): void => {
    try {
      // The user object here is actually the result of OAuthLoginUseCase from our strategy
      const result = req.user as Record<string, unknown> | undefined;
      if (result === undefined || result === null || typeof result !== "object") {
        res.status(401).json({ success: false, error: { message: 'OAuth failed' } });
        return;
      }
      
      // Redirect back to frontend with tokens
      // For simplicity in this demo, we'll return JSON. In a real app we'd redirect to a frontend deep link
      // e.g. res.redirect(`http://localhost:3000/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`);
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
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute(req.body as ReturnType<typeof LoginSchema.parse>);
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  registerCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.registerCandidateUseCase.execute(
        req.body as ReturnType<typeof RegisterCandidateSchema.parse>,
      );
      ResponseFormatter.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body as ReturnType<typeof RefreshTokenSchema.parse>;
      const result = await this.refreshTokenUseCase.execute(refreshToken);
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
}
