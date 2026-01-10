import { useScrollAnimation } from '../../hooks/useScrollAnimation'

export default function ValorRealSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  const beneficios = [
    'Treinos 100% personalizados para o seu corpo e objetivo',
    'Ajustes automáticos de carga, volume e repetições a cada treino',
    'Biblioteca com mais de 300 exercícios validados',
    'Acompanhamento de progresso em tempo real',
    'Treine em qualquer academia ou em casa'
  ]

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/40 to-dark border-y border-grey/20"
    >
      <div className="max-w-4xl mx-auto">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-8 text-center">
            O que você desbloqueia ao assinar
          </h2>

          <div className="bg-dark-lighter/60 backdrop-blur-xl rounded-xl p-6 md:p-8 border border-primary/30 mb-6">
            <ul className="space-y-4">
              {beneficios.map((beneficio, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-base md:text-lg text-light flex-1">{beneficio}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg md:text-xl font-bold text-light">
              Sem planilhas.
            </p>
            <p className="text-lg md:text-xl font-bold text-light">
              Sem achismo.
            </p>
            <p className="text-lg md:text-xl font-bold text-primary">
              Sem estagnação.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
