/* La Ola — service worker mínimo para instalación PWA (app 100% online; sin caché de datos) */
self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});
