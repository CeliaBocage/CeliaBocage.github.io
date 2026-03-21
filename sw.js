const CACHE_NAME = 'portfolio-v2';
const CACHE_DURATION = 60 * 60 * 1000; // 1 heure en ms

const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/navigation/formations.html',
    '/navigation/experiences.html',
    '/navigation/projets.html',
    '/navigation/vie-associative.html',
    '/navigation/passions.html',
    '/navigation/posts.html',
    '/assets/css/style.css',
    '/assets/css/base.css',
    '/assets/css/navigation.css',
    '/assets/css/sidebar.css',
    '/assets/css/cv-content.css',
    '/assets/css/contact.css',
    '/assets/css/filters.css',
    '/assets/css/footer.css',
    '/assets/css/responsive.css',
    '/assets/css/cards.css',
    '/assets/css/posts.css',
    '/assets/js/main.js',
    '/assets/js/api.js',
    '/assets/Images/Photo_CV.png'
];

// Installation : pre-cache des ressources principales
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch : network-first pour l'API, cache-first pour les assets statiques
self.addEventListener('fetch', (event) => {
    // Ignorer les requetes non-GET
    if (event.request.method !== 'GET') return;

    // Ne pas cacher les appels API — toujours aller au reseau
    const url = new URL(event.request.url);
    if (url.hostname !== location.hostname) return;

    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cached = await cache.match(event.request);

            if (cached) {
                const cachedTime = cached.headers.get('sw-cache-time');
                const isExpired = cachedTime && (Date.now() - Number(cachedTime)) > CACHE_DURATION;

                if (!isExpired) {
                    return cached;
                }
            }

            // Cache absent ou expire : fetch reseau
            try {
                const response = await fetch(event.request);

                if (response.ok) {
                    // Cloner la reponse et ajouter un timestamp
                    const headers = new Headers(response.headers);
                    headers.set('sw-cache-time', String(Date.now()));

                    const timedResponse = new Response(await response.clone().blob(), {
                        status: response.status,
                        statusText: response.statusText,
                        headers: headers
                    });

                    cache.put(event.request, timedResponse);
                }

                return response;
            } catch (err) {
                // Hors-ligne : retourner le cache meme expire
                if (cached) return cached;
                throw err;
            }
        })
    );
});
