import { createModuleLogger } from '@/core/logger.js';
import { AuthDomainError } from '@/shared/errors/DomainError.js';
import {
  UnauthorizedError,
  ConflictError,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  NotFoundError,
} from '@/shared/errors/index.js';

import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type {
  LoginDto,
  LoginResponse,
  RegisterCandidateDto,
} from '../dtos/auth.dto.js';
import type { IJwtService } from '../interfaces/IJwtService.js';
import type { IPasswordService } from '../interfaces/IPasswordService.js';
import type { ISessionService } from '../interfaces/ISessionService.js';

const log = createModuleLogger('LoginUseCase');

/**
 * Login Use Case.
 *
 * Application layer: Orchestrates domain objects and infrastructure services.
 * Contains NO business rules — only workflow coordination.
 * Contains NO database code — delegates to repository interfaces.
 * Contains NO HTTP concerns — returns domain objects, not HTTP responses.
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly jwtService: IJwtService,
    private readonly sessionService: ISessionService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResponse> {
    log.info({ email: dto.email }, 'Login attempt');

    // Find user
    const user = await this.userRepository.findByEmail(dto.email);
    if (user === null) {
      // Deliberate: same error for "not found" and "wrong password"
      // Prevents email enumeration attacks
      throw new UnauthorizedError('Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Account suspended. Contact support.', 'AUTH_ACCOUNT_SUSPENDED');
    }

    if (user.isLocked()) {
      throw new AuthDomainError(
        'AUTH_ACCOUNT_NOT_FOUND',
        `Account temporarily locked. Try again after ${user.lockedUntil?.toISOString()}.`,
      );
    }

    // Verify password
    if (user.passwordHash === null) {
      // OAuth-only account — no password set
      throw new UnauthorizedError(
        'This account uses social login. Please sign in with Google or GitHub.',
        'AUTH_INVALID_CREDENTIALS',
      );
    }

    const isPasswordValid = await this.passwordService.verify(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment login attempts
      await this.userRepository.incrementLoginAttempts(user.id);
      log.warn({ userId: user.id }, 'Invalid password attempt');
      throw new UnauthorizedError('Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }

    // Reset login attempts on success
    await this.userRepository.resetLoginAttempts(user.id);
    await this.userRepository.updateLastLogin(user.id, ''); // IP filled by caller

    // Create session
    const sessionId = await this.sessionService.createSession(user.id);

    // Generate tokens
    const tokens = await this.jwtService.generateTokenPair(user, sessionId);

    log.info({ userId: user.id, sessionId }, 'Login successful');

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId ?? null,
        emailVerifiedAt: user.emailVerifiedAt,
        avatarUrl: user.avatarUrl,
      },
      tokens,
    };
  }
}

/**
 * Register Candidate Use Case.
 */
export class RegisterCandidateUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly jwtService: IJwtService,
    private readonly sessionService: ISessionService,
  ) {}

  async execute(dto: RegisterCandidateDto): Promise<LoginResponse> {
    log.info({ email: dto.email }, 'Candidate registration');

    // Check email uniqueness
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing !== null) {
      throw new ConflictError('An account with this email already exists', 'AUTH_EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(dto.password);

    // Create user + candidate profile in transaction
    const user = await this.userRepository.createCandidate({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    // Create session
    const sessionId = await this.sessionService.createSession(user.id);

    // Generate tokens
    const tokens = await this.jwtService.generateTokenPair(user, sessionId);

    log.info({ userId: user.id }, 'Candidate registered successfully');

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: null,
        emailVerifiedAt: user.emailVerifiedAt,
        avatarUrl: user.avatarUrl,
      },
      tokens,
    };
  }
}

/**
 * Refresh Token Use Case.
 */
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: IJwtService,
    private readonly sessionService: ISessionService,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    // Verify refresh token
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);

    // Verify session is still valid
    const isSessionValid = await this.sessionService.isSessionValid(
      payload.sub,
      payload.sessionId,
    );

    if (!isSessionValid) {
      throw new UnauthorizedError('Session expired. Please log in again.', 'AUTH_REFRESH_TOKEN_INVALID');
    }

    // Get current user (role may have changed)
    const user = await this.userRepository.findById(payload.sub);
    if (user === null) {
      throw new UnauthorizedError('User not found', 'AUTH_ACCOUNT_NOT_FOUND');
    }

    // Issue new access token (refresh token stays the same)
    const { accessToken, expiresIn } = await this.jwtService.generateAccessToken(
      user,
      payload.sessionId,
    );

    return { accessToken, expiresIn };
  }
}

/**
 * Logout Use Case.
 */
export class LogoutUseCase {
  constructor(private readonly sessionService: ISessionService) {}

  async execute(userId: string, sessionId: string): Promise<void> {
    await this.sessionService.revokeSession(userId, sessionId);
    log.info({ userId, sessionId }, 'User logged out');
  }
}

/**
 * Logout All Sessions Use Case.
 */
export class LogoutAllSessionsUseCase {
  constructor(private readonly sessionService: ISessionService) {}

  async execute(userId: string): Promise<void> {
    await this.sessionService.revokeAllSessions(userId);
    log.info({ userId }, 'All sessions revoked');
  }
}
