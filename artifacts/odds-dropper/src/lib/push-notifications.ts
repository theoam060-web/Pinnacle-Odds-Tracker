import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";

const VAPID_PUBLIC_KEY = "BNFtL8Llx7d_UNrd74MJ1ja7bzLlln6qFdJYdJ3qf2I6PtXob2s5NP9FW79okpFGWWtBzzRJ1jzK5dWkEXDWIRw";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type NotificationPermission = "default" | "granted" | "denied";

export interface UsePushNotifications {
  permission: NotificationPermission;
  isSubscribed: boolean;
  isSupported: boolean;
  isPWA: boolean;
  requestAndSubscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotifications {
  const { getToken } = useAuth();
  const isSupported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const isPWA = typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true);

  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? (Notification.permission as NotificationPermission) : "default"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register service worker and check subscription state on mount
  useEffect(() => {
    if (!isSupported) return;

    navigator.serviceWorker
      .register("/app/sw.js", { scope: "/app/" })
      .then((reg) => {
        setRegistration(reg);
        return reg.pushManager.getSubscription();
      })
      .then((sub) => {
        setIsSubscribed(!!sub);
      })
      .catch(() => {});
  }, [isSupported]);

  const requestAndSubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !registration) return false;

    const perm = await Notification.requestPermission();
    setPermission(perm as NotificationPermission);
    if (perm !== "granted") return false;

    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const token = await getToken();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(sub.toJSON()),
      });

      setIsSubscribed(true);
      return true;
    } catch {
      return false;
    }
  }, [isSupported, registration, getToken]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!isSupported || !registration) return;

    const sub = await registration.pushManager.getSubscription();
    if (!sub) return;

    const endpoint = sub.endpoint;
    await sub.unsubscribe();

    const token = await getToken();
    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ endpoint }),
    });

    setIsSubscribed(false);
  }, [isSupported, registration, getToken]);

  const sendTestNotification = useCallback(async (): Promise<void> => {
    const token = await getToken();
    await fetch("/api/push/test", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    });
  }, [getToken]);

  return { permission, isSubscribed, isSupported, isPWA, requestAndSubscribe, unsubscribe, sendTestNotification };
}
