import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-change-me";

export interface AuthRequest extends Request {
  userId: string;
  userEmail?: string;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; email?: string };

    if (!payload?.sub) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    (req as AuthRequest).userId = payload.sub;
    if (payload.email) (req as AuthRequest).userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
