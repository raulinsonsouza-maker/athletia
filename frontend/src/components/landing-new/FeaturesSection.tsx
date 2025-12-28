import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface Feature {
  title: string
  description: string
  image: string
  imageAlt: string
}

const features: Feature[] = [
  {
    title: 'Treinos Personalizados',
    description: 'Acesse seus treinos personalizados criados pela IA, com exercícios, séries e repetições otimizadas para você.',
    image: '/images/app-preview/feature-treinos.webp',
    imageAlt: 'Tela de treinos personalizados do AthletIA'
  },
  {
    title: 'Acompanhe seu Progresso',
    description: 'Gráficos detalhados de frequência, métricas de treinos, exercícios e volume total para visualizar sua evolução.',
    image: '/images/app-preview/feature-progresso.webp',
    imageAlt: 'Gráficos de progresso do AthletIA'
  },
  {
    title: 'Exercícios Detalhados',
    description: 'Guias completos com ilustrações e instruções de execução para cada exercício, garantindo a forma correta.',
    image: '/images/app-preview/feature-exercicios.webp',
    imageAlt: 'Detalhes de exercícios do AthletIA'
  },
  {
    title: 'Histórico Completo',
    description: 'Visualize todo seu histórico de treinos, acompanhe suas sessões anteriores e veja sua evolução ao longo do tempo.',
    image: '/images/app-preview/feature-historico.webp',
    imageAlt: 'Histórico de treinos do AthletIA'
  },
  {
    title: 'Perfil e Métricas',
    description: 'Acompanhe seu peso, IMC, calorias diárias e água recomendada para otimizar seus resultados e manter-se saudável.',
    image: '/images/app-preview/feature-perfil.webp',
    imageAlt: 'Perfil e métricas de saúde do AthletIA'
  }
]

export default function FeaturesSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="features"
      className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/30 to-dark relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4">
            Funcionalidades que fazem{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              a diferença
            </span>
          </h2>
          <p className="text-xl text-light-muted max-w-3xl mx-auto">
            Tudo que você precisa para transformar seu corpo em um único lugar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group bg-dark-lighter/30 backdrop-blur-xl rounded-3xl overflow-hidden border border-grey/20 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Screenshot do app */}
              <div className="relative h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Placeholder - será substituído pela imagem real */}
                <div className="w-full h-full bg-gradient-to-br from-dark-lighter to-dark flex items-center justify-center">
                  {feature.image && feature.image.startsWith('/images/') ? (
                    <img
                      src={feature.image}
                      alt={feature.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        // Fallback para placeholder se imagem não existir
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center text-light-muted">
                              <div class="text-center">
                                <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p class="text-sm">Screenshot em breve</p>
                              </div>
                            </div>
                          `
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-light-muted">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">Screenshot em breve</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-8">
                <h3 className="text-2xl md:text-3xl font-display font-bold text-light mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-lg text-light-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

