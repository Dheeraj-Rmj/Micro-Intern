import type { DeviceSession } from "@microintern/shared";
import type { ParsedDeviceInfo } from "@/shared/utils/device-parser.js";

export interface ISessionService {
  createSession(userId: string, metadata?: Partial<ParsedDeviceInfo>): Promise<string>;
  isSessionValid(userId: string, sessionId: string): Promise<boolean>;
  listUserSessions(userId: string, currentSessionId?: string): Promise<DeviceSession[]>;
  revokeSession(userId: string, sessionId: string): Promise<void>;
  revokeOtherSessions(userId: string, currentSessionId: string): Promise<number>;
  revokeAllSessions(userId: string): Promise<void>;
  touchSession(userId: string, sessionId: string): Promise<void>;
}
