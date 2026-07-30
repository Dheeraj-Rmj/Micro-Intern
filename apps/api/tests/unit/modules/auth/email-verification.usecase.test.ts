import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  SendVerificationEmailUseCase,
  VerifyEmailUseCase,
} from '@/modules/auth/application/use-cases/email-verification.usecase.js';
import { TokenService } from '@/modules/auth/infrastructure/services/TokenService.js';

describe('EmailVerificationUseCases', () => {
  let sendUseCase: SendVerificationEmailUseCase;
  let verifyUseCase: VerifyEmailUseCase;
  let mockUserRepo: any;
  let mockEmailService: any;
  let tokenService: TokenService;

  beforeEach(() => {
    mockUserRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      createVerificationToken: vi.fn(),
      findVerificationToken: vi.fn(),
      markVerificationTokenUsed: vi.fn(),
      setEmailVerified: vi.fn(),
    };

    mockEmailService = {
      sendVerificationEmail: vi.fn(),
    };

    tokenService = new TokenService();

    sendUseCase = new SendVerificationEmailUseCase(
      mockUserRepo,
      mockEmailService,
      tokenService,
    );

    verifyUseCase = new VerifyEmailUseCase(
      mockUserRepo,
      tokenService,
    );
  });

  describe('SendVerificationEmailUseCase', () => {
    it('should generate token, store in repo, and send email if user is unverified', async () => {
      mockUserRepo.findById.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Jane',
        emailVerifiedAt: null,
      });

      await sendUseCase.execute('user-1');

      expect(mockUserRepo.createVerificationToken).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: 'EMAIL_VERIFICATION',
        }),
      );
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          firstName: 'Jane',
        }),
      );
    });

    it('should skip sending email if user is already verified', async () => {
      mockUserRepo.findById.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Jane',
        emailVerifiedAt: new Date(),
      });

      await sendUseCase.execute('user-1');

      expect(mockUserRepo.createVerificationToken).not.toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('VerifyEmailUseCase', () => {
    it('should verify email and mark token as used when valid token is provided', async () => {
      const plainToken = 'valid-token';
      mockUserRepo.findVerificationToken.mockResolvedValue({
        id: 'token-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 10000),
        usedAt: null,
      });

      await verifyUseCase.execute(plainToken);

      expect(mockUserRepo.markVerificationTokenUsed).toHaveBeenCalledWith('token-1');
      expect(mockUserRepo.setEmailVerified).toHaveBeenCalledWith('user-1');
    });

    it('should throw AuthDomainError when token is expired', async () => {
      const plainToken = 'expired-token';
      mockUserRepo.findVerificationToken.mockResolvedValue({
        id: 'token-2',
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 10000),
        usedAt: null,
      });

      await expect(verifyUseCase.execute(plainToken)).rejects.toThrowError(
        'Verification token has expired',
      );
    });
  });
});
