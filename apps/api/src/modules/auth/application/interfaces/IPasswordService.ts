/**
 * Password Service Interface.
 */
export interface IPasswordService {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

/**
 * Session Service Interface.
 */
export interface ISessionService {
  createSession(userId: string): Promise<string>; // Returns sessionId
  isSessionValid(userId: string, sessionId: string): Promise<boolean>;
  revokeSession(userId: string, sessionId: string): Promise<void>;
  revokeAllSessions(userId: string): Promise<void>;
}
