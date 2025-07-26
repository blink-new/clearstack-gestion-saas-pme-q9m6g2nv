// path: public/sw.js
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const opts = { 
    body: data.body || '', 
    icon: data.icon || '/icons/icon-192.png', 
    data: { url: data.url || '/' } 
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'ClearStack', opts)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) { 
        if (c.url.includes(self.registration.scope) && 'focus' in c) {
          return c.focus(); 
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});