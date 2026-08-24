import OAuth2Strategy from 'passport-oauth2';

class LinkedInOIDCStrategy extends OAuth2Strategy {
  constructor(options: any, verify: any) {
    options.authorizationURL = options.authorizationURL || 'https://www.linkedin.com/oauth/v2/authorization';
    options.tokenURL = options.tokenURL || 'https://www.linkedin.com/oauth/v2/accessToken';
    options.scopeSeparator = options.scopeSeparator || ' ';
    super(options, verify);
    this.name = 'linkedin';
  }

  userProfile(accessToken: string, done: (err?: Error | null, profile?: any) => void): void {
    this._oauth2.get('https://api.linkedin.com/v2/userinfo', accessToken, (err, body, res) => {
      if (err) return done(new Error('Failed to fetch user profile'));
      try {
        const json = JSON.parse(body as string);
        const profile = {
          id: json.sub,
          displayName: json.name,
          emails: [{ value: json.email }],
          photos: [{ value: json.picture }],
          _raw: body,
          _json: json
        };
        done(null, profile);
      } catch (e) {
        done(e as Error);
      }
    });
  }
}
