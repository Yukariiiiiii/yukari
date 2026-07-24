/* ========================================
   Vinyl Blog · Service Worker
   ======================================== */

const CACHE_NAME = 'vinyl-blog-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    
    // 音频流走网络优先
    if (req.url.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i)) {
        e.respondWith(
            fetch(req).catch(() => caches.match(req))
        );
        return;
    }
    
    e.respondWith(
        caches.match(req).then(cached => {
            if (cached) return cached;
            return fetch(req).then(res => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
                return res;
            }).catch(() => caches.match('/index.html'));
        })
    );
});