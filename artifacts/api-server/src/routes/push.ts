import { Router } from "express";
import webpush from "web-push";
import { requireAuth } from "@clerk/express";

const router = Router();

const VAPID_PUBLIC_KEY = "BNFtL8Llx7d_UNrd74MJ1ja7bzLlln6qFdJYdJ3qf2I6PtXob2s5NP9FW79okpFGWWtBzzRJ1jzK5dWkEXDWIRw";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:alerts@sharptracker.io";

if (VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

const subscriptionsByUser = new Map<string, webpush.PushSubscription[]>();

export function sendPushToAll(payload: {
  title: string;
  body: string;
  sport?: string;
  market?: string;
  bookmaker?: string;
  drop?: number;
  tag?: string;
  url?: string;
}) {
  if (!VAPID_PRIVATE_KEY) return;
  const data = JSON.stringify(payload);
  for (const [userId, subs] of subscriptionsByUser.entries()) {
    for (const sub of subs) {
      webpush.sendNotification(sub, data).catch((err) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          const remaining = subscriptionsByUser.get(userId)?.filter((s) => s.endpoint !== sub.endpoint) ?? [];
          if (remaining.length === 0) subscriptionsByUser.delete(userId);
          else subscriptionsByUser.set(userId, remaining);
        }
      });
    }
  }
}

router.post("/push/subscribe", requireAuth(), (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!VAPID_PRIVATE_KEY) return res.status(503).json({ error: "Push not configured" });

  const subscription: webpush.PushSubscription = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: "Invalid subscription" });

  const existing = subscriptionsByUser.get(userId) ?? [];
  const alreadyRegistered = existing.some((s) => s.endpoint === subscription.endpoint);
  if (!alreadyRegistered) {
    subscriptionsByUser.set(userId, [...existing, subscription]);
  }

  res.json({ ok: true });
});

router.delete("/push/subscribe", requireAuth(), (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { endpoint } = req.body;
  if (endpoint) {
    const existing = subscriptionsByUser.get(userId) ?? [];
    subscriptionsByUser.set(userId, existing.filter((s) => s.endpoint !== endpoint));
  } else {
    subscriptionsByUser.delete(userId);
  }
  res.json({ ok: true });
});

router.post("/push/test", requireAuth(), (req, res) => {
  if (!VAPID_PRIVATE_KEY) return res.status(503).json({ error: "Push not configured" });
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const subs = subscriptionsByUser.get(userId);
  if (!subs?.length) return res.status(404).json({ error: "No subscription found for this user" });

  const payload = JSON.stringify({
    title: "⚡ Sharp Drop Detected",
    body: "Arsenal vs Chelsea · Moneyline · Pinnacle ▼ 2.18 → 2.11 (−3.2%)",
    sport: "soccer",
    market: "Moneyline",
    bookmaker: "Pinnacle",
    drop: 3.2,
    tag: "test-alert",
    url: "/",
  });

  Promise.allSettled(subs.map((sub) => webpush.sendNotification(sub, payload))).then((results) => {
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    res.json({ sent: succeeded, total: subs.length });
  });
});

router.get("/push/vapid-public-key", (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

export default router;
