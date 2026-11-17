// New-mail push from the API (payload: { title, body, url, tag }). Skipped when a tab is
// focused: the socket already shows the mail there.
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      if (windows.some((w) => w.focused)) return;
      return self.registration.showNotification(data.title || "New mail", {
        body: data.body,
        icon: "/favicon.png",
        tag: data.tag,
        data: { url: data.url },
      });
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(targetUrl));
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "show-notification") {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: "/favicon.png",
      data: { url: event.data.url },
    });
  }
});
