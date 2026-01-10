import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface ComparacaoSimplesSectionProps {
  onStartOnboarding?: () => void
}

export default function ComparacaoSimplesSection({ onStartOnboarding }: ComparacaoSimplesSectionProps) {
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
      <div className="max-w-5xl mx-auto">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {/* Treino Genérico */}
            <div className="bg-dark-lighter/40 backdrop-blur-sm rounded-xl p-6 border border-grey/30 text-center">
              <h3 className="text-xl font-bold text-light mb-3">Treino genérico</h3>
              <p className="text-base text-light-muted">Não evolui</p>
            </div>

            {/* Personal Trainer */}
            <div className="bg-dark-lighter/40 backdrop-blur-sm rounded-xl p-6 border border-grey/30 text-center">
              <h3 className="text-xl font-bold text-light mb-3">Personal trainer</h3>
              <p className="text-base text-light-muted">Caro e limitado</p>
            </div>

            {/* AthletIA - Destacado */}
            <div className="bg-gradient-to-br from-primary/30 via-primary/15 to-primary/30 backdrop-blur-xl rounded-xl p-6 border-2 border-primary shadow-xl shadow-primary/30 text-center">
              <h3 className="text-xl font-bold text-light mb-3">AthletIA</h3>
              <p className="text-base text-primary font-semibold">Personalizado, automático e acessível</p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleCTA}
              className="btn-primary text-base md:text-lg px-8 md:px-12 py-4 md:py-5 font-bold shadow-2xl shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
            >
              Acessar meu treino inteligente
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
