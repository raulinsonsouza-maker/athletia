interface PoliticasModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PoliticasModal({ isOpen, onClose }: PoliticasModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-dark-lighter rounded-2xl border border-grey/20 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-dark-lighter border-b border-grey/20 px-6 md:px-8 py-5 flex items-center justify-between z-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-light">
            Políticas
          </h2>
          <button
            onClick={onClose}
            className="text-light-muted hover:text-light transition-colors p-2 hover:bg-grey/10 rounded-lg"
            aria-label="Fechar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 md:px-8 py-6 md:py-8 space-y-8 text-light-muted">
          {/* Política de Privacidade */}
          <section>
            <h3 className="text-xl font-display font-bold text-light mb-4">
              Política de Privacidade
            </h3>
            <div className="prose prose-invert max-w-none space-y-4">
              <p className="text-base leading-relaxed">
                A AthletIA respeita a sua privacidade e está comprometida em proteger seus dados pessoais. 
                Esta política explica como coletamos, usamos e protegemos suas informações.
              </p>
              <h4 className="text-lg font-semibold text-light mt-6 mb-3">
                Dados Coletados
              </h4>
              <p className="text-base leading-relaxed">
                Coletamos informações que você nos fornece diretamente, como nome, email, dados de perfil físico, 
                histórico de treinos e objetivos de fitness. Também coletamos dados de uso da plataforma de forma anônima.
              </p>
              <h4 className="text-lg font-semibold text-light mt-6 mb-3">
                Uso dos Dados
              </h4>
              <p className="text-base leading-relaxed">
                Utilizamos seus dados exclusivamente para personalizar sua experiência na plataforma, gerar treinos 
                adaptados às suas necessidades e melhorar nossos serviços. Nunca compartilhamos seus dados pessoais 
                com terceiros sem seu consentimento.
              </p>
            </div>
          </section>

          {/* Termos de Uso */}
          <section className="border-t border-grey/20 pt-8">
            <h3 className="text-xl font-display font-bold text-light mb-4">
              Termos de Uso
            </h3>
            <div className="prose prose-invert max-w-none space-y-4">
              <p className="text-base leading-relaxed">
                Ao utilizar a plataforma AthletIA, você concorda em usar nossos serviços de forma responsável e 
                em conformidade com estes termos.
              </p>
              <h4 className="text-lg font-semibold text-light mt-6 mb-3">
                Responsabilidade
              </h4>
              <p className="text-base leading-relaxed">
                A AthletIA fornece recomendações de treino baseadas em dados fornecidos por você. É sua responsabilidade 
                consultar um médico antes de iniciar qualquer programa de exercícios e garantir que está em condições 
                físicas adequadas para realizar as atividades sugeridas.
              </p>
              <h4 className="text-lg font-semibold text-light mt-6 mb-3">
                Limitação de Responsabilidade
              </h4>
              <p className="text-base leading-relaxed">
                A AthletIA não se responsabiliza por lesões ou problemas de saúde decorrentes do uso da plataforma. 
                Nossos treinos são sugestões e devem ser adaptados às suas condições físicas e limitações pessoais.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-grey/20 px-6 md:px-8 py-4 bg-dark-lighter">
          <button
            onClick={onClose}
            className="w-full btn-primary py-3"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

