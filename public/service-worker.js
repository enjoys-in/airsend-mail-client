const publicKey  = 'BJw086bmrTdcixl4bO_ep7kPMevfXiot27XyBoccCaeOH_eQZL_X3ml8TvFSKlfgsI6joi43-m3efwL4D8YXX0'

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
