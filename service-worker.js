/* ============================================================
   睫角守宫养殖管理系统 — Service Worker
   离线缓存策略：Cache First（静态资源） + Network First（外部字体）
============================================================ */

const CACHE_NAME = 'gecko-app-v1';

// 需要预缓存的本地资源
const PRECACHE_URLS = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './seed-demo.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// ===== 安装：预缓存所有核心资源 =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ===== 激活：清理旧缓存 =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ===== 拦截请求 =====
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 外部资源（Google Fonts 等）：网络优先，失败则从缓存取
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 本地资源：缓存优先，缓存没有时去网络取并缓存
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      });
    })
  );
});
