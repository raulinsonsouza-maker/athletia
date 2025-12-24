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
  promptInstall: () => Promise<void>;
  dismissPrompt: () => void;
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

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

  const promptInstall = async () => {
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
      } else {
        console.log('[PWA] Usuário negou instalação');
      }

      // Limpar prompt
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('[PWA] Erro ao mostrar prompt de instalação:', error);
    }
  };

  const dismissPrompt = () => {
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    dismissPrompt
  };
}

