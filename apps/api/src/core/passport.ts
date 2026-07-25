import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';

import { config } from './config.js';
import { getContainer } from './container.js';

import type { OAuthLoginUseCase } from '../modules/auth/application/use-cases/oauth.usecase.js';

interface PassportProfile {
  id: string;
  emails?: Array<{ value: string }>;
  name?: { givenName?: string; familyName?: string };
  photos?: Array<{ value: string }>;
  userPrincipalName?: string;
  displayName?: string;
}

type VerifyCallback = (error: unknown, user?: unknown, info?: unknown) => void;

// Setup LinkedIn Strategy
if (config.LINKEDIN_CLIENT_ID !== undefined && config.LINKEDIN_CLIENT_SECRET !== undefined && config.LINKEDIN_CLIENT_SECRET !== undefined && config.LINKEDIN_CLIENT_SECRET !== undefined) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: config.LINKEDIN_CLIENT_ID,
        clientSecret: config.LINKEDIN_CLIENT_SECRET,
        callbackURL: config.LINKEDIN_CALLBACK_URL ?? 'http://localhost:4000/api/v1/auth/linkedin/callback',
        scope: ['r_emailaddress', 'r_liteprofile'],
      },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (accessToken: string, refreshToken: string, profile: unknown, done: VerifyCallback) => {
        try {
          const container = getContainer();
          const oauthLoginUseCase = container.get<OAuthLoginUseCase>('OAuthLoginUseCase');

          const p = profile as PassportProfile;
          const email = p.emails?.[0]?.value ?? '';
          const firstName = p.name?.givenName ?? '';
          const lastName = p.name?.familyName ?? '';
          const avatarUrl = p.photos?.[0]?.value ?? '';

          const result = await oauthLoginUseCase.execute({
            provider: 'LINKEDIN',
            providerAccountId: p.id,
            email,
            firstName,
            lastName,
            avatarUrl,
            accessToken,
            refreshToken,
          });

          done(null, result);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
}

// Setup Microsoft Strategy
if (config.MICROSOFT_CLIENT_ID !== undefined && config.MICROSOFT_CLIENT_SECRET !== undefined && config.LINKEDIN_CLIENT_SECRET !== undefined) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: config.MICROSOFT_CLIENT_ID,
        clientSecret: config.MICROSOFT_CLIENT_SECRET,
        callbackURL: config.MICROSOFT_CALLBACK_URL ?? 'http://localhost:4000/api/v1/auth/microsoft/callback',
        scope: ['user.read'],
      },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (accessToken: string, refreshToken: string, profile: unknown, done: VerifyCallback) => {
        try {
          const container = getContainer();
          const oauthLoginUseCase = container.get<OAuthLoginUseCase>('OAuthLoginUseCase');

          const p = profile as PassportProfile;
          const email = p.emails?.[0]?.value ?? p.userPrincipalName ?? '';
          const firstName = p.name?.givenName ?? p.displayName ?? '';
          const lastName = p.name?.familyName ?? '';

          const result = await oauthLoginUseCase.execute({
            provider: 'MICROSOFT',
            providerAccountId: p.id,
            email,
            firstName,
            lastName,
            accessToken,
            refreshToken,
          });

          done(null, result);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
}

export { passport };
