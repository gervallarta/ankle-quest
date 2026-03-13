// Ankle Quest — Service Worker
// Handles background notifications sent from the main thread via postMessage

self.addEventListener('message', event => {
  if (event.data?.type === 'NOTIFY') {
    const { title, body, tag } = event.data;
    self.registration.showNotification(title, {
      body,
      tag,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      renotify: false,
    });
  }
});

// Skip waiting so new SW activates immediately
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
