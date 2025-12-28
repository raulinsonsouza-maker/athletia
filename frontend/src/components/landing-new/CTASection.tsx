import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface CTASectionProps {
  onStartOnboarding?: () => void
}

export default function CTASection({ onStartOnboarding }: CTASectionProps) {
  const navigate = useNavigate()
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 })

  const handleCTA = () => {
    if (onStartOnboarding) {
      onStartOnboarding()
    } else {
      navigate('/')
    }
  }

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 md:py-32 px-4 md:px-6 relative overflow-hidden"
    >
      {/* Background com gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-dark">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-6">
            Pronto para{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              transformar seu corpo?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-light-muted mb-12 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já alcançaram seus objetivos com o AthletIA. Comece sua jornada hoje mesmo.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleCTA}
              className="btn-primary text-xl md:text-2xl px-12 md:px-16 py-6 md:py-7 font-bold shadow-2xl shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group w-full sm:w-auto"
            >
              <span className="relative z-10">Começar Agora - É Grátis</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('features')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-12 md:px-16 py-6 md:py-7 text-xl md:text-2xl font-semibold border-2 border-primary/50 text-primary hover:border-primary hover:bg-primary/10 rounded-xl transition-all duration-300 w-full sm:w-auto"
            >
              Ver Mais Detalhes
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm md:text-base text-light-muted">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Teste grátis por 7 dias</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Sem compromisso</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

