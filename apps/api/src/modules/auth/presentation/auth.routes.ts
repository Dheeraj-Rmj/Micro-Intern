import { AuditAction } from '@microintern/shared';
import { Router } from 'express';
import { z } from 'zod';

import { getContainer, type InfrastructureDependencies } from '@/core/container.js';
import { passport } from '@/core/passport.js';
import { audit } from '@/middleware/audit.middleware.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireMfaToken } from '@/middleware/mfa.middleware.js';
import { authRateLimiter } from '@/middleware/ratelimit.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';

import {
  LoginSchema,
  RegisterCandidateSchema,
  RefreshTokenSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from '../application/dtos/auth.dto.js';
import { AuthController } from './auth.controller.js';
import { MfaController } from './mfa.controller.js';
import { LoginUseCase, RefreshTokenUseCase, LogoutUseCase, RegisterCandidateUseCase } from '../application/use-cases/auth.usecase.js';
import { VerifyEmailUseCase, ResendVerificationEmailUseCase } from '../application/use-cases/email-verification.usecase.js';
import { ForgotPasswordUseCase, ResetPasswordUseCase } from '../application/use-cases/password-reset.usecase.js';
import { OAuthLoginUseCase } from '../application/use-cases/oauth.usecase.js';
import { ListSessionsUseCase, RevokeSessionUseCase, RevokeOtherSessionsUseCase } from '../application/use-cases/session.usecase.js';
import { SetupTotpUseCase, VerifyTotpUseCase } from '../application/use-cases/mfa.usecase.js';
import { MfaLoginUseCase } from '../application/use-cases/mfa-login.usecase.js';
import { GenerateWebAuthnRegistrationUseCase, VerifyWebAuthnRegistrationUseCase, GenerateWebAuthnLoginUseCase, VerifyWebAuthnLoginUseCase } from '../application/use-cases/webauthn.usecase.js';
import { WebAuthnController } from './webauthn.controller.js';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository.js';
import { BcryptPasswordService, RedisSessionService } from '../infrastructure/services/AuthServices.js';
import { JwtService } from '../infrastructure/services/JwtService.js';
import { TokenService } from '../infrastructure/services/TokenService.js';
import { QueueEmailAuthService } from '../infrastructure/services/QueueEmailAuthService.js';

const ResendVerificationSchema = z.object({
  email: z.string().email(),
});

/**
 * Auth router factory.
 * Creates controller with dependencies from container.
 */
export function createAuthRouter(): Router {
  const container = getContainer();
  
  // Register services lazily
  try { container.get('IUserRepository'); } catch {
    container.register('IUserRepository', (_infra: InfrastructureDependencies) => new PrismaUserRepository(_infra.db));
    container.register('IJwtService', () => new JwtService());
    container.register('IPasswordService', () => new BcryptPasswordService());
    container.register('ISessionService', (_infra: InfrastructureDependencies) => new RedisSessionService(_infra.db));
    container.register('TokenService', () => new TokenService());
    container.register('IEmailAuthService', () => new QueueEmailAuthService());

    container.register('LoginUseCase', (_infra: InfrastructureDependencies) => new LoginUseCase(
      container.get('IUserRepository'),
      container.get('IPasswordService'),
      container.get('IJwtService'),
      container.get('ISessionService')
    ));
    container.register('RegisterCandidateUseCase', (_infra: InfrastructureDependencies) => new RegisterCandidateUseCase(
      container.get('IUserRepository'),
      container.get('IPasswordService'),
      container.get('IJwtService'),
      container.get('ISessionService'),
      container.get('IEmailAuthService'),
      container.get('TokenService')
    ));
    container.register('OAuthLoginUseCase', (_infra: InfrastructureDependencies) => new OAuthLoginUseCase(
      container.get('IUserRepository'),
      container.get('IJwtService'),
      container.get('ISessionService')
    ));
    container.register('RefreshTokenUseCase', (_infra: InfrastructureDependencies) => new RefreshTokenUseCase(
      container.get('IJwtService'),
      container.get('ISessionService'),
      container.get('IUserRepository')
    ));
    container.register('LogoutUseCase', (_infra: InfrastructureDependencies) => new LogoutUseCase(
      container.get('ISessionService')
    ));
    container.register('VerifyEmailUseCase', () => new VerifyEmailUseCase(
      container.get('IUserRepository'),
      container.get('TokenService')
    ));
    container.register('ResendVerificationEmailUseCase', () => new ResendVerificationEmailUseCase(
      container.get('IUserRepository'),
      container.get('IEmailAuthService'),
      container.get('TokenService')
    ));
    container.register('ForgotPasswordUseCase', () => new ForgotPasswordUseCase(
      container.get('IUserRepository'),
      container.get('IEmailAuthService'),
      container.get('TokenService')
    ));
    container.register('ResetPasswordUseCase', () => new ResetPasswordUseCase(
      container.get('IUserRepository'),
      container.get('IPasswordService'),
      container.get('ISessionService'),
      container.get('IEmailAuthService'),
      container.get('TokenService')
    ));

    // Session Management Use Cases
    container.register('ListSessionsUseCase', (_infra: InfrastructureDependencies) => new ListSessionsUseCase(
      container.get('ISessionService')
    ));
    container.register('RevokeSessionUseCase', (_infra: InfrastructureDependencies) => new RevokeSessionUseCase(
      container.get('ISessionService')
    ));
    container.register('RevokeOtherSessionsUseCase', (_infra: InfrastructureDependencies) => new RevokeOtherSessionsUseCase(
      container.get('ISessionService')
    ));

    container.register('MfaLoginUseCase', () => new MfaLoginUseCase(
      container.get('IUserRepository'),
      container.get('IJwtService'),
      container.get('ISessionService')
    ));

    container.register('AuthController', (_infra: InfrastructureDependencies) => new AuthController(
      container.get('LoginUseCase'),
      container.get('RegisterCandidateUseCase'),
      container.get('RefreshTokenUseCase'),
      container.get('LogoutUseCase'),
      container.get('VerifyEmailUseCase'),
      container.get('ResendVerificationEmailUseCase'),
      container.get('ForgotPasswordUseCase'),
      container.get('ResetPasswordUseCase'),
      container.get('ListSessionsUseCase'),
      container.get('RevokeSessionUseCase'),
      container.get('RevokeOtherSessionsUseCase'),
      container.get('MfaLoginUseCase')
    ));

    // MFA
    container.register('SetupTotpUseCase', () => new SetupTotpUseCase(
      container.get('IUserRepository')
    ));
    container.register('VerifyTotpUseCase', () => new VerifyTotpUseCase(
      container.get('IUserRepository')
    ));
    container.register('MfaController', () => new MfaController(
      container.get('SetupTotpUseCase'),
      container.get('VerifyTotpUseCase')
    ));

    // WebAuthn
    container.register('GenerateWebAuthnRegistrationUseCase', () => new GenerateWebAuthnRegistrationUseCase(
      container.get('IUserRepository')
    ));
    container.register('VerifyWebAuthnRegistrationUseCase', () => new VerifyWebAuthnRegistrationUseCase(
      container.get('IUserRepository')
    ));
    container.register('GenerateWebAuthnLoginUseCase', () => new GenerateWebAuthnLoginUseCase(
      container.get('IUserRepository')
    ));
    container.register('VerifyWebAuthnLoginUseCase', () => new VerifyWebAuthnLoginUseCase(
      container.get('IUserRepository'),
      container.get('IJwtService'),
      container.get('ISessionService')
    ));
    container.register('WebAuthnController', () => new WebAuthnController(
      container.get('GenerateWebAuthnRegistrationUseCase'),
      container.get('VerifyWebAuthnRegistrationUseCase'),
      container.get('GenerateWebAuthnLoginUseCase'),
      container.get('VerifyWebAuthnLoginUseCase')
    ));
  }
  
  const controller = container.get<AuthController>('AuthController');
  const mfaController = container.get<MfaController>('MfaController');
  const webauthnController = container.get<WebAuthnController>('WebAuthnController');

  const router = Router();

  // POST /auth/register and /auth/register/candidate
  router.post(
    '/register',
    authRateLimiter,
    validate('body', RegisterCandidateSchema),
    audit(AuditAction.REGISTER, 'User'),
    (req, res, next) => { controller.registerCandidate(req, res, next).catch(next); },
  );

  router.post(
    '/register/candidate',
    authRateLimiter,
    validate('body', RegisterCandidateSchema),
    audit(AuditAction.REGISTER, 'User'),
    (req, res, next) => { controller.registerCandidate(req, res, next).catch(next); },
  );

  // POST /auth/login
  router.post(
    '/login',
    authRateLimiter,
    validate('body', LoginSchema),
    audit(AuditAction.LOGIN, 'User'),
    (req, res, next) => { controller.login(req, res, next).catch(next); },
  );

  // POST /auth/login/mfa
  router.post(
    '/login/mfa',
    authRateLimiter,
    // Add validation schema later
    (req, res, next) => { controller.loginMfa(req, res, next).catch(next); },
  );

  // MFA Routes
  router.post(
    '/mfa/setup/totp',
    authMiddleware,
    (req, res, next) => { mfaController.setupTotp(req, res, next).catch(next); },
  );

  router.post(
    '/mfa/verify/totp',
    authMiddleware,
    (req, res, next) => { mfaController.verifyTotp(req, res, next).catch(next); },
  );

  // WebAuthn Routes
  router.post(
    '/webauthn/register/generate',
    authMiddleware,
    (req, res, next) => { webauthnController.generateRegistrationOptions(req, res, next).catch(next); },
  );

  router.post(
    '/webauthn/register/verify',
    authMiddleware,
    (req, res, next) => { webauthnController.verifyRegistrationResponse(req, res, next).catch(next); },
  );

  router.post(
    '/webauthn/login/generate',
    authRateLimiter,
    requireMfaToken,
    (req, res, next) => { webauthnController.generateLoginOptions(req, res, next).catch(next); },
  );

  router.post(
    '/webauthn/login/verify',
    authRateLimiter,
    requireMfaToken,
    (req, res, next) => { webauthnController.verifyLoginResponse(req, res, next).catch(next); },
  );

  // GET /auth/verify-email?token=xxx
  router.get(
    '/verify-email',
    validate('query', VerifyEmailSchema),
    (req, res, next) => { controller.verifyEmail(req, res, next).catch(next); },
  );

  // POST /auth/resend-verification
  router.post(
    '/resend-verification',
    authRateLimiter,
    validate('body', ResendVerificationSchema),
    (req, res, next) => { controller.resendVerification(req, res, next).catch(next); },
  );

  // POST /auth/forgot-password
  router.post(
    '/forgot-password',
    authRateLimiter,
    validate('body', ForgotPasswordSchema),
    (req, res, next) => { controller.forgotPassword(req, res, next).catch(next); },
  );

  // POST /auth/reset-password
  router.post(
    '/reset-password',
    authRateLimiter,
    validate('body', ResetPasswordSchema),
    audit(AuditAction.UPDATE, 'User'),
    (req, res, next) => { controller.resetPassword(req, res, next).catch(next); },
  );

  // POST /auth/refresh
  router.post(
    '/refresh',
    validate('body', RefreshTokenSchema),
    (req, res, next) => { controller.refreshToken(req, res, next).catch(next); },
  );

  // POST /auth/logout
  router.post(
    '/logout',
    authMiddleware,
    audit(AuditAction.LOGOUT, 'User'),
    (req, res, next) => { controller.logout(req, res, next).catch(next); },
  );

  // GET /auth/me
  router.get(
    '/me',
    authMiddleware,
    (req, res) => { controller.me(req, res); },
  );

  // ── Device Logins & Session History Routes ────────────────────────────────
  // GET /auth/sessions
  router.get(
    '/sessions',
    authMiddleware,
    (req, res, next) => { controller.getSessions(req, res, next).catch(next); },
  );

  // DELETE /auth/sessions/:sessionId
  router.delete(
    '/sessions/:sessionId',
    authMiddleware,
    audit(AuditAction.LOGOUT, 'Session'),
    (req, res, next) => { controller.revokeSession(req, res, next).catch(next); },
  );

  // POST /auth/sessions/:sessionId/revoke
  router.post(
    '/sessions/:sessionId/revoke',
    authMiddleware,
    audit(AuditAction.LOGOUT, 'Session'),
    (req, res, next) => { controller.revokeSession(req, res, next).catch(next); },
  );

  // POST /auth/sessions/revoke-others
  router.post(
    '/sessions/revoke-others',
    authMiddleware,
    audit(AuditAction.LOGOUT, 'Session'),
    (req, res, next) => { controller.revokeOtherSessions(req, res, next).catch(next); },
  );

  // ── OAuth Routes ──────────────────────────────────────────────────────────
  // GET /auth/linkedin
  router.get(
    '/linkedin',
    passport.authenticate('linkedin', { session: false }),
  );

  // GET /auth/linkedin/callback
  router.get(
    '/linkedin/callback',
    passport.authenticate('linkedin', { session: false, failureRedirect: '/login' }),
    controller.handleOAuthCallback,
  );

  // GET /auth/microsoft
  router.get(
    '/microsoft',
    passport.authenticate('microsoft', { session: false, prompt: 'select_account' }),
  );

  // GET /auth/microsoft/callback
  router.get(
    '/microsoft/callback',
    passport.authenticate('microsoft', { session: false, failureRedirect: '/login' }),
    controller.handleOAuthCallback,
  );

  // GET /auth/github
  router.get(
    '/github',
    passport.authenticate('github', { session: false, scope: ['user:email'] }),
  );

  // GET /auth/github/callback
  router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    controller.handleOAuthCallback,
  );

  // GET /auth/google
  router.get(
    '/google',
    passport.authenticate('google', { session: false, scope: ['profile', 'email'], prompt: 'select_account' }),
  );

  // GET /auth/google/callback
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    controller.handleOAuthCallback,
  );

  return router;
}
