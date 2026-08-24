import type { AuthTokensResponse } from "../dtos/auth.dto.js";

/**
 * JWT Service Interface — domain layer contract.
 *
 * The domain layer defines what it needs.
 * The infrastructure layer provides the implementation.
 * This inversion enables testing without real JWT signing.
 */
export interface IJwtService {
  generateTokenPair(
    user: { id: string; email: string; role: string; companyId?: string | null },
    sessionId: string,
  ): Promise<AuthTokensResponse>;

  generateAccessToken(
    user: { id: string; email: string; role: string; companyId?: string | null },
    sessionId: string,
  ): Promise<{ accessToken: string; expiresIn: number }>;

  verifyAccessToken(token: string): Promise<{
    sub: string;
    email: string;
    role: string;
    companyId: string | null;
    sessionId: string;
  }>;

  verifyRefreshToken(token: string): Promise<{
    sub: string;
    sessionId: string;
  }>;

  generateMfaToken(userId: string): Promise<string>;
  verifyMfaToken(token: string): Promise<{ sub: string }>;
}
