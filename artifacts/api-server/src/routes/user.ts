import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { storage } from "../storage";

const router: IRouter = Router();

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

router.get("/user/settings", requireAuth, async (req: any, res) => {
  try {
    const [user] = await db
      .select({ notificationsEnabled: usersTable.notificationsEnabled })
      .from(usersTable)
      .where(eq(usersTable.id, req.userId));
    res.json({ notificationsEnabled: user?.notificationsEnabled ?? true });
  } catch {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.patch("/user/settings", requireAuth, async (req: any, res) => {
  const { notificationsEnabled } = req.body;
  if (typeof notificationsEnabled !== "boolean") {
    return res.status(400).json({ error: "notificationsEnabled must be a boolean" });
  }
  try {
    await storage.setUserNotificationsEnabled(req.userId, notificationsEnabled);
    res.json({ ok: true, notificationsEnabled });
  } catch {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
