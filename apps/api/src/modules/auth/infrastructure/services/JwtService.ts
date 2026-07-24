import jwt from 'jsonwebtoken';

import type { IJwtService } from '../../application/interfaces/IJwtService.js';
import type { AuthTokensResponse } from '../../application/dtos/auth.dto.js';
import { config } from '@/core/config.js';
import { UnauthorizedError } from '@/shared/errors/index.js';

/**
 * JWT service — signs and verifies access and refresh tokens.
 *
 * Access token: short-lived (15min), contains full user context
 * Refresh token: long-lived (7d), contains only userId + sessionId
 *
 * Both tokens use HS256 with separate secrets — if refresh secret
 * is compromised, access tokens remain valid only for 15min max.
 */
export class JwtService implements IJwtService {
  private readonly accessSecret = config.JWT_ACCESS_SECRET;
  private readonly refreshSecret = config.JWT_REFRESH_SECRET;
  private readonly issuer = config.JWT_ISSUER;
  private readonly audience = config.JWT_AUDIENCE;

  async generateTokenPair(
    user: { id: string; email: string; role: string; companyId?: string | null },
    sessionId: string,
  ): Promise<AuthTokensResponse> {
    const { accessToken, expiresIn } = await this.generateAccessToken(user, sessionId);
    const refreshToken = this.signRefreshToken(user.id, sessionId);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  async generateAccessToken(
    user: { id: string; email: string; role: string; companyId?: string | null },
    sessionId: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const expiresIn = 15 * 60; // 15 minutes in seconds

    const accessToken = jwt.sign(
      {
        email: user.email,
        role: user.role,
        companyId: user.companyId ?? null,
        sessionId,
      },
      this.accessSecret,
      {
        subject: user.id,
        expiresIn,
        issuer: this.issuer,
        audience: this.audience,
        algorithm: 'HS256',
      },
    );

    return { accessToken, expiresIn };
  }

  private signRefreshToken(userId: string, sessionId: string): string {
    return jwt.sign(
      { sessionId },
      this.refreshSecret,
      {
        subject: userId,
        expiresIn: '7d',
        issuer: this.issuer,
        audience: this.audience,
        algorithm: 'HS256',
      },
    );
  }

  async verifyAccessToken(token: string): Promise<{
    sub: string;
    email: string;
    role: string;
    companyId: string | null;
    sessionId: string;
  }> {
    try {
      const payload = jwt.verify(token, this.accessSecret, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ['HS256'],
      }) as jwt.JwtPayload;

      return {
        sub: payload['sub'] as string,
        email: payload['email'] as string,
        role: payload['role'] as string,
        companyId: (payload['companyId'] as string | null) ?? null,
        sessionId: payload['sessionId'] as string,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Access token expired', 'AUTH_TOKEN_EXPIRED');
      }
      throw new UnauthorizedError('Invalid access token', 'AUTH_TOKEN_INVALID');
    }
  }

  async verifyRefreshToken(token: string): Promise<{ sub: string; sessionId: string }> {
    try {
      const payload = jwt.verify(token, this.refreshSecret, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ['HS256'],
      }) as jwt.JwtPayload;

      return {
        sub: payload['sub'] as string,
        sessionId: payload['sessionId'] as string,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token expired. Please log in again.', 'AUTH_REFRESH_TOKEN_INVALID');
      }
      throw new UnauthorizedError('Invalid refresh token', 'AUTH_REFRESH_TOKEN_INVALID');
    }
  }
}
