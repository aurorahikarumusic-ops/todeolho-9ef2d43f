import { supabase } from "@/integrations/supabase/client";

const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (isInIframe || isPreviewHost) {
    // Unregister any existing SW in preview/iframe
    navigator.serviceWorker?.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
    return null;
  }
  if (!("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    return registration;
  } catch (err) {
    console.error("SW registration failed:", err);
    return null;
  }
}

export function isPushSupported(): boolean {
  return "PushManager" in window && "serviceWorker" in navigator && !isInIframe && !isPreviewHost;
}

export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  return Notification.permission;
}

export async function requestPushSubscription(userId: string): Promise<boolean> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    const registration = await registerServiceWorker();
    if (!registration) return false;

    // For local/demo push we use a simple subscription
    // In production, you'd use VAPID keys here
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkOs-qy4iwP1POdvBGkiMxHqaQKXqaQKXqhZYaH3Sw"
      ) as BufferSource,
    }).catch(() => null);

    if (subscription) {
      // Save subscription to profile
      await supabase
        .from("profiles")
        .update({ push_subscription: subscription.toJSON() as any })
        .eq("user_id", userId);
    }

    return true;
  } catch (err) {
    console.error("Push subscription failed:", err);
    return false;
  }
}

export async function sendLocalNotification(title: string, body: string) {
  if (Notification.permission !== "granted") return;

  const registration = await navigator.serviceWorker?.getRegistration();
  if (registration) {
    registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
    });
  } else {
    new Notification(title, { body, icon: "/icons/icon-192.png" });
  }
}

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
