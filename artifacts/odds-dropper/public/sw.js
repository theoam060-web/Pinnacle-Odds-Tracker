const CACHE_NAME = "sharptracker-v1";
const VAPID_PUBLIC_KEY = "BNFtL8Llx7d_UNrd74MJ1ja7bzLlln6qFdJYdJ3qf2I6PtXob2s5NP9FW79okpFGWWtBzzRJ1jzK5dWkEXDWIRw";

self.addEventListener("install", (event) => {
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

  const { title, body, sport, market, bookmaker, drop, tag, url } = payload;

  const options = {
    body: body || `${market} · ${bookmaker} ▼ ${drop}%`,
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    tag: tag || "sharptracker-alert",
    renotify: true,
    requireInteraction: false,
    silent: false,
    vibrate: [100, 50, 100],
    timestamp: Date.now(),
    data: { url: url || "/" },
    actions: [
      { action: "view", title: "View Drop" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title || "⚡ Sharp Drop", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

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
