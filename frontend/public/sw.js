// Service Worker para PWA - Força atualização de cache
const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `athletia-${CACHE_VERSION}`;

// Arquivos críticos para cache (apenas os que existem)
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg'
  // Nota: icon-192x192.png, icon-512x512.png e apple-touch-icon.png 
  // não existem no diretório public, então foram removidos do cache
  // Se forem criados no futuro, adicionar aqui
];

// Instalação - cache apenas arquivos críticos (com tratamento de erro individual)
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando service worker...', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Adicionar arquivos individualmente para evitar falha se algum não existir
      return Promise.allSettled(
        CRITICAL_ASSETS.map(url => {
          const fullUrl = `${url}?v=${CACHE_VERSION}`;
          return cache.add(fullUrl).catch((error) => {
            console.warn(`[SW] Não foi possível fazer cache de ${fullUrl}:`, error);
            // Não propagar o erro - continuar com outros arquivos
            return null;
          });
        })
      );
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

// Push notifications - Receber notificações
self.addEventListener('push', (event) => {
  console.log('[SW] Notificação push recebida:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'AthletIA', body: event.data.text() };
    }
  }

  const options = {
    title: data.title || 'AthletIA',
    body: data.body || 'Nova notificação',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    vibrate: data.vibrate || [200, 100, 200],
    data: data.data || {},
    tag: 'athletia-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click - Abrir/focar app quando usuário clica na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/treino';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Verificar se já existe uma janela aberta
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => {
            // Navegar para a URL se necessário
            if (!client.url.includes(urlToOpen)) {
              return client.navigate(urlToOpen);
            }
          });
        }
      }
      // Se não há janela aberta, abrir nova
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

