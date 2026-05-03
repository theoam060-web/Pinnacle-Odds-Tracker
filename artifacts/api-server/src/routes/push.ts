import { Router } from "express";
import webpush from "web-push";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth.js";
import { storage } from "../storage.js";
import { isAccessAllowed } from "../stripeService.js";

const router = Router();

const VAPID_PUBLIC_KEY = "BNFtL8Llx7d_UNrd74MJ1ja7bzLlln6qFdJYdJ3qf2I6PtXob2s5NP9FW79okpFGWWtBzzRJ1jzK5dWkEXDWIRw";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:alerts@sharptracker.io";

if (VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function sendPushToAll(payload: {
  title: string;
  body?: string;
  sport?: string;
  market?: string;
  bookmaker?: string;
  drop?: number;
  previousOdds?: number;
  currentOdds?: number;
  tag?: string;
  url?: string;
  timestamp?: number;
}) {
  if (!VAPID_PRIVATE_KEY) return;
  const data = JSON.stringify(payload);

  let allSubs: { userId: string; sub: webpush.PushSubscription }[];
  try {
    allSubs = await storage.getAllPushSubscriptions();
  } catch {
    return;
  }

  for (const { userId, sub } of allSubs) {
    try {
      const enabled = await storage.getUserNotificationsEnabled(userId);
      if (!enabled) continue;
      // Only send to users with an active/trialing subscription
      const user = await storage.getUser(userId);
      if (!user || !isAccessAllowed(user.subscriptionStatus)) continue;
    } catch {
      continue;
    }

    webpush.sendNotification(sub, data).catch(async (err) => {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await storage.deletePushSubscription(sub.endpoint).catch(() => {});
      }
    });
  }
}

router.post("/push/subscribe", requireAuth, async (req, res) => {
  const userId = (req as AuthRequest).userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!VAPID_PRIVATE_KEY) return res.status(503).json({ error: "Push not configured" });

  // Require active subscription to register for push notifications
  const user = await storage.getUser(userId);
  if (!user || !isAccessAllowed(user.subscriptionStatus)) {
    return res.status(403).json({ error: "An active subscription is required for push notifications" });
  }

  const subscription: webpush.PushSubscription = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: "Invalid subscription" });

  try {
    await storage.savePushSubscription(userId, subscription);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

router.delete("/push/subscribe", requireAuth, async (req, res) => {
  const userId = (req as AuthRequest).userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { endpoint } = req.body;
  try {
    if (endpoint) {
      await storage.deletePushSubscription(endpoint);
    } else {
      await storage.deleteAllPushSubscriptionsForUser(userId);
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to remove subscription" });
  }
});

router.post("/push/test", requireAuth, async (req, res) => {
  if (!VAPID_PRIVATE_KEY) return res.status(503).json({ error: "Push not configured" });
  const userId = (req as AuthRequest).userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  // Require active subscription
  const userRecord = await storage.getUser(userId);
  if (!userRecord || !isAccessAllowed(userRecord.subscriptionStatus)) {
    return res.status(403).json({ error: "An active subscription is required for push notifications" });
  }

  let subs: webpush.PushSubscription[];
  try {
    subs = await storage.getPushSubscriptionsForUser(userId);
  } catch {
    return res.status(500).json({ error: "Failed to fetch subscriptions" });
  }

  if (!subs.length) return res.status(404).json({ error: "No subscription found for this user" });

  const payload = JSON.stringify({
    title: "⚡ Sharp Drop Detected",
    body: "Arsenal vs Chelsea · Moneyline · Pinnacle ▼ 2.18 → 2.11 (−3.2%)",
    sport: "soccer",
    market: "Moneyline",
    bookmaker: "Pinnacle",
    drop: 3.2,
    tag: "test-alert",
    url: "/app/",
  });

  const results = await Promise.allSettled(subs.map((sub) => webpush.sendNotification(sub, payload)));
  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  res.json({ sent: succeeded, total: subs.length });
});

router.get("/push/vapid-public-key", (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

export default router;
