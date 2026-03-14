const CACHE_NAME = 'droso-lab-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/css/punnett.css',
    '/assets/css/responsive.css',
    '/assets/js/genetics/traits.js',
    '/assets/js/genetics/calculator.js',
    '/assets/js/components/PunnettGrid.js',
    '/assets/js/components/StatsPanel.js',
    '/assets/js/app.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request);
            })
    );
});
