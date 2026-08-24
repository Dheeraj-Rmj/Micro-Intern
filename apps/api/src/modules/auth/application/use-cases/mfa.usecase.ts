import { generateSecret, verify, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { UnauthorizedError, ValidationError } from '@/shared/errors/index.js';
import { config } from '@/core/config.js';

export class SetupTotpUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<{ qrCodeUrl: string; secret: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');

    const secret = generateSecret();
    const otpauth = generateURI({
      issuer: 'MicroIntern (SuperAdmin)',
      label: user.email,
      secret,
    });
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    await this.userRepository.updateMfaSettings(userId, false, secret);

    return { qrCodeUrl, secret };
  }
}

export class VerifyTotpUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, token: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    if (!user.totpSecret) throw new ValidationError('TOTP not setup');

    const result = await verify({ token, secret: user.totpSecret });
    if (!result.valid) throw new UnauthorizedError('Invalid TOTP token', 'AUTH_MFA_TOKEN_INVALID');

    await this.userRepository.updateMfaSettings(userId, true);
  }
}
