/* Service Worker for roseday - best-effort hourly notifications
   - handles 'periodicsync' events where supported
   - provides a 'push' handler fallback
   Note: Periodic Background Sync is experimental and not available in all browsers.
*/

// Derive notification title/message per date (uses February mapping 7..14)
function getNotificationForDate(d) {
  const date = d instanceof Date ? d : new Date();
  const month = date.getMonth(); // 0=Jan, 1=Feb
  const day = date.getDate();

  let title, message;
  if (month === 1) { // February
    switch (day) {
      case 7:
        title = "It's Rose Day! 🌹";
        message = "Have you seen your blooming surprise?";
        break;
      case 8:
        title = "It's Propose Day! 💍";
        message = "Someone is waiting for your answer...";
        break;
      case 9:
        title = "It's Chocolate Day! 🍫";
        message = "Something sweet is waiting for you!";
        break;
      case 10:
        title = "It's Teddy Day! 🧸";
        message = "Your fluffy friend is missing you!";
        break;
      case 11:
        title = "It's Promise Day! 🤝";
        message = "A special promise is waiting...";
        break;
      case 12:
        title = "It's Hug Day! 🤗";
        message = "Sending you a virtual warm hug!";
        break;
      case 13:
        title = "It's Kiss Day! 💋";
        message = "A little magic is waiting in the app!";
        break;
      case 14:
        title = "Happy Valentine's Day! ❤️";
        message = "Your biggest surprise is ready!";
        break;
      default:
        title = "Miss You! ❤️";
        message = "Open the app to see today's surprise!";
    }
  } else {
    title = "Miss You! ❤️";
    message = "Open the app to see today's surprise!";
  }

  const imgMap = {
    7: '/rose.png', 8: '/propose.png', 9: '/chocolate.png', 10: '/teddy.png',
    11: '/promise.png', 12: '/hug.png', 13: '/kiss.png', 14: '/valentine.png'
  };
  const img = imgMap[day] || '/rose.png';
  return { title, message, img };
}

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

async function showDayNotification() {
  const { title, message, img } = getNotificationForDate(new Date());
  const options = { body: message || '', icon: img || '/rose.png', badge: img || '/rose.png', vibrate: [100, 50, 100] };
  return self.registration.showNotification(title, options);
}

self.addEventListener('periodicsync', event => {
  if (event.tag === 'hourly-notify') {
    event.waitUntil(showDayNotification());
  }
});

// Fallback: respond to push events if a push server is used in future
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : null;
  if (data && data.title) {
    event.waitUntil(self.registration.showNotification(data.title, data.options || {}));
  } else {
    event.waitUntil(showDayNotification());
  }
});

// Optional: handle notification click to focus/open the page
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
    for (const client of clientList) {
      if (client.url === '/' && 'focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow('/');
  }));
});
