interface PlanosSectionProps {
  onScrollToForm: () => void
}

export default function PlanosSection({ onScrollToForm }: PlanosSectionProps) {
  const planos = [
    {
      nome: 'Mensal',
      preco: 'R$ 19,90',
      periodo: 'por mês',
      economia: null
    },
    {
      nome: 'Trimestral',
      preco: 'R$ 49,90',
      periodo: 'a cada 3 meses',
      economia: 'Economize R$ 9,80',
      popular: true
    },
    {
      nome: 'Semestral',
      preco: 'R$ 89,90',
      periodo: 'a cada 6 meses',
      economia: 'Economize R$ 29,50'
    }
  ]

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-dark-lighter/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-4">
            Valores dos planos após 24 horas
          </h2>
          <p className="text-lg text-light-muted">
            Após o período de teste, escolha o plano ideal para continuar
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10">
          {planos.map((plano, index) => (
            <div
              key={index}
              className={`rounded-2xl border-2 p-6 transition-all duration-300 relative ${
                plano.popular
                  ? 'bg-dark border-primary/60 hover:border-primary hover:shadow-xl shadow-primary/20 md:scale-105'
                  : 'bg-dark-lighter border-grey/30 hover:border-primary/50'
              }`}
            >
              {plano.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-primary to-primary/80 text-dark text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    MAIS POPULAR
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-light mb-3 mt-2">{plano.nome}</h3>
              <div className="mb-4">
                <p className="text-3xl font-extrabold text-primary mb-1">{plano.preco}</p>
                <p className="text-sm text-light-muted mb-2">{plano.periodo}</p>
                {plano.economia && (
                  <p className="text-sm font-semibold text-primary">{plano.economia}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center bg-dark-lighter border-2 border-grey/30 rounded-2xl p-6 mb-10">
          <p className="text-base text-light-muted mb-2">
            Você terá <strong className="text-primary">24 horas gratuitas</strong> para testar tudo antes de escolher um plano.
          </p>
          <p className="text-sm text-light-muted">
            Sem cartão de crédito necessário para o período de teste.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onScrollToForm}
            className="btn-primary text-base md:text-lg px-8 md:px-12 py-4 md:py-5 font-bold shadow-xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Finalizar meu cadastro
          </button>
        </div>
      </div>
    </section>
  )
}

