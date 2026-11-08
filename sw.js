const CACHE_NAME = 'ethan-code-v8-9';
const CORE_ASSETS = [
  './', './index.html', './my-classroom.html', './courses.html', './coding-tools.html', './block-lab.html', './code-studio.html', './practice.html', './projects.html', './classroom.html', './assets/page-navigation.js', './manifest.webmanifest',
  './assets/style.css', './assets/ethan-code-logo.png',
  './assets/extra-courses.js', './assets/app.js', './assets/studio.js',
  './assets/challenges.js', './assets/blockly-lab.js', './assets/pwa.js', './assets/ethan-workshop.js', './assets/ethan-classroom-cloud.js',
  './icons/icon-192.png', './icons/icon-512.png'
];
const BLOCKLY_ASSETS = [
  'https://unpkg.com/blockly@13.4.0/blockly_compressed.js',
  'https://unpkg.com/blockly@13.4.0/blocks_compressed.js',
  'https://unpkg.com/blockly@13.4.0/javascript_compressed.js',
  'https://unpkg.com/blockly@13.4.0/msg/en.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
    await Promise.all(BLOCKLY_ASSETS.map(async (url) => {
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (response.ok) await cache.put(url, response.clone());
      } catch (error) {
        // The app remains installable if the optional visual-editor CDN is offline.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('ethan-code-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const isBlocklyCdn = url.origin === 'https://unpkg.com' && url.pathname.startsWith('/blockly@13.4.0/');
  if (url.origin !== self.location.origin && !isBlocklyCdn) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: false });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone()).catch(() => {});
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        const fallback = await cache.match('./index.html');
        if (fallback) return fallback;
      }
      throw error;
    }
  })());
});
