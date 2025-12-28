import { useScrollAnimation } from '../../hooks/useScrollAnimation'

const steps = [
  {
    number: 1,
    title: 'Responda perguntas rápidas',
    description: 'Nosso questionário inteligente leva apenas 2 minutos e coleta informações sobre seus objetivos, nível de experiência e preferências.'
  },
  {
    number: 2,
    title: 'A IA analisa seu perfil',
    description: 'Nossa inteligência artificial processa suas respostas e cria um plano personalizado exclusivo para você.'
  },
  {
    number: 3,
    title: 'Receba seu treino completo',
    description: 'Em segundos, você terá acesso a um programa de treinos completo, com exercícios, séries, repetições e descansos otimizados.'
  },
  {
    number: 4,
    title: 'Evolua automaticamente',
    description: 'A cada treino, o sistema ajusta automaticamente peso, repetições e volume baseado no seu desempenho real.'
  }
]

interface HowItWorksSectionProps {
  onStartOnboarding?: () => void
}

export default function HowItWorksSection({ onStartOnboarding }: HowItWorksSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
  
  const handleCTA = () => {
    // Sempre fazer scroll para o formulário
    const element = document.getElementById('formulario-cadastro')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (onStartOnboarding) {
      onStartOnboarding()
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
            Como você vai{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              alcançar resultados
            </span>
          </h2>
          <p className="text-xl text-light-muted max-w-3xl mx-auto">
            Um processo simples que transforma seus objetivos em treinos personalizados que realmente funcionam
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
        <div className={`text-center transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <button
            onClick={handleCTA}
            className="btn-primary text-lg md:text-xl px-10 md:px-14 py-5 md:py-6 font-bold shadow-2xl shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Quero Meus Treinos Personalizados - R$ 19,90/mês
          </button>
        </div>
      </div>
    </section>
  )
}

