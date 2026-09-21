const CACHE_NAME = 'finanzas-hogar-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/estilos.css',
    '/css/dashboard.css',
    '/js/app.js',
    '/js/almacenamiento.js',
    '/js/modulos-calculo.js',
    '/js/modulos-ingresos.js',
    '/js/modulos-gastos.js',
    '/js/modulos-deudas.js',
    '/js/dashboard.js'
];

// Instalar el Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// Activar el Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                });
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - estrategia: cache first, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si está en cache, devolver
                if (response) {
                    return response;
                }
                // Si no, intentar desde la red
                return fetch(event.request)
                    .then(response => {
                        // No cachear requests no-success
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        // Clonar la response
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    })
                    .catch(() => {
                        // Si falla la red, devolver del cache si existe
                        return caches.match(event.request);
                    });
            })
    );
});
