import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface HowItWorksSectionProps {
  onStartOnboarding?: () => void
}

const steps = [
  {
    number: 1,
    title: 'Seu treino está pronto',
    description: 'Baseado nas suas respostas, nossa IA já criou um plano de treinos personalizado exclusivo para você, com exercícios, séries, repetições e descansos otimizados.'
  },
  {
    number: 2,
    title: 'Finalize sua assinatura',
    description: 'Assim que você finalizar o pagamento, terá acesso imediato ao seu programa completo de treinos personalizados.'
  },
  {
    number: 3,
    title: 'Comece a treinar',
    description: 'Acesse seu treino completo em segundos e comece sua jornada de transformação com exercícios adaptados ao seu perfil.'
  },
  {
    number: 4,
    title: 'Evolua automaticamente',
    description: 'A cada treino, o sistema ajusta automaticamente peso, repetições e volume baseado no seu desempenho real, garantindo progressão constante.'
  }
]

export default function HowItWorksSection({ onStartOnboarding }: HowItWorksSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  const handleCTA = () => {
    if (onStartOnboarding) {
      onStartOnboarding()
    } else {
      const element = document.getElementById('cta')
      element?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-dark-lighter/50 via-dark to-dark-lighter/50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4">
            Seu treino está{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              pronto
            </span>
          </h2>
          <p className="text-xl text-light-muted max-w-3xl mx-auto">
            Nossa IA já analisou seu perfil e criou um plano personalizado. Finalize sua assinatura e comece a treinar agora mesmo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Linha conectora (apenas desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -z-10" style={{ width: 'calc(100% - 4rem)' }} />
              )}

              <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-2xl p-8 border border-grey/20 hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 h-full group">
                {/* Número do passo */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center mx-auto transition-colors">
                    <span className="text-3xl font-display font-bold text-primary">{step.number}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="lg:hidden absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -z-10" />
                  )}
                </div>

                {/* Conteúdo */}
                <h3 className="text-xl md:text-2xl font-display font-bold text-light mb-4 text-center group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-light-muted text-center leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA intermediário após os passos */}
        <div className={`text-center mt-12 md:mt-16 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <button
            onClick={handleCTA}
            className="btn-primary text-base md:text-lg px-6 md:px-10 py-4 md:py-5 font-bold shadow-2xl shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
          >
            Quero Meus Treinos Personalizados - R$ 29,90/mês
          </button>
        </div>
      </div>
    </section>
  )
}
