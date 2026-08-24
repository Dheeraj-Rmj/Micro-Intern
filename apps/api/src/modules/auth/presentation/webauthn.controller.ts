import type { Request, Response, NextFunction } from 'express';
import { GenerateWebAuthnRegistrationUseCase, VerifyWebAuthnRegistrationUseCase, GenerateWebAuthnLoginUseCase, VerifyWebAuthnLoginUseCase } from '../application/use-cases/webauthn.usecase.js';
import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';
import { UnauthorizedError } from '@/shared/errors/index.js';
import { config } from '@/core/config.js';

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
      ResponseFormatter.success(res, { data: options, message: 'WebAuthn registration options generated' });
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
      ResponseFormatter.success(res, { data: verification, message: 'WebAuthn registration successful' });
    } catch (error) {
      next(error);
    }
  };

  // ── Authentication (Login with YubiKey) ──────────────────────────────────

  generateLoginOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Look at req.user (from requireMfaToken)
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('User identification missing for WebAuthn login');
      }

      const options = await this.generateWebAuthnLoginUseCase.execute(userId);
      ResponseFormatter.success(res, { data: options, message: 'WebAuthn login options generated' });
    } catch (error) {
      next(error);
    }
  };

  verifyLoginResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('User identification missing for WebAuthn login');
      }

      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await this.verifyWebAuthnLoginUseCase.execute(userId, req.body, ip, userAgent);
      
      // Set refresh token in HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      });

      ResponseFormatter.success(res, {
        data: {
          accessToken: result.accessToken,
          user: result.user
        },
        message: 'WebAuthn login successful'
      });
    } catch (error) {
      next(error);
    }
  };
}
