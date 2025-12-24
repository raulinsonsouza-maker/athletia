/**
 * Componente de modal para instalar PWA
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import PWAInstallIOSModal from './PWAInstallIOSModal';

interface PWAInstallPromptProps {
  forceShow?: boolean;
}

export default function PWAInstallPrompt({ forceShow = false }: PWAInstallPromptProps) {
  const location = useLocation();
  const { 
    isIOS, 
    isAndroid, 
    shouldShowPrompt, 
    promptInstall, 
    dismissPrompt,
    markAsShown,
    redirectToLogin
  } = usePWAInstall();

  const [showModal, setShowModal] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Verificar se deve mostrar
  useEffect(() => {
    // Verificar se há flag de onboarding completo na landing page
    const onboardingComplete = sessionStorage.getItem('pwa-show-onboarding-complete') === 'true';
    
    // Se estamos na landing page (/) e onboarding está completo, forçar mostrar
    // Caso contrário, verificar condições normais
    const forceShowFlag = forceShow || (location.pathname === '/' && onboardingComplete);
    const shouldShow = forceShowFlag || shouldShowPrompt(forceShowFlag);
    
    if (shouldShow && !showModal) {
      const isMobile = isIOS || isAndroid;
      if (isMobile) {
        setShowModal(true);
        markAsShown();
        // Limpar o flag após mostrar
        if (onboardingComplete) {
          sessionStorage.removeItem('pwa-show-onboarding-complete');
        }
      }
    }
  }, [forceShow, location.pathname, shouldShowPrompt, isIOS, isAndroid, markAsShown, showModal]);

  // Não mostrar se não for mobile
  const isMobile = isIOS || isAndroid;
  if (!showModal || !isMobile) {
    return null;
  }

  const handleClose = () => {
    setShowModal(false);
    dismissPrompt();
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      // Para iOS, mostrar modal com instruções
      setShowIOSModal(true);
    } else {
      // Para Android, usar o prompt nativo
      await promptInstall();
      // O redirecionamento será feito pelo hook após a instalação
    }
  };

  const handleIOSInstall = () => {
    setShowIOSModal(false);
    setShowModal(false);
    redirectToLogin();
  };

  return (
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Overlay escuro */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-gradient-to-br from-dark via-dark-lighter to-dark border-2 border-primary/50 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-scale-in">
          {/* Botão fechar */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-light-muted hover:text-light transition-colors p-2"
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
              className="w-6 h-6"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Conteúdo */}
          <div className="text-center">
            {/* Ícone */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-12 h-12 text-primary"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>

            {/* Título */}
            <h2 className="text-3xl font-display font-bold text-light mb-3">
              Instalar AthletIA
            </h2>
            <p className="text-light-muted mb-8 text-lg">
              {isIOS 
                ? 'Adicione o app à sua tela inicial para acesso rápido e uma experiência melhor'
                : 'Adicione o app à sua tela inicial para acesso rápido e notificações push'
              }
            </p>

            {/* Benefícios */}
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-primary"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-light">Acesso rápido direto da tela inicial</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-primary"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-light">Funciona offline</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-primary"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-light">
                  {isAndroid ? 'Notificações push' : 'Experiência como app nativo'}
                </span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleInstallClick}
                className="w-full bg-primary text-dark font-bold py-4 px-6 rounded-xl hover:bg-primary/90 transition-colors text-lg"
              >
                {isIOS ? 'Mostrar instruções' : 'Instalar agora'}
              </button>
              <button
                onClick={handleClose}
                className="w-full bg-dark-lighter text-light py-4 px-6 rounded-xl hover:bg-dark-lighter/80 transition-colors"
              >
                Depois
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal iOS (mostrar quando usuário clicar em "Mostrar instruções") */}
      {isIOS && (
        <PWAInstallIOSModal
          isOpen={showIOSModal}
          onClose={() => {
            setShowIOSModal(false);
            setShowModal(false);
            dismissPrompt();
          }}
          onInstall={handleIOSInstall}
        />
      )}
    </>
  );
}

