const CACHE_NAME = 'space-runner-v4';
const ASSETS_TO_CACHE = [
    '/manifest.webmanifest',
    '/vite.svg',
    '/inblanq.png',
    '/icon-512.png',
    '/KOREA.webp',
    '/moon.webp',
    '/mars.jpg'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Never intercept JS/CSS/assets or navigation requests
    if (
        url.pathname.match(/\.(js|mjs|css|html)$/) ||
        url.pathname.includes('/assets/') ||
        event.request.mode === 'navigate' ||
        url.pathname === '/'
    ) {
        return;
    }

    // Only serve cached static assets (images, fonts, etc.)
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
