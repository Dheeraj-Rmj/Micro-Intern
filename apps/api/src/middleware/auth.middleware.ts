import { UnauthorizedError } from "@/shared/errors/index.js";
import { auth } from "../modules/auth/infrastructure/better-auth.js";
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
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (!session || !session.session) {
      throw new UnauthorizedError("Authentication token required", "AUTH_TOKEN_INVALID");
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: (session.user as any).role || "USER",
      companyId: null,
      sessionId: session.session.id,
    };
    req.sessionId = session.session.id;

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
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (session && session.session) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        role: (session.user as any).role || "USER",
        companyId: null,
        sessionId: session.session.id,
      };
      req.sessionId = session.session.id;
    }
    next();
  } catch (error) {
    next();
  }
}
