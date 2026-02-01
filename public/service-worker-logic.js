/* eslint-disable no-restricted-globals */
self.addEventListener("push", function (event) {
  if (!event.data) return;
  const rawText = event.data.text();
  console.log("[SW] Push received:", rawText);

  let payload;
  try {
    payload = event.data.json();
  } catch (err) {
    console.error("[SW] JSON parse failed:", err);
    payload = { title: "New Notification", body: rawText, url: "/" };
  }

  const options = {
    body: payload.body,
    icon: "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    data: { url: payload.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        if (clients.openWindow) return clients.openWindow(url);
      }),
  );
});
