import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface TensionSectionProps {
  onStartOnboarding?: () => void
}

export default function TensionSection({ onStartOnboarding }: TensionSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  const handleCTA = () => {
    if (onStartOnboarding) {
      onStartOnboarding()
    } else {
      const element = document.getElementById('formulario-cadastro')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/20 to-dark border-y border-grey/20"
    >
      <div className="max-w-4xl mx-auto">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-6 text-center">
            Se você sair agora:
          </h2>

          <div className="bg-dark-lighter/60 backdrop-blur-xl rounded-xl p-6 md:p-8 border border-error/30 mb-8">
            <ul className="space-y-4 text-left mb-6">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-base md:text-lg text-light">seu treino não ficará salvo</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-base md:text-lg text-light">a progressão automática não será ativada</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-base md:text-lg text-light">você continuará treinando sem saber se está evoluindo</span>
              </li>
            </ul>

            <p className="text-lg md:text-xl font-semibold text-light text-center mb-6">
              Você já deu o primeiro passo.
            </p>
            <p className="text-lg md:text-xl font-semibold text-primary text-center mb-8">
              Não interrompa sua evolução agora.
            </p>

            <div className="text-center">
              <button
                onClick={handleCTA}
                className="btn-primary text-base md:text-lg px-8 md:px-12 py-4 md:py-5 font-bold shadow-2xl shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
              >
                Liberar meu plano completo agora
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
