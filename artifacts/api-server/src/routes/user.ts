import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId;
  next();
};

router.get("/user", requireAuth, async (req: any, res) => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.userId));
    res.json({ user: user ?? null });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.post("/user", requireAuth, async (req: any, res) => {
  const { email } = req.body;
  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.userId));
    if (existing.length > 0) {
      return res.json({ user: existing[0] });
    }
    const [user] = await db
      .insert(usersTable)
      .values({ id: req.userId, email: email ?? null })
      .returning();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

export default router;
