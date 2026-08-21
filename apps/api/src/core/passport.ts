import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';

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
        callbackURL: config.LINKEDIN_CALLBACK_URL ?? `${config.API_BASE_URL}/auth/linkedin/callback`,
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
        callbackURL: config.MICROSOFT_CALLBACK_URL ?? `${config.API_BASE_URL}/auth/microsoft/callback`,
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

// Setup Google Strategy
if (config.GOOGLE_CLIENT_ID !== undefined && config.GOOGLE_CLIENT_SECRET !== undefined) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_CALLBACK_URL ?? `${config.API_BASE_URL}/auth/google/callback`,
      },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) => {
        try {
          const container = getContainer();
          const oauthLoginUseCase = container.get<OAuthLoginUseCase>('OAuthLoginUseCase');

          const email = profile.emails?.[0]?.value ?? '';
          const firstName = profile.name?.givenName ?? '';
          const lastName = profile.name?.familyName ?? '';
          const avatarUrl = profile.photos?.[0]?.value ?? '';

          const result = await oauthLoginUseCase.execute({
            provider: 'GOOGLE',
            providerAccountId: profile.id,
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

// Setup GitHub Strategy
if (config.GITHUB_CLIENT_ID !== undefined && config.GITHUB_CLIENT_SECRET !== undefined) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.GITHUB_CLIENT_ID,
        clientSecret: config.GITHUB_CLIENT_SECRET,
        callbackURL: config.GITHUB_CALLBACK_URL ?? `${config.API_BASE_URL}/auth/github/callback`,
        scope: ['user:email'],
      },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) => {
        try {
          const container = getContainer();
          const oauthLoginUseCase = container.get<OAuthLoginUseCase>('OAuthLoginUseCase');

          // GitHub emails might be buried or hidden, handle carefully
          const email = profile.emails?.[0]?.value ?? profile._json?.email ?? '';
          const fullName = profile.displayName ?? profile.username ?? '';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          const avatarUrl = profile.photos?.[0]?.value ?? '';

          const result = await oauthLoginUseCase.execute({
            provider: 'GITHUB',
            providerAccountId: profile.id,
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

export { passport };
