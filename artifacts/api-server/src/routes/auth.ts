import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-change-me";

function getCallbackUrl(_req: any): string {
  if (process.env.GOOGLE_CALLBACK_URL) return process.env.GOOGLE_CALLBACK_URL;
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domain) return `https://${domain}/api/auth/google/callback`;
  return `https://sharptracker.io/api/auth/google/callback`;
}

function getFrontendBase(req: any): string {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domain) return `https://${domain}/app`;
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}/app`;
}

function issueToken(userId: string, email: string | null): string {
  return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: "30d" });
}

async function getUserByEmail(email: string) {
  const result = await db.execute(
    sql`SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`,
  );
  return (result.rows[0] as any) ?? null;
}

// ── Google OAuth ──────────────────────────────────────────────────────────────

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
  const { code, error, error_description } = req.query as {
    code?: string;
    error?: string;
    error_description?: string;
  };
  const frontendBase = getFrontendBase(req);

  if (error || !code) {
    const msg = encodeURIComponent(error_description || error || "cancelled");
    return res.redirect(`${frontendBase}/?auth_error=google&auth_error_msg=${msg}`);
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
    const googleSub = payload.sub;
    const email = payload.email ?? null;

    // 1. Look up by Google sub (existing Google-first users)
    let [user] = await db.select().from(usersTable).where(eq(usersTable.id, googleSub));

    // 2. If not found by sub, look up by email (email/password user logging in via Google)
    if (!user && email) {
      const byEmail = await getUserByEmail(email);
      if (byEmail) user = byEmail;
    }

    // 3. Create new user if still not found
    if (!user) {
      const [created] = await db
        .insert(usersTable)
        .values({ id: googleSub, email })
        .returning();
      user = created;
    }

    const sessionToken = issueToken(user.id, email);
    res.redirect(`${frontendBase}/?session_token=${encodeURIComponent(sessionToken)}`);
  } catch (err: any) {
    const msg = encodeURIComponent(err?.message ?? "unknown error");
    res.redirect(`${frontendBase}/?auth_error=failed&auth_error_msg=${msg}`);
  }
});

// ── Email / Password ──────────────────────────────────────────────────────────

router.post("/auth/register", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const emailNorm = email.toLowerCase().trim();
  const existing = await getUserByEmail(emailNorm);
  if (existing) {
    return res.status(409).json({
      error: "An account with this email already exists. Try signing in instead.",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = randomUUID();

  const [user] = await db
    .insert(usersTable)
    .values({ id: userId, email: emailNorm, passwordHash })
    .returning();

  const sessionToken = issueToken(user.id, emailNorm);
  res.json({ ok: true, token: sessionToken });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const emailNorm = email.toLowerCase().trim();
  const user = await getUserByEmail(emailNorm);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (!user.password_hash) {
    return res.status(401).json({
      error: "This account uses Google sign-in. Please use 'Continue with Google'.",
    });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const sessionToken = issueToken(user.id, emailNorm);
  res.json({ ok: true, token: sessionToken });
});

// ── Me ────────────────────────────────────────────────────────────────────────

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
