import { UnauthorizedError } from "@/shared/errors/index.js";
import { JwtService } from "@/modules/auth/infrastructure/services/JwtService.js";
import type { AuthenticatedUser } from "@microintern/shared";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionId?: string;
    }
  }
}

const jwtService = new JwtService();

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new UnauthorizedError("Authentication token required", "AUTH_TOKEN_INVALID");
    }

    const payload = await jwtService.verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId ?? null,
      sessionId: payload.sessionId,
    };
    req.sessionId = payload.sessionId;

    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractBearerToken(req);
    if (token) {
      const payload = await jwtService.verifyAccessToken(token);
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        companyId: payload.companyId ?? null,
        sessionId: payload.sessionId,
      };
      req.sessionId = payload.sessionId;
    }
  } catch {
    // Token invalid or missing — continue as unauthenticated
  }
  next();
}
