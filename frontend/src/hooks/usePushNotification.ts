/**
 * Hook para gerenciar notificações push
 */

import { useState, useEffect } from 'react';
import * as pushNotificationService from '../services/push-notification.service';

interface UsePushNotificationReturn {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  isLoading: boolean;
  solicitarPermissao: () => Promise<boolean>;
  removerSubscription: () => Promise<boolean>;
}

export function usePushNotification(): UsePushNotificationReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    verificarSuporte();
  }, []);

  const verificarSuporte = async () => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      const subscribed = await pushNotificationService.verificarSubscriptionAtiva();
      setIsSubscribed(subscribed);
    }

    setIsLoading(false);
  };

  const solicitarPermissao = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const granted = await pushNotificationService.solicitarPermissaoNotificacoes();
      
      if (granted) {
        setPermission(Notification.permission);
        const registered = await pushNotificationService.registrarSubscription();
        setIsSubscribed(registered);
        return registered;
      }

      setPermission(Notification.permission);
      return false;
    } catch (error) {
      console.error('[PUSH HOOK] Erro ao solicitar permissão:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removerSubscription = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const removed = await pushNotificationService.removerSubscription();
      setIsSubscribed(!removed);
      return removed;
    } catch (error) {
      console.error('[PUSH HOOK] Erro ao remover subscription:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    solicitarPermissao,
    removerSubscription
  };
}

