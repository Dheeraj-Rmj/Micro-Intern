import type { Request, Response, NextFunction } from 'express';
import { GenerateWebAuthnRegistrationUseCase, VerifyWebAuthnRegistrationUseCase, GenerateWebAuthnLoginUseCase, VerifyWebAuthnLoginUseCase } from '../application/use-cases/webauthn.usecase.js';
import { ApiResponse } from '@/shared/utils/ApiResponse.js';
import { UnauthorizedError } from '@/shared/errors/index.js';

export class WebAuthnController {
  constructor(
    private generateWebAuthnRegistrationUseCase: GenerateWebAuthnRegistrationUseCase,
    private verifyWebAuthnRegistrationUseCase: VerifyWebAuthnRegistrationUseCase,
    private generateWebAuthnLoginUseCase: GenerateWebAuthnLoginUseCase,
    private verifyWebAuthnLoginUseCase: VerifyWebAuthnLoginUseCase
  ) {}

  // ── Registration (Setup YubiKey) ───────────────────────────────────────────

  generateRegistrationOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError('Unauthorized');
      }

      const options = await this.generateWebAuthnRegistrationUseCase.execute(req.user.id);
      res.status(200).json(ApiResponse.success(options, 'WebAuthn registration options generated'));
    } catch (error) {
      next(error);
    }
  };

  verifyRegistrationResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError('Unauthorized');
      }

      const verification = await this.verifyWebAuthnRegistrationUseCase.execute(req.user.id, req.body);
      res.status(200).json(ApiResponse.success(verification, 'WebAuthn registration successful'));
    } catch (error) {
      next(error);
    }
  };

  // ── Authentication (Login with YubiKey) ──────────────────────────────────

  generateLoginOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Look at req.user (from requireMfaToken) or req.body (fallback)
      const userId = req.user?.id || req.body.userId;
      if (!userId) {
        throw new UnauthorizedError('User identification missing for WebAuthn login');
      }

      const options = await this.generateWebAuthnLoginUseCase.execute(userId);
      res.status(200).json(ApiResponse.success(options, 'WebAuthn login options generated'));
    } catch (error) {
      next(error);
    }
  };

  verifyLoginResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || req.body.userId;
      if (!userId) {
        throw new UnauthorizedError('User identification missing for WebAuthn login');
      }

      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await this.verifyWebAuthnLoginUseCase.execute(userId, req.body, ip, userAgent);
      
      // Set refresh token in HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      });

      res.status(200).json(ApiResponse.success({
        accessToken: result.accessToken,
        user: result.user
      }, 'WebAuthn login successful'));
    } catch (error) {
      next(error);
    }
  };
}
