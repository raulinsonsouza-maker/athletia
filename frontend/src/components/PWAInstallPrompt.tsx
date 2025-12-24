/**
 * Componente de banner para instalar PWA
 */

import { usePWAInstall } from '../hooks/usePWAInstall';

export default function PWAInstallPrompt() {
  const { isInstallable, promptInstall, dismissPrompt } = usePWAInstall();

  // Não mostrar se não for instalável ou se já estiver instalado
  if (!isInstallable) {
    return null;
  }

  // Não mostrar em desktop (apenas mobile)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-4 animate-slide-up">
      <div className="bg-gradient-to-r from-primary/90 to-primary/80 backdrop-blur-xl border border-primary/50 rounded-2xl p-4 shadow-2xl max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-white"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm mb-1">Instalar AthletIA</h3>
            <p className="text-white/90 text-xs mb-3">
              Adicione à tela inicial para acesso rápido e notificações
            </p>
            <div className="flex gap-2">
              <button
                onClick={promptInstall}
                className="flex-1 bg-white text-primary font-semibold py-2 px-4 rounded-xl text-sm hover:bg-white/90 transition"
              >
                Instalar
              </button>
              <button
                onClick={dismissPrompt}
                className="px-4 py-2 text-white/80 text-sm hover:text-white transition"
              >
                Depois
              </button>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="flex-shrink-0 text-white/60 hover:text-white transition p-1"
            aria-label="Fechar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

