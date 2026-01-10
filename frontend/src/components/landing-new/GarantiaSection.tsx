import { useScrollAnimation } from '../../hooks/useScrollAnimation'

export default function GarantiaSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/40 to-dark border-y border-grey/20"
    >
      <div className="max-w-4xl mx-auto">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="bg-success/20 border-2 border-success/50 rounded-xl p-8 md:p-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-light">
                Teste sem risco
              </h2>
            </div>
            <p className="text-lg md:text-xl font-semibold text-light mb-2">
              Use o AthletIA por 7 dias. Se não gostar, devolvemos 100% do valor.
            </p>
            <p className="text-base md:text-lg text-light-muted">
              Sem perguntas. Sem burocracia.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
