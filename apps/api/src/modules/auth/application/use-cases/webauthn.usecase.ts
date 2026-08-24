import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateRegistrationOptionsOpts,
  type VerifyRegistrationResponseOpts,
  type GenerateAuthenticationOptionsOpts,
  type VerifyAuthenticationResponseOpts,
  type AuthenticatorTransport,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { IJwtService } from '../interfaces/IJwtService.js';
import type { ISessionService } from '../interfaces/ISessionService.js';
import { UnauthorizedError, ValidationError, AuthDomainError } from '@/shared/errors/index.js';
import { config } from '@/core/config.js';

// Determine the Relying Party (RP) info based on the environment
const rpName = 'Micro-Intern Ops';
const rpID = config.NODE_ENV === 'production' ? 'microintern.com' : 'localhost';
const expectedOrigin = config.NODE_ENV === 'production' ? ['https://ops.microintern.com', 'https://micro-intern.vercel.app'] : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

export class GenerateWebAuthnRegistrationUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');

    const userWebAuthnCredentials = await this.userRepository.getWebAuthnCredentials(userId);

    const options: GenerateRegistrationOptionsOpts = {
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from(user.id)),
      userName: user.email,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: userWebAuthnCredentials.map((cred) => ({
        id: cred.id,
        type: 'public-key',
        transports: cred.transports as AuthenticatorTransport[],
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'cross-platform',
      },
    };

    const optionsResponse = await generateRegistrationOptions(options);

    await this.userRepository.updateWebAuthnCurrentChallenge(userId, optionsResponse.challenge);

    return optionsResponse;
  }
}

export class VerifyWebAuthnRegistrationUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, body: any) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');

    const expectedChallenge = (user as any).webAuthnCurrentChallenge;
    if (!expectedChallenge) {
      throw new ValidationError('No active WebAuthn challenge found for user. Please restart registration.');
    }

    let verification;
    try {
      const opts: VerifyRegistrationResponseOpts = {
        response: body,
        expectedChallenge: `${expectedChallenge}`,
        expectedOrigin: expectedOrigin,
        expectedRPID: rpID,
      };
      verification = await verifyRegistrationResponse(opts);
    } catch (error: any) {
      throw new AuthDomainError('AUTH_MFA_TOKEN_INVALID', `WebAuthn verification failed: ${error.message}`);
    }

    if (verification && verification.verified && verification.registrationInfo) {
      const { registrationInfo } = verification;
      
      const newCredential = {
        id: registrationInfo.credential.id,
        publicKey: Buffer.from(registrationInfo.credential.publicKey),
        counter: BigInt(registrationInfo.credential.counter),
        deviceType: registrationInfo.credentialDeviceType,
        backedUp: registrationInfo.credentialBackedUp,
        transports: body.response.transports || [],
      };

      await this.userRepository.saveWebAuthnCredential(userId, newCredential);
      await this.userRepository.updateMfaSettings(userId, true);
      await this.userRepository.updateWebAuthnCurrentChallenge(userId, null);
      
      return { verified: true };
    }

    throw new AuthDomainError('AUTH_MFA_TOKEN_INVALID', 'Verification failed to produce credential info.');
  }
}

export class GenerateWebAuthnLoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');

    const userWebAuthnCredentials = await this.userRepository.getWebAuthnCredentials(userId);
    if (!userWebAuthnCredentials || userWebAuthnCredentials.length === 0) {
      throw new UnauthorizedError('No WebAuthn credentials found for user. Please use TOTP or register a key.');
    }

    const options: GenerateAuthenticationOptionsOpts = {
      rpID,
      timeout: 60000,
      allowCredentials: userWebAuthnCredentials.map((cred) => ({
        id: cred.id,
        type: 'public-key',
        transports: cred.transports as AuthenticatorTransport[],
      })),
      userVerification: 'preferred',
    };

    const optionsResponse = await generateAuthenticationOptions(options);

    await this.userRepository.updateWebAuthnCurrentChallenge(userId, optionsResponse.challenge);

    return optionsResponse;
  }
}

export class VerifyWebAuthnLoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private jwtService: IJwtService,
    private sessionService: ISessionService
  ) {}

  async execute(userId: string, body: any, ip: string, userAgent: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');

    const expectedChallenge = (user as any).webAuthnCurrentChallenge;
    if (!expectedChallenge) {
      throw new ValidationError('No active WebAuthn login challenge found for user.');
    }

    const userWebAuthnCredentials = await this.userRepository.getWebAuthnCredentials(userId);
    const bodyCredIDBuffer = isoBase64URL.toBuffer(body.id);
    
    // Find the credential that matches the credential ID
    const authenticator = userWebAuthnCredentials.find((cred) => {
      // In simplewebauthn, the cred.id stored might be the public key, or the actual ID.
      // Wait, in our schema, cred.id is the base64url of the credential ID!
      return cred.id === body.id;
    });

    if (!authenticator) {
      throw new UnauthorizedError('Authenticator is not registered with this site');
    }

    let verification;
    try {
      const opts: VerifyAuthenticationResponseOpts = {
        response: body,
        expectedChallenge: `${expectedChallenge}`,
        expectedOrigin: expectedOrigin,
        expectedRPID: rpID,
        credential: {
          id: authenticator.id,
          publicKey: new Uint8Array(authenticator.publicKey),
          counter: Number(authenticator.counter),
          transports: authenticator.transports as AuthenticatorTransport[],
        },
      };

      verification = await verifyAuthenticationResponse(opts);
    } catch (error: any) {
      throw new AuthDomainError('AUTH_MFA_TOKEN_INVALID', `WebAuthn verification failed: ${error.message}`);
    }

    if (verification && verification.verified) {
      const { authenticationInfo } = verification;
      
      // Update the counter
      await this.userRepository.saveWebAuthnCredential(userId, {
        id: authenticator.id,
        publicKey: authenticator.publicKey,
        counter: BigInt(authenticationInfo.newCounter),
        deviceType: (authenticator as any).deviceType || 'unknown',
        backedUp: (authenticator as any).backedUp || false,
        transports: authenticator.transports,
      });

      await this.userRepository.updateWebAuthnCurrentChallenge(userId, null);
      
      const sessionId = await this.sessionService.createSession(user.id);
      const { accessToken, refreshToken } = await this.jwtService.generateTokenPair(
        { id: user.id, email: user.email, role: user.role, companyId: null },
        sessionId
      );

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    }

    throw new AuthDomainError('AUTH_MFA_TOKEN_INVALID', 'Verification failed');
  }
}
