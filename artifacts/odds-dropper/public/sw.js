const CACHE_NAME = "sharptracker-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "SharpTracker Alert", body: event.data.text() };
  }

  const {
    title,
    body,
    sport,
    market,
    bookmaker,
    drop,
    previousOdds,
    currentOdds,
    tag,
    url,
    timestamp,
  } = payload;

  // Format the notification body
  let notifBody = body;
  if (!notifBody) {
    const parts = [];
    if (market) parts.push(market);
    if (bookmaker) parts.push(bookmaker);
    if (previousOdds && currentOdds) {
      parts.push(`${Number(previousOdds).toFixed(2)} → ${Number(currentOdds).toFixed(2)}`);
    }
    if (drop) parts.push(`▼ ${Math.abs(Number(drop)).toFixed(1)}%`);
    notifBody = parts.join("  ·  ");
  }

  const options = {
    body: notifBody,
    icon: "/app/icon-192.png",
    badge: "/app/icon-192.png",
    tag: tag || "sharptracker-alert",
    renotify: true,
    requireInteraction: false,
    silent: false,
    vibrate: [100, 50, 100, 50, 100],
    timestamp: timestamp ? Number(timestamp) : Date.now(),
    data: { url: url || "/app/" },
    actions: [
      { action: "view", title: "View Drop" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title || "⚡ Sharp Drop Detected", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/app/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
