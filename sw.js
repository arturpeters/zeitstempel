/**
 * sw.js – Service Worker für ZEITSTEMPEL (iPhone, Home-Bildschirm-Web-App).
 *
 * Aufgabe: Die App läuft nach dem ersten Öffnen komplett offline.
 *
 * Lehre aus Arturs App (Doku 11.1): Ein cache-first Service Worker hat dort
 * nach einem Update stur die alte Fassung ausgeliefert. Deshalb hier:
 *  1. Bei JEDER Änderung an der App CACHE_NAME hochzählen. Der Browser
 *     vergleicht sw.js Byte für Byte – nur so erkennt er ein Update.
 *  2. Die neue Fassung wartet, bis die App sie anfordert (Nachricht
 *     SKIP_WAITING). pwa.js zeigt dafür oben "Neue Version – tippen zum
 *     Aktualisieren". Kein Wechsel mitten in einer Eingabe.
 *  3. HTML, Skripte, CSS und Bilder kommen alle aus dem Cache der gerade
 *     aktiven Version – so passen sie immer zusammen. Ob es eine neue
 *     Version gibt, prüft der Browser beim Öffnen über sw.js selbst
 *     (wird nie aus dem Cache gelesen) und pwa.js zusätzlich bei jedem
 *     Zurückholen der App in den Vordergrund.
 *
 * Lokal (localhost/file) baut sich der Service Worker wie bei Artur ab,
 * damit beim Entwickeln nie eine alte Fassung hängen bleibt.
 */
const CACHE_NAME = 'zeitstempel-v3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/calculator.js',
  './js/storage.js',
  './js/overtime.js',
  './js/punchclock.js',
  './js/ferien.js',
  './js/transit.js',
  './js/app.js',
  './js/pwa.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
];

const IS_LOCAL_APP =
  self.location.protocol === 'file:' ||
  self.location.hostname === 'localhost' ||
  self.location.hostname === '127.0.0.1' ||
  self.location.hostname === '';

self.addEventListener('install', (event) => {
  if (IS_LOCAL_APP) {
    self.skipWaiting();
    return;
  }
  // cache: 'reload' umgeht den HTTP-Cache, damit wirklich die neue Fassung landet.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: 'reload' })))
    )
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  if (IS_LOCAL_APP) {
    event.waitUntil((async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        await self.registration.unregister();
      } catch (e) { /* beim nächsten Start */ }
    })());
    return;
  }
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (IS_LOCAL_APP) return;
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Seitenaufruf: index.html der AKTIVEN Version (passt garantiert zu
  // ihren Skripten). Neue Fassungen kommen nur über den Update-Weg oben.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match('./index.html').then((hit) => hit || fetch(req))
      )
    );
    return;
  }

  // Alles andere: aus dem Cache der aktiven Version, sonst Netz.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req))
    )
  );
});
