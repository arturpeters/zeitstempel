/**
 * pwa.js – registriert den Service Worker und meldet neue Versionen.
 *
 * ZEITSTEMPEL (gehostet, z. B. GitHub Pages):
 * - Liegt eine neue Fassung bereit, feuert das Ereignis
 *   "zeitstempel:update"; app.js zeigt dann oben den Hinweis
 *   "Neue Version – tippen zum Aktualisieren".
 * - Tippen -> window.__zeitstempelApplyUpdate() -> der wartende Service Worker
 *   übernimmt -> Seite lädt einmal neu. Daten (localStorage) bleiben.
 * - Beim Zurückholen der App in den Vordergrund wird nach Updates gesucht
 *   (iPhone-Web-Apps werden selten wirklich neu gestartet).
 *
 * Lokal (localhost/file) wird wie in Arturs App KEIN Service Worker
 * registriert und ein alter entfernt.
 */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;

  const host = location.hostname;
  const isLocalApp = location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '';

  if (isLocalApp) {
    navigator.serviceWorker.getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});
    if (window.caches && caches.keys) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
    }
    return;
  }

  let waitingWorker = null;
  let reloading = false;

  function announce(worker) {
    waitingWorker = worker;
    window.dispatchEvent(new Event('zeitstempel:update'));
  }

  window.__zeitstempelApplyUpdate = function () {
    if (waitingWorker) waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    else location.reload();
  };

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      // Schon eine wartende Fassung da (z. B. beim letzten Mal geladen)?
      if (reg.waiting && navigator.serviceWorker.controller) announce(reg.waiting);

      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          // Nur melden, wenn schon eine Version lief - beim allerersten
          // Installieren gibt es nichts zu aktualisieren.
          if (worker.state === 'installed' && navigator.serviceWorker.controller) announce(worker);
        });
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    }).catch((err) => {
      console.warn('Zeitstempel: Service Worker konnte nicht registriert werden.', err);
    });
  });
})();
