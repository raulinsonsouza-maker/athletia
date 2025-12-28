import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface HeroSectionProps {
  onStartOnboarding?: () => void
  nomeUsuario?: string
}

export default function HeroSection({ onStartOnboarding, nomeUsuario }: HeroSectionProps) {
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
      className={`py-16 md:py-24 px-4 md:px-6 relative overflow-hidden transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Background minimalista - estilo Productive */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-lighter to-dark" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
        {/* Conteúdo textual */}
        <div className={`text-center lg:text-left space-y-8 transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-[1.1] tracking-tight text-light">
            {nomeUsuario ? (
              <>
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {nomeUsuario}
                </span>
                {', transforme seu corpo com treinos inteligentes'}
              </>
            ) : (
              <>
                Transforme seu corpo com{' '}
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  treinos inteligentes
                </span>
              </>
            )}
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-light-muted leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Treinos personalizados criados por IA que se adaptam ao seu corpo. Veja resultados reais em semanas.
          </p>

          <div className="space-y-6 pt-6">
            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleCTA}
                className="btn-primary text-base md:text-lg px-8 md:px-12 py-4 md:py-5 font-bold shadow-2xl shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group w-full sm:w-auto"
              >
                <span className="relative z-10">Começar Agora - R$ 19,90/mês</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            {/* Benefícios em destaque */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-4">
              <div className="flex items-center gap-2 bg-dark-lighter/30 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-primary/20">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm md:text-base text-light font-semibold">Resultados em semanas</span>
              </div>
              <div className="flex items-center gap-2 bg-dark-lighter/30 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-primary/20">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm md:text-base text-light font-semibold">Treinos que evoluem</span>
              </div>
              <div className="flex items-center gap-2 bg-dark-lighter/30 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-primary/20">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm md:text-base text-light font-semibold">Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview do app - estilo Productive (mais limpo) */}
        <div className={`relative flex justify-center lg:justify-end transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
        }`}>
          <div className="relative w-full max-w-md">
            {/* Imagem Hero - nova versão */}
            <div className="relative">
              <img
                src="/images/app-preview/Editadas/hero-left.png"
                alt="Interface do AthletIA mostrando treinos personalizados"
                className="w-full h-auto drop-shadow-2xl"
                loading="eager"
                onError={(e) => {
                  // Fallback para Hero_nova.png se imagem não existir
                  const target = e.target as HTMLImageElement
                  target.src = '/images/app-preview/Editadas/Hero_nova.png'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
