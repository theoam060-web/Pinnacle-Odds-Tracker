import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-change-me";

function getCallbackUrl(req: any): string {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domain) return `https://${domain}/api/auth/google/callback`;
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}/api/auth/google/callback`;
}

function getFrontendBase(req: any): string {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domain) return `https://${domain}/app`;
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}/app`;
}

router.get("/auth/google", (req, res) => {
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, getCallbackUrl(req));
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
  });
  res.redirect(url);
});

router.get("/auth/google/callback", async (req, res) => {
  const { code, error } = req.query as { code?: string; error?: string };
  const frontendBase = getFrontendBase(req);

  if (error || !code) {
    return res.redirect(`${frontendBase}/?auth_error=cancelled`);
  }

  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, getCallbackUrl(req));
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload()!;
    const googleId = payload.sub;
    const email = payload.email ?? null;

    const existing = await db.select().from(usersTable).where(eq(usersTable.id, googleId));
    if (existing.length === 0) {
      await db.insert(usersTable).values({ id: googleId, email });
    }

    const sessionToken = jwt.sign(
      { sub: googleId, email },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.redirect(`${frontendBase}/?session_token=${encodeURIComponent(sessionToken)}`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    res.redirect(`${frontendBase}/?auth_error=failed`);
  }
});

router.get("/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.sub));
    res.json({ user: user ?? null });
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
});

export default router;
