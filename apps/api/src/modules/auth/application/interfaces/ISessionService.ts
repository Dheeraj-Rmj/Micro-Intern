export interface ISessionService {
  createSession(userId: string): Promise<string>;
  isSessionValid(userId: string, sessionId: string): Promise<boolean>;
  revokeSession(userId: string, sessionId: string): Promise<void>;
  revokeAllSessions(userId: string): Promise<void>;
}
