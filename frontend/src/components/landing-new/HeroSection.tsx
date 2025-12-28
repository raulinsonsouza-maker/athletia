import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface HeroSectionProps {
  onStartOnboarding?: () => void
}

export default function HeroSection({ onStartOnboarding }: HeroSectionProps) {
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
      className={`min-h-screen flex items-center justify-center px-4 md:px-6 py-20 md:py-32 relative overflow-hidden transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Background com gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-lighter to-dark">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        {/* Conteúdo textual */}
        <div className={`text-center lg:text-left space-y-8 transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-extrabold leading-[1.1] tracking-tight text-light">
            Transforme seu corpo com{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              treinos inteligentes
            </span>
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl text-light-muted leading-relaxed max-w-2xl mx-auto lg:mx-0">
            O sistema de IA que cria, ajusta e evolui seus treinos automaticamente. Você só precisa treinar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <button
              onClick={handleCTA}
              className="btn-primary text-lg md:text-xl px-8 md:px-12 py-5 md:py-6 font-bold shadow-2xl shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">Começar Agora</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('features')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-8 md:px-12 py-5 md:py-6 text-lg md:text-xl font-semibold border-2 border-primary/30 text-primary hover:border-primary hover:bg-primary/10 rounded-xl transition-all duration-300"
            >
              Ver Funcionalidades
            </button>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-8 pt-4 text-sm md:text-base text-light-muted">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Resultados em semanas</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>100% Personalizado</span>
            </div>
          </div>
        </div>

        {/* Preview do app com animação */}
        <div className={`relative flex justify-center lg:justify-end transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
        }`}>
          <div className="relative max-w-sm w-full">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/30 via-primary/20 to-transparent blur-3xl -z-10 scale-110" />
            
            {/* Frame do telefone */}
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-dark-lighter/50 backdrop-blur-xl bg-dark-lighter/30">
              {/* Placeholder para screenshot - será substituído pela imagem real */}
              <div className="aspect-[9/19.5] bg-gradient-to-br from-dark-lighter to-dark flex items-center justify-center relative overflow-hidden">
                <img
                  src="/images/app-preview/treinos-screen.webp"
                  alt="Interface do AthletIA mostrando treinos personalizados"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                {/* Overlay para efeito de profundidade */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/50 via-transparent to-transparent" />
              </div>
            </div>

            {/* Elementos flutuantes decorativos */}
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>
      </div>
    </section>
  )
}

