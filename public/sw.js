// Ankle Quest — Service Worker

// 1. Push desde servidor (GitHub Actions → Vercel → dispositivo)
self.addEventListener('push', event => {
  if (!event.data) return;
  const { title, body, tag } = event.data.json();
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      renotify: false,
    })
  );
});

// 2. Push local desde el hilo principal (cuando la app está abierta)
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

// Al tocar la notificación, abre la app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('/');
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
