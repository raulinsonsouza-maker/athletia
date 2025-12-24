interface SobreNosModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SobreNosModal({ isOpen, onClose }: SobreNosModalProps) {
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
            Sobre Nós
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
        <div className="px-6 md:px-8 py-6 md:py-8 space-y-6 text-light-muted">
          <div className="prose prose-invert max-w-none">
            <h3 className="text-xl font-display font-bold text-light mb-4">
              Transformando Esforço em Resultado Real
            </h3>
            <p className="text-base leading-relaxed mb-4">
              A AthletIA nasceu da necessidade de combinar tecnologia, personalização e estratégia científica para 
              ajudar pessoas a alcançarem seus objetivos físicos de forma inteligente e sustentável.
            </p>
            <p className="text-base leading-relaxed mb-4">
              Nossa missão é democratizar o acesso a treinamentos personalizados de alta qualidade, utilizando 
              inteligência artificial para criar programas adaptados às necessidades, objetivos e limitações de cada pessoa.
            </p>
            <h3 className="text-xl font-display font-bold text-light mb-4 mt-8">
              Nossa Abordagem
            </h3>
            <p className="text-base leading-relaxed mb-4">
              Acreditamos que não existe um treino único que funcione para todos. Por isso, desenvolvemos uma plataforma 
              que aprende com você, adapta-se ao seu progresso e oferece orientações precisas baseadas em evidências científicas.
            </p>
            <p className="text-base leading-relaxed">
              Seja você iniciante ou experiente, nossa tecnologia está aqui para acelerar seus resultados, 
              mantendo o foco na segurança, eficiência e consistência.
            </p>
          </div>
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

