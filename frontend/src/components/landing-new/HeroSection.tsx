import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { formatarObjetivo } from '../../utils/onboardingFormatters'

interface HeroSectionProps {
  onStartOnboarding?: () => void
  nomeUsuario?: string
  objetivo?: string
}

export default function HeroSection({ onStartOnboarding, nomeUsuario, objetivo }: HeroSectionProps) {
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
      className={`py-12 md:py-16 px-4 md:px-6 relative overflow-hidden transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-lighter to-dark" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className={`space-y-6 transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight text-light">
            {nomeUsuario ? (
              <>
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {nomeUsuario}
                </span>
                {objetivo ? (
                  <>
                    {', seu treino personalizado para '}
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {formatarObjetivo(objetivo).toLowerCase()}
                    </span>
                    {' está pronto'}
                  </>
                ) : (
                  ', seu treino personalizado está pronto'
                )}
              </>
            ) : (
              'Seu treino personalizado está pronto'
            )}
          </h1>

          <p className="text-lg md:text-xl text-light-muted leading-relaxed max-w-2xl mx-auto">
            Nossa IA analisou seu perfil e criou um plano de treinos que evolui automaticamente a cada sessão.
          </p>

          <div className="pt-4">
            <button
              onClick={handleCTA}
              className="btn-primary text-lg md:text-xl px-8 md:px-12 py-4 md:py-5 font-bold shadow-2xl shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group w-full sm:w-auto"
            >
              <span className="relative z-10">Começar a treinar agora</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <p className="text-sm md:text-base text-light-muted mt-3">
              R$ 19,90/mês • Cancele quando quiser
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
