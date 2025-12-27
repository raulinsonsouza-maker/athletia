/**
 * Serviço para gerenciar notificações push no frontend
 */

import api from './auth.service';

/**
 * Solicita permissão para notificações e registra subscription
 */
export async function solicitarPermissaoNotificacoes(): Promise<boolean> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.warn('[PUSH] Notificações não suportadas neste navegador');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('[PUSH] Permissão de notificações negada pelo usuário');
    return false;
  }

  // Solicitar permissão
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Registra subscription no service worker e envia para o backend
 */
export async function registrarSubscription(): Promise<boolean> {
  try {
    // Verificar se service worker está registrado
    if (!('serviceWorker' in navigator)) {
      console.warn('[PUSH] Service Worker não suportado');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;

    // Obter chave pública VAPID do backend
    const publicKeyResponse = await api.get('/push/public-key');
    const { publicKey } = publicKeyResponse.data;

    if (!publicKey) {
      console.error('[PUSH] Chave pública VAPID não encontrada');
      return false;
    }

    // Converter chave pública para formato Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    // Criar subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    // Enviar subscription para o backend
    await api.post('/push/subscribe', {
      subscription: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!)
        }
      }
    });

    console.log('[PUSH] Subscription registrada com sucesso');
    return true;
  } catch (error: unknown) {
    console.error('[PUSH] Erro ao registrar subscription:', error);
    return false;
  }
}

/**
 * Remove subscription do service worker e do backend
 */
export async function removerSubscription(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Remover do backend
      await api.post('/push/unsubscribe', {
        endpoint: subscription.endpoint
      });

      // Remover do service worker
      await subscription.unsubscribe();

      console.log('[PUSH] Subscription removida com sucesso');
      return true;
    }

    return false;
  } catch (error: unknown) {
    console.error('[PUSH] Erro ao remover subscription:', error);
    return false;
  }
}

/**
 * Verifica se o usuário já tem subscription ativa
 */
export async function verificarSubscriptionAtiva(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('[PUSH] Erro ao verificar subscription:', error);
    return false;
  }
}

/**
 * Converte chave pública VAPID de base64 URL-safe para Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

/**
 * Converte ArrayBuffer para base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

