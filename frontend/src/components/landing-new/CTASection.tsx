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
      id="cta"
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
          <p className="text-xl md:text-2xl text-light-muted mb-8 max-w-2xl mx-auto">
            Acesse treinos personalizados, acompanhe seu progresso e alcance resultados reais. Tudo que você precisa em um só lugar.
          </p>

          {/* Preço em destaque */}
          <div className="mb-12">
            <div className="inline-block bg-dark-lighter/50 backdrop-blur-xl rounded-2xl p-6 border border-primary/30">
              <p className="text-light-muted text-lg mb-2">Acesso mensal</p>
              <p className="text-5xl md:text-6xl font-display font-bold text-primary">
                R$ 19,90<span className="text-2xl text-light-muted">/mês</span>
              </p>
              <p className="text-light-muted text-sm mt-2">Preço único • Cancele quando quiser</p>
            </div>
          </div>

              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-10 md:mb-12">
                <button
                  onClick={handleCTA}
                  className="btn-primary text-lg md:text-xl px-8 md:px-12 py-5 md:py-6 font-bold shadow-2xl shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group w-full sm:w-auto"
                >
                  <span className="relative z-10">Começar Agora</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm md:text-base text-light-muted max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-center">Acesso imediato a todos os recursos</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-center">Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
