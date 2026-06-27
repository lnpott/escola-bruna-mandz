const CACHE_NAME = 'bruna-mandz-v2';
const ASSETS = ['/', '/index.html', '/audio.js', '/game.js', '/ecommerce.js', '/store/store.js', '/store/products.js', '/store/cart.js', '/store/payment-config.js'];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
