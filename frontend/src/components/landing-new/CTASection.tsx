import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface CTASectionProps {
  onStartOnboarding?: () => void
}

export default function CTASection({ onStartOnboarding }: CTASectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 })

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
      id="cta"
      className="py-12 md:py-16 px-4 md:px-6 relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-dark"
    >
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-4">
            Seu treino já foi criado.
          </h2>
          <p className="text-xl md:text-2xl font-semibold text-light mb-8">
            Agora falta apenas liberar o acesso.
          </p>

          <div className="mb-8">
            <button
              onClick={handleCTA}
              className="btn-primary text-lg md:text-xl px-8 md:px-12 py-5 md:py-6 font-bold shadow-2xl shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group w-full sm:w-auto"
            >
              <span className="relative z-10">Começar a treinar agora</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          <p className="text-sm md:text-base text-light-muted">
            R$ 29,90/mês • Acesso imediato • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  )
}
