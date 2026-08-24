import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as SamlStrategy, Profile as SamlProfile } from '@node-saml/passport-saml';

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
  const linkedInStrategy = new OAuth2Strategy(
    {
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID: config.LINKEDIN_CLIENT_ID,
      clientSecret: config.LINKEDIN_CLIENT_SECRET,
      callbackURL: config.LINKEDIN_CALLBACK_URL ?? `${config.API_BASE_URL}/auth/linkedin/callback`,
      scope: ['openid', 'profile', 'email'],
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
    );

    linkedInStrategy.name = 'linkedin';
    linkedInStrategy.userProfile = function (accessToken: string, done: (err?: Error | null, profile?: any) => void) {
      (this as any)._oauth2.get('https://api.linkedin.com/v2/userinfo', accessToken, (err: Error | null, body: string) => {
        if (err) {
          return done(new Error('Failed to fetch user profile from LinkedIn OIDC endpoint'));
        }
        try {
          const json = JSON.parse(body);
          const profile = {
            id: json.sub,
            emails: [{ value: json.email }],
            name: { givenName: json.given_name, familyName: json.family_name },
            photos: [{ value: json.picture }]
          };
          done(null, profile);
        } catch (e) {
          done(e as Error);
        }
      });
    };

    passport.use(linkedInStrategy);
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

const GoogleAuthStrategy = GoogleStrategy as any;
if (config.GOOGLE_CLIENT_ID !== undefined && config.GOOGLE_CLIENT_SECRET !== undefined) {
  passport.use(
    new GoogleAuthStrategy(
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

const GitHubAuthStrategy = GitHubStrategy as any;
if (config.GITHUB_CLIENT_ID !== undefined && config.GITHUB_CLIENT_SECRET !== undefined) {
  passport.use(
    new GitHubAuthStrategy(
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

// Setup SAML / Enterprise SSO Strategy
if (config.SAML_ENTRY_POINT !== undefined && config.SAML_ISSUER !== undefined) {
  passport.use(
    'saml',
    new SamlStrategy(
      {
        callbackUrl: '/api/v1/auth/sso/callback',
        entryPoint: config.SAML_ENTRY_POINT,
        issuer: config.SAML_ISSUER,
        idpCert: `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJaiXhU65taTIFMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1lbHNzcHg1OHR3N2RqcHJvLnVzLmF1dGgwLmNvbTAeFw0yNjA4MjIx
ODI4MjdaFw00MDA0MzAxODI4MjdaMCwxKjAoBgNVBAMTIWRldi1lbHNzcHg1OHR3
N2RqcHJvLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBANLpkik+5xI9+8o8ypupChxS33GzIWKICEZs5TUAnWoWmQzi6oaxyEz7zRz3
Z/LmNb9AhS5vC95ya2LW+B55FXGmywG2ofiURIdNnk3DQd1LW884HbAvQuCO39R3
xR6aIbn8PevAHA4hn6t/rD/iU2/az1NIDpCy4bd32U70rie6DtsNq3f8PPjgoPxd
xe8dE9s2SaNkdf4UQD3LVwLeuxvbEKkH/CXPlQokEOKPD2rlEOjzQ62e+OKEr1Bw
j0mji5focK0bN6Qpyv5DD/kBZ0HXAd+tMJp+mEGQ06MKhYPnhy5l4HpopLFEfYCP
uBj6zX131kAq9wKg+wNmPFothX8CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUDOVa6v/nFD9vbVHOTzT8aiF2/XgwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQAg+/SFRkH75xNTrrYTdscowOL3xtRAmSYOhX7fwkiL
NYPF5OdjJotE+jJmr1aqxx7DF0cCjn8esGD0IdUvjopDfJhGORq5ygPmYbuyMZp7
TfqHMS2mVJF8VhfpWVog7AQPhakTUr3u9Tcg7cs6MdKssTjpbwBZmEM4BeJKwIaJ
/OyDLRSUHKEPYvwsESo2pNShoG4s6xP1e5OKGV72ofZ2xZFP99HD17MnFYTZ1m0f
AGlQ5lDBGSLJHAo1U9Xdn8HEozKRFE+fGlX44xnGrPe0laX9/jtRl6U4o8TjTWyi
+HxsLCoRjheSP8Ptk35U6Z0g7eLcssjHfTmRESUrN1Ug
-----END CERTIFICATE-----`, // The IDP's public certificate hardcoded for testing
        signatureAlgorithm: 'sha256', 
        digestAlgorithm: 'sha256',
      } as any,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (profile: any, done: any) => {
        try {
          if (!profile) {
            return done(new Error('No profile returned from SAML Provider'), false);
          }
          
          const container = getContainer();
          const oauthLoginUseCase = container.get<OAuthLoginUseCase>('OAuthLoginUseCase');

          const p = profile as Record<string, unknown>;

          // Extract standard attributes from SAML Assertion
          // Different IDPs use different attribute names, so we check standard OIDs and common names
          const email = String(
            p['email'] || 
            p['mail'] || 
            p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 
            p['nameID'] || 
            ''
          );
          
          const firstName = String(
            p['firstName'] || 
            p['givenName'] || 
            p['given_name'] || 
            p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || 
            p['name'] ||
            'Unknown' // Fallback for name to avoid Zod min(1) errors
          );
          
          const lastName = String(
            p['lastName'] || 
            p['surname'] || 
            p['family_name'] || 
            p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || 
            'User' // Fallback for last name to avoid Zod errors
          );
          
          const providerAccountId = String(
            p['nameID'] || 
            p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
            p['id'] || 
            email
          );

          const result = await oauthLoginUseCase.execute({
            provider: 'SAML',
            providerAccountId,
            email,
            firstName,
            lastName,
            avatarUrl: '',
            accessToken: '', // SAML doesn't typically provide an OAuth-style access token
            refreshToken: '',
          });

          done(null, result);
        } catch (error) {
          done(error, false);
        }
      },
      (profile: any, done: any) => {
        // SAML logout verify callback
        done(null, profile);
      }
    ) as any
  );
}

export { passport };
