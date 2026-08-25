import crypto from "node:crypto";

/**
 * Token Service — generates, hashes, and verifies secure one-time tokens.
 *
 * Design:
 * - Tokens are generated as cryptographically random 32-byte hex strings
 * - Only the SHA-256 hash is stored in the database
 * - The plain token is sent to the user via email
 * - Comparison uses crypto.timingSafeEqual to prevent timing attacks
 *
 * This pattern (store hash, email plain) means:
 * - Database breach does not expose valid tokens
 * - Tokens are single-use and time-limited
 */
export class TokenService {
  /**
   * Generate a secure random token (plain text — email this to the user).
   * Returns a 64-character hex string.
   */
  generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Generate a secure 6-digit OTP token.
   */
  generateOtpToken(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Hash a plain token for database storage.
   * Always store this hash, never the plain token.
   */
  hashToken(plainToken: string): string {
    return crypto.createHash("sha256").update(plainToken).digest("hex");
  }

  /**
   * Constant-time comparison to prevent timing attacks.
   */
  verifyToken(plainToken: string, storedHash: string): boolean {
    const inputHash = this.hashToken(plainToken);
    try {
      return crypto.timingSafeEqual(Buffer.from(inputHash, "hex"), Buffer.from(storedHash, "hex"));
    } catch {
      return false;
    }
  }
}

// Singleton
let tokenServiceInstance: TokenService | null = null;

export function getTokenService(): TokenService {
  if (tokenServiceInstance === null) {
    tokenServiceInstance = new TokenService();
  }
  return tokenServiceInstance;
}
