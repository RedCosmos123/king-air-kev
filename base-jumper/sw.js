const PREFIX = "base-jumper-arcade-neon-";
const CACHE = `${PREFIX}v37`;
const CORE = ["./", "index.html", "styles.css?v=37", "chapter.css?v=37", "art.js?v=37", "app.js?v=37", "manifest.json", "assets/opening.webp", "assets/icon-192.png", "assets/icon-512.png"];
self.addEventListener("install", event => event.waitUntil(
  caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())
));
self.addEventListener("activate", event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope) || event.request.headers.has("range")) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (event.request.mode === "navigate") {
      try {
        const response = await fetch(event.request);
        if (response.ok) await cache.put("index.html", response.clone());
        return response;
      } catch { return (await cache.match("index.html")) || Response.error(); }
    }
    const hit = await cache.match(event.request);
    if (hit) return hit;
    const response = await fetch(event.request);
    if (response.ok && response.status === 200) await cache.put(event.request, response.clone());
    return response;
  })());
});
