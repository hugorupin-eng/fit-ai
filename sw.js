
const CACHE_NAME = 'fitai-v1';
// No cacheamos activamente para evitar problemas con la API de Gemini que requiere red,
// pero el archivo es necesario para que el navegador considere la app como PWA.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Pass-through
  event.respondWith(fetch(event.request));
});
