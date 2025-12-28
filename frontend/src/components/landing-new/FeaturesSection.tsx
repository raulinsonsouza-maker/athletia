import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface Feature {
  title: string
  description: string
  image: string
  imageAlt: string
  reverse?: boolean
}

const features: Feature[] = [
  {
    title: 'Treinos Personalizados',
    description: 'Acesse seus treinos personalizados criados pela IA, com exercícios, séries e repetições otimizadas para você. O sistema aprende com seu desempenho e evolui constantemente.',
    image: '/images/app-preview/novas/2.svg',
    imageAlt: 'Tela de treinos personalizados do AthletIA',
    reverse: false
  },
  {
    title: 'Acompanhe seu Progresso',
    description: 'Gráficos detalhados de frequência, métricas de treinos, exercícios e volume total para visualizar sua evolução em tempo real. Veja exatamente como seu corpo está mudando.',
    image: '/images/app-preview/novas/3.svg',
    imageAlt: 'Gráficos de progresso do AthletIA',
    reverse: true
  },
  {
    title: 'Exercícios Detalhados',
    description: 'Guias completos com ilustrações e instruções de execução para cada exercício, garantindo a forma correta e maximizando seus resultados com segurança.',
    image: '/images/app-preview/Editadas/Exercicios.png',
    imageAlt: 'Detalhes de exercícios do AthletIA',
    reverse: false
  },
  {
    title: 'Histórico Completo',
    description: 'Visualize todo seu histórico de treinos, acompanhe suas sessões anteriores e veja sua evolução ao longo do tempo. Nunca perca o controle do seu progresso.',
    image: '/images/app-preview/novas/5.svg',
    imageAlt: 'Histórico de treinos do AthletIA',
    reverse: true
  },
  {
    title: 'Perfil e Métricas',
    description: 'Acompanhe seu peso, IMC, calorias diárias e água recomendada para otimizar seus resultados e manter-se saudável. Tudo em um só lugar.',
    image: '/images/app-preview/novas/6.svg',
    imageAlt: 'Perfil e métricas de saúde do AthletIA',
    reverse: false
  }
]

interface FeaturesSectionProps {
  onStartOnboarding?: () => void
}

export default function FeaturesSection({ onStartOnboarding }: FeaturesSectionProps) {
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
      id="features"
      className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/30 to-dark relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4">
            O que você terá{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              acesso
            </span>
          </h2>
          <p className="text-xl text-light-muted max-w-3xl mx-auto">
            Recursos poderosos que vão acelerar seus resultados e transformar seu corpo de verdade
          </p>
        </div>

        <div className="space-y-32 md:space-y-40">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                feature.reverse ? 'lg:grid-flow-dense' : ''
              } ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } transition-all duration-1000`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Texto */}
              <div className={`space-y-6 ${feature.reverse ? 'lg:col-start-2' : ''}`}>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">
                  {feature.title}
                </h3>
                <p className="text-xl md:text-2xl text-light-muted leading-relaxed">
                  {feature.description}
                </p>
                {/* CTA intermediário - aparece em features alternadas */}
                {index % 2 === 0 && (
                  <div className="pt-4 md:pt-6">
                    <button
                      onClick={handleCTA}
                      className="btn-primary text-base md:text-lg px-6 md:px-10 py-4 md:py-5 font-bold shadow-xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
                    >
                      Começar Agora - R$ 19,90/mês
                    </button>
                  </div>
                )}
              </div>

              {/* Imagem - estilo Productive */}
              <div className={`relative ${feature.reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                <div className="relative w-full flex justify-center">
                  <img
                    src={feature.image}
                    alt={feature.imageAlt}
                    className="w-full max-w-lg h-auto drop-shadow-2xl rounded-2xl"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback para imagens antigas se não existir
                      const target = e.target as HTMLImageElement
                      const fallbacks: Record<string, string> = {
                        '/images/app-preview/novas/2.svg': '/images/app-preview/feature-treinos.webp',
                        '/images/app-preview/novas/3.svg': '/images/app-preview/feature-progresso.webp',
                        '/images/app-preview/Editadas/Exercicios.png': '/images/app-preview/feature-exercicios.webp',
                        '/images/app-preview/novas/5.svg': '/images/app-preview/feature-historico.webp',
                        '/images/app-preview/novas/6.svg': '/images/app-preview/feature-perfil.webp'
                      }
                      target.src = fallbacks[feature.image] || '/images/app-preview/hero-app.webp'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
