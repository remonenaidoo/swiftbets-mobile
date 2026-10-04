// Shows SwiftBets web push messages and opens the site when one is tapped.
self.addEventListener('push', (event) => {
  let message = { title: 'SwiftBets', body: '' };
  try {
    message = { ...message, ...event.data.json() };
  } catch {
    // A push without a readable payload still shows the brand.
  }
  event.waitUntil(self.registration.showNotification(message.title, { body: message.body, icon: '/favicon.ico', tag: message.title }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((open) => {
      const tab = open.find((c) => 'focus' in c);
      return tab ? tab.focus() : self.clients.openWindow('/');
    }),
  );
});
