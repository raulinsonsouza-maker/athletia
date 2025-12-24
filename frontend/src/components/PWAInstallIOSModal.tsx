/**
 * Modal com instruções passo-a-passo para instalação no iOS
 */

interface PWAInstallIOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
}

export default function PWAInstallIOSModal({ isOpen, onClose, onInstall }: PWAInstallIOSModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay escuro */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-dark via-dark-lighter to-dark border-2 border-primary/50 rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Botão fechar */}
        <button
          onClick={onClose}
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
            Instalar AthletIA no iPhone
          </h2>
          <p className="text-light-muted mb-8 text-lg">
            Siga estes passos simples para adicionar o app à sua tela inicial
          </p>

          {/* Instruções passo-a-passo */}
          <div className="space-y-6 mb-8 text-left">
            {/* Passo 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-dark font-bold text-lg">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-light font-semibold mb-2">Toque no botão de compartilhar</h3>
                <p className="text-light-muted text-sm">
                  Na parte inferior da tela do Safari, localize o botão de compartilhar (ícone de seta para cima dentro de um quadrado).
                </p>
                <div className="mt-2 flex justify-center">
                  <div className="w-12 h-12 bg-dark-lighter rounded-xl flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6 text-primary"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-dark font-bold text-lg">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-light font-semibold mb-2">Role até "Adicionar à Tela de Início"</h3>
                <p className="text-light-muted text-sm">
                  No menu que aparecer, role para baixo até encontrar a opção "Adicionar à Tela de Início" (pode aparecer como um ícone de + com um retângulo).
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-dark font-bold text-lg">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-light font-semibold mb-2">Toque em "Adicionar"</h3>
                <p className="text-light-muted text-sm">
                  Toque na opção "Adicionar" no canto superior direito da tela de confirmação.
                </p>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-dark font-bold text-lg">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-light font-semibold mb-2">Pronto! O app está instalado</h3>
                <p className="text-light-muted text-sm">
                  O ícone do AthletIA aparecerá na sua tela inicial. Agora você pode acessar o app como um aplicativo nativo!
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onInstall();
                onClose();
              }}
              className="w-full bg-primary text-dark font-bold py-4 px-6 rounded-xl hover:bg-primary/90 transition-colors text-lg"
            >
              Entendi, vou instalar agora
            </button>
            <button
              onClick={onClose}
              className="w-full bg-dark-lighter text-light py-4 px-6 rounded-xl hover:bg-dark-lighter/80 transition-colors"
            >
              Depois
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

