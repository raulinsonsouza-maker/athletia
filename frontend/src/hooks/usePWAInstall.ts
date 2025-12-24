/**
 * Hook para gerenciar instalação do PWA
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAInstallReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  shouldShowPrompt: (forceShow?: boolean) => boolean;
  promptInstall: () => Promise<void>;
  dismissPrompt: () => void;
  markAsShown: () => void;
  redirectToLogin: () => void;
}

const STORAGE_KEY = 'pwa-install-dismissed';
const STORAGE_KEY_SHOWN = 'pwa-install-shown';

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  // Detectar plataforma
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setIsInstallable(false);
      return;
    }

    // Detectar evento beforeinstallprompt (Android Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Detectar se foi instalado
    const handleAppInstalled = () => {
      console.log('[PWA] App instalado!');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      // Limpar estados de dismiss
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_SHOWN);
      
      // Redirecionar para login após instalação
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [navigate]);

  // Verificar se deve mostrar o prompt
  const shouldShowPrompt = (forceShow = false): boolean => {
    // Se já está instalado, não mostrar
    if (isInstalled || window.matchMedia('(display-mode: standalone)').matches) {
      return false;
    }

    // Se forçado a mostrar, sempre mostrar
    if (forceShow) {
      return true;
    }

    // Verificar se foi fechado anteriormente
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      return false;
    }

    // Para iOS, sempre pode mostrar (mesmo sem beforeinstallprompt)
    if (isIOS) {
      return true;
    }

    // Para Android, só mostrar se tiver beforeinstallprompt disponível
    return isInstallable;
  };

  const promptInstall = async () => {
    if (isIOS) {
      // iOS não tem beforeinstallprompt, então apenas marca como mostrado
      markAsShown();
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    try {
      // Mostrar prompt de instalação
      await deferredPrompt.prompt();

      // Esperar escolha do usuário
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('[PWA] Usuário aceitou instalação');
        // O evento appinstalled será disparado automaticamente e redirecionará
      } else {
        console.log('[PWA] Usuário negou instalação');
        // Mesmo negado, redirecionar para login após um pequeno delay
        setTimeout(() => {
          redirectToLogin();
        }, 300);
      }

      // Limpar prompt
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('[PWA] Erro ao mostrar prompt de instalação:', error);
      // Em caso de erro, também redirecionar para login
      setTimeout(() => {
        redirectToLogin();
      }, 300);
    }
  };

  const dismissPrompt = () => {
    // Salvar no localStorage que foi fechado
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const markAsShown = () => {
    // Marcar que foi mostrado (mas não necessariamente fechado)
    localStorage.setItem(STORAGE_KEY_SHOWN, Date.now().toString());
  };

  const redirectToLogin = () => {
    navigate('/login', { replace: true });
  };

  return {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    shouldShowPrompt,
    promptInstall,
    dismissPrompt,
    markAsShown,
    redirectToLogin
  };
}

