const CACHE = "base-jumper-arcade-neon-v36";
const FILES = [
  "./", "index.html", "styles.css?v=36", "app.js?v=36", "manifest.json",
  "assets/opening.webp", "assets/house.webp", "assets/kitchen.webp",
  "assets/phone.webp", "assets/decision.webp", "assets/icon-192.png", "assets/icon-512.png",
  "assets/jumper-base.webp",
  "assets/jumper-tshirt-blonde-shorts.webp", "assets/jumper-tshirt-brown-shorts.webp", "assets/jumper-tshirt-ginger-shorts.webp",
  "assets/jumper-tshirt-blonde-trousers.webp", "assets/jumper-tshirt-brown-trousers.webp", "assets/jumper-tshirt-ginger-trousers.webp",
  "assets/jumper-hoodie-blonde-shorts.webp", "assets/jumper-hoodie-brown-shorts.webp", "assets/jumper-hoodie-ginger-shorts.webp",
  "assets/jumper-hoodie-blonde-trousers.webp", "assets/jumper-hoodie-brown-trousers.webp", "assets/jumper-hoodie-ginger-trousers.webp",
  "assets/jumper-vest-blonde-shorts.webp", "assets/jumper-vest-brown-shorts.webp", "assets/jumper-vest-ginger-shorts.webp",
  "assets/jumper-vest-blonde-trousers.webp", "assets/jumper-vest-brown-trousers.webp", "assets/jumper-vest-ginger-trousers.webp",
  "assets/career-city.webp", "assets/kids-closeup.webp",
  "assets/brian-player.webp", "assets/brian-reply.webp", "assets/dave-player.webp", "assets/dave-reply.webp",
  "assets/parents-player-call.webp", "assets/parents-reply.webp", "assets/parents-player-angry.webp",
  "assets/wife-announcement.webp", "assets/wife-concern.webp", "assets/wife-promise-hurt.webp", "assets/wife-promise-careful.webp",
  "assets/wife-promise-died.webp", "assets/wife-promise-slow.webp", "assets/wife-promise-skydiving.webp", "assets/wife-promise-good-people.webp",
  "assets/wife-promise-party.webp", "assets/wife-promise-stop.webp",
  "assets/hair-blonde.webp", "assets/hair-brown.webp", "assets/hair-ginger.webp",
  "assets/skin-fair.webp", "assets/skin-light-tan.webp", "assets/skin-pale-winter.webp",
  "assets/top-t-shirt.webp", "assets/top-hoodie.webp", "assets/top-vest.webp",
  "assets/bottom-shorts.webp", "assets/bottom-trousers.webp",
  "assets/audio/arcade-theme.m4a"
];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener("fetch", event => event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request))));
