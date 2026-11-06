// Service worker: lưu sẵn giao diện để mở nhanh (chỉ hoạt động trên HTTPS hoặc localhost).
const CACHE = 'tdk-v13';
const ASSETS = ['./', 'index.html', 'css/style.css', 'fonts/lora-vi.woff', 'js/net.js', 'js/audio.js', 'js/pixel.js', 'js/tiles.js', 'js/hd2d.js', 'js/sprites.js', 'js/fx.js', 'js/ui.js', 'js/map.js', 'js/battle.js', 'js/panels.js', 'js/panels2.js', 'js/tutorial.js', 'js/title.js', 'js/main.js', 'manifest.webmanifest', 'icons/icon-192.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))); self.clients.claim(); });
// Ưu tiên mạng (luôn lấy bản mới nhất từ máy chủ), mất mạng thì dùng bản lưu
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || e.request.url.includes('/ws')) return;
  e.respondWith(fetch(e.request).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});
