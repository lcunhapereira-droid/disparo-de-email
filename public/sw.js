// Define um nome para o cache atual
const CACHE_NAME = 'studio-luminous-cache-v1';

// Lista de arquivos a serem armazenados em cache na instalação
const urlsToCache = [
  '/',
  '/index.html',
  // Adicione aqui os caminhos para seus principais arquivos JS e CSS quando souber os nomes dos bundles
  // Ex: '/assets/index-XXXXXXXX.js', '/assets/index-XXXXXXXX.css'
  // Por enquanto, o cache será principalmente da página inicial.
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  // Realiza a instalação e armazena os arquivos em cache
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Remove caches antigos
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se a resposta estiver no cache, retorna a resposta do cache
        if (response) {
          return response;
        }

        // Caso contrário, faz a requisição à rede
        return fetch(event.request);
      }
    )
  );
});
