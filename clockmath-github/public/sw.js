/* ClockMath service worker: lets the home-screen app open and work offline.
   Always tries the internet first, so updates show up right away.
   Saved copies are only used when there's no connection. */
var CACHE = 'clockmath-v1';
var CORE = [
  '/', '/lunch-break-calculator', '/timesheet-calculator', '/time-card-calculator',
  '/overtime-calculator', '/decimal-hours-converter', '/add-subtract-time',
  '/military-time-converter', '/salary-to-hourly', '/days-between-dates',
  '/time-zone-converter', '/sleep-calculator', '/break-laws',
  '/styles.css', '/common.js', '/favicon.svg', '/icon-192.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    // add one at a time so a single missing page doesn't stop the rest
    return Promise.all(CORE.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return; // leave ads and other sites alone

  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok && !res.redirected) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('/');
        return Response.error();
      });
    })
  );
});
