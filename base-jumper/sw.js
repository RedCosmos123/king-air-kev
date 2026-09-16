const CACHE = "base-jumper-arcade-neon-v35";
const FILES = [
  "./", "index.html", "styles.css?v=35", "app.js?v=35", "manifest.json",
  "assets/opening.webp", "assets/house.webp", "assets/kitchen.webp",
  "assets/phone.webp", "assets/decision.webp", "assets/icon-192.png", "assets/icon-512.png",
  "assets/jumper-base.webp",
  "assets/jumper-tshirt-blonde-shorts.webp", "assets/jumper-tshirt-brown-shorts.webp", "assets/jumper-tshirt-ginger-shorts.webp",
  "assets/jumper-tshirt-blonde-trousers.webp", "assets/jumper-tshirt-brown-trousers.webp", "assets/jumper-tshirt-ginger-trousers.webp",
  "assets/jumper-hoodie-blonde-shorts.webp", "assets/jumper-hoodie-brown-shorts.webp", "assets/jumper-hoodie-ginger-shorts.webp",
  "assets/jumper-hoodie-blonde-trousers.webp", "assets/jumper-hoodie-brown-trousers.webp", "assets/jumper-hoodie-ginger-trousers.webp",
  "assets/jumper-vest-blonde-shorts.webp", "assets/jumper-vest-brown-shorts.webp", "assets/jumper-vest-ginger-shorts.webp",
  "assets/jumper-vest-blonde-trousers.webp", "assets/jumper-vest-brown-trousers.webp", "assets/jumper-vest-ginger-trousers.webp",
  "assets/career-city.webp", "assets/kids-closeup.webp", "assets/brian-street.png", "assets/dave-office.png", "assets/parents-car.png",
  "assets/hair-blonde.webp", "assets/hair-brown.webp", "assets/hair-ginger.webp",
  "assets/skin-fair.webp", "assets/skin-light-tan.webp", "assets/skin-pale-winter.webp",
  "assets/top-t-shirt.webp", "assets/top-hoodie.webp", "assets/top-vest.webp",
  "assets/bottom-shorts.webp", "assets/bottom-trousers.webp",
  "assets/audio/arcade-theme.m4a"
];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener("fetch", event => event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request))));
