import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';

import { config } from './config.js';
import { getContainer } from './container.js';

import type { OAuthLoginUseCase } from '../modules/auth/application/use-cases/oauth.usecase.js';

// Setup LinkedIn Strategy
if (config.LINKEDIN_CLIENT_ID && config.LINKEDIN_CLIENT_SECRET) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: config.LINKEDIN_CLIENT_ID,
        clientSecret: config.LINKEDIN_CLIENT_SECRET,
        callbackURL: config.LINKEDIN_CALLBACK_URL || 'http://localhost:4000/api/v1/auth/linkedin/callback',
        scope: ['r_emailaddress', 'r_liteprofile'],
      },
      async (accessToken: string, refreshToken: string, profile: unknown, done: any) => {
        try {
          const container = getContainer();
          const oauthLoginUseCase = container.get<OAuthLoginUseCase>('OAuthLoginUseCase');

          const email = profile.emails?.[0]?.value || '';
          const firstName = profile.name?.givenName || '';
          const lastName = profile.name?.familyName || '';
          const avatarUrl = profile.photos?.[0]?.value || '';

          const result = await oauthLoginUseCase.execute({
            provider: 'LINKEDIN',
            providerAccountId: profile.id,
            email,
            firstName,
            lastName,
            avatarUrl,
            accessToken,
            refreshToken,
          });

          return done(null, result);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
}

// Setup Microsoft Strategy
if (config.MICROSOFT_CLIENT_ID && config.MICROSOFT_CLIENT_SECRET) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: config.MICROSOFT_CLIENT_ID,
        clientSecret: config.MICROSOFT_CLIENT_SECRET,
        callbackURL: config.MICROSOFT_CALLBACK_URL || 'http://localhost:4000/api/v1/auth/microsoft/callback',
        scope: ['user.read'],
      },
      async (accessToken: string, refreshToken: string, profile: unknown, done: any) => {
        try {
          const container = getContainer();
          const oauthLoginUseCase = container.get<OAuthLoginUseCase>('OAuthLoginUseCase');

          const email = profile.emails?.[0]?.value || profile.userPrincipalName || '';
          const firstName = profile.name?.givenName || profile.displayName || '';
          const lastName = profile.name?.familyName || '';

          const result = await oauthLoginUseCase.execute({
            provider: 'MICROSOFT',
            providerAccountId: profile.id,
            email,
            firstName,
            lastName,
            accessToken,
            refreshToken,
          });

          return done(null, result);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
}

export { passport };
