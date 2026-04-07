import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";

const VAPID_PUBLIC_KEY = "BNFtL8Llx7d_UNrd74MJ1ja7bzLlln6qFdJYdJ3qf2I6PtXob2s5NP9FW79okpFGWWtBzzRJ1jzK5dWkEXDWIRw";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

interface UsePushNotificationsResult {
  permission: PushPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsResult {
  const { isSignedIn, getToken } = useAuth();
  const [permission, setPermission] = useState<PushPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PushPermission);

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(async (reg) => {
        setSwRegistration(reg);
        const existingSub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!existingSub);
      })
      .catch((err) => console.error("[SW] Registration failed:", err));
  }, []);

  const subscribe = useCallback(async () => {
    if (!swRegistration || !isSignedIn) return;
    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);
      if (perm !== "granted") return;

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const token = await getToken();
      await fetch(`${API_BASE}/api/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription.toJSON()),
      });
      setIsSubscribed(true);
    } catch (err) {
      console.error("[Push] Subscribe failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [swRegistration, isSignedIn, getToken, API_BASE]);

  const unsubscribe = useCallback(async () => {
    if (!swRegistration || !isSignedIn) return;
    setIsLoading(true);
    try {
      const existingSub = await swRegistration.pushManager.getSubscription();
      if (existingSub) {
        const endpoint = existingSub.endpoint;
        await existingSub.unsubscribe();
        const token = await getToken();
        await fetch(`${API_BASE}/api/push/subscribe`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ endpoint }),
        });
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error("[Push] Unsubscribe failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [swRegistration, isSignedIn, getToken, API_BASE]);

  const sendTestNotification = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/push/test`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Test notification failed");
      }
    } catch (err) {
      console.error("[Push] Test failed:", err);
      throw err;
    }
  }, [isSignedIn, getToken, API_BASE]);

  return { permission, isSubscribed, isLoading, subscribe, unsubscribe, sendTestNotification };
}
