// Service Worker for Push Notifications — Estou de Olho
// Version tag for cache busting
const SW_VERSION = "v1.0.0";
const CACHE_NAME = `estou-de-olho-${SW_VERSION}`;

self.addEventListener("install", (event) => {
  // Force immediate activation — não espera o pai fechar o app
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    // Limpa caches antigos
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name.startsWith("estou-de-olho-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first para garantir dados frescos
self.addEventListener("fetch", (event) => {
  // Skip non-GET and API/supabase requests
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/rest/") || url.hostname.includes("supabase")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache a copy for offline fallback
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  let data = { title: "Estou de Olho 👁️", body: "Você esqueceu de algo. De novo.", icon: "/icons/icon-192.png" };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
      data: data.url || "/",
      actions: [
        { action: "open", title: "Abrir o app" },
        { action: "dismiss", title: "Ignorar (a mãe vê)" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// Listen for skip-waiting message from the app
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
