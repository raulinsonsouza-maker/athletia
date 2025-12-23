// Service Worker para PWA - Força atualização de cache
const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `athletia-${CACHE_VERSION}`;

// Arquivos críticos para cache
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
];

// Instalação - cache apenas arquivos críticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando service worker...', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS.map(url => `${url}?v=${CACHE_VERSION}`));
    })
  );
  // Força ativação imediata
  self.skipWaiting();
});

// Ativação - limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando service worker...', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Removendo cache antigo:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Assume controle imediato de todas as páginas
  return self.clients.claim();
});

// Fetch - estratégia: Network First para ícones e manifest
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar requisições de terceiros (Google Ads, Analytics, etc)
  // Apenas processar requisições do próprio domínio
  if (url.origin !== self.location.origin) {
    // Para requisições de terceiros, apenas fazer fetch sem cache
    // Não interceptar para evitar erros
    return;
  }
  
  // Ignorar requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Para ícones e manifest, sempre buscar da rede primeiro
  if (url.pathname.includes('icon') || 
      url.pathname.includes('favicon') || 
      url.pathname.includes('manifest.json') ||
      url.pathname.includes('apple-touch-icon')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Se a rede funcionou, atualiza o cache
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Se a rede falhou, tenta do cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Para outros recursos do próprio domínio, usa cache primeiro
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Se não está no cache, busca da rede
      return fetch(event.request).catch((error) => {
        // Se falhar, retorna erro silenciosamente
        console.warn('[SW] Erro ao buscar recurso:', event.request.url, error);
        // Retorna uma resposta vazia para evitar quebrar a aplicação
        return new Response('', { status: 408, statusText: 'Request Timeout' });
      });
    })
  );
});

