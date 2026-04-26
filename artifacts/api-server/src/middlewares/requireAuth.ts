import { verifyToken } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

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
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!payload?.sub) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    (req as AuthRequest).userId = payload.sub;
    // Extract email from JWT claims (present if Clerk is configured to include it)
    const email = (payload as any).email as string | undefined;
    if (email) (req as AuthRequest).userEmail = email;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
