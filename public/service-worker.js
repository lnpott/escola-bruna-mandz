const CACHE_NAME = 'bruna-mandz-v4'; // bump: removido ecommerce.js (arquivo legado não existe em /public)
const ASSETS = [
    '/',
    '/index.html',
    '/audio.js',
    '/game.js',
    '/store/store.js',
    '/store/products.js',
    '/store/cart.js',
    '/store/payment-config.js',
    '/store/checkout-modal.js',
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
    // Remove caches de versões antigas para garantir que o site atualizado seja usado
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
        )
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    // Nunca usa cache para chamadas de API — sempre busca dados frescos
    // (status de pedido, configuração de chaves, etc. não podem ficar presos em cache).
    if (new URL(event.request.url).pathname.startsWith('/api/')) {
        event.respondWith(fetch(event.request));
        return;
    }
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
