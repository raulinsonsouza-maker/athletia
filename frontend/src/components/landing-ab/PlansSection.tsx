import { PLANOS_CHECKOUT } from '../../constants/planos-precos'

interface PlansSectionProps {
  selectedPlan: 'MENSAL' | 'TRIMESTRAL'
  onPlanSelect: (plano: 'MENSAL' | 'TRIMESTRAL') => void
  formReady: boolean
}

const PLANOS = PLANOS_CHECKOUT.filter((p) => p.id === 'MENSAL' || p.id === 'TRIMESTRAL')

export default function PlansSection({ selectedPlan, onPlanSelect, formReady }: PlansSectionProps) {
  if (!formReady) {
    return null
  }

  return (
    <section className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-b from-dark-lighter/30 to-dark">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
            Escolha seu plano
          </h2>
          <p className="text-lg text-light-muted">
            Planos flexíveis para evoluir seu corpo toda semana
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {PLANOS.map((plano) => {
            const selected = selectedPlan === plano.id

            return (
              <button
                key={plano.id}
                type="button"
                onClick={() => onPlanSelect(plano.id)}
                className={`relative w-full p-6 rounded-2xl text-left transition-all duration-300 flex flex-col h-full ${
                  selected
                    ? 'border-2 border-primary bg-gradient-to-br from-primary/30 via-primary/15 to-primary/30 shadow-2xl shadow-primary/40 md:scale-105'
                    : plano.popular
                    ? 'border-2 border-primary/60 bg-dark-lighter hover:border-primary hover:shadow-xl shadow-primary/20'
                    : 'border-2 border-grey/30 bg-dark-lighter hover:border-primary/50 hover:shadow-lg'
                }`}
              >
                {/* Badge Mais Popular */}
                {plano.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-primary to-primary/80 text-dark text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                {/* Badge Selecionado */}
                {selected && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="bg-primary rounded-full p-2 shadow-xl">
                      <svg className="w-5 h-5 text-dark" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Nome do Plano */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-light mb-1">{plano.nome}</h3>
                </div>

                {/* Preço */}
                <div className="mb-4 pb-4 border-b border-grey/30">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-lg font-semibold text-light-muted">R$</span>
                    <span className={`text-4xl md:text-5xl font-bold ${selected ? 'text-primary' : 'text-primary/90'}`}>
                      {plano.precoMensal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className="text-sm text-light-muted mb-3">/ mês</p>
                  
                  {plano.id !== 'MENSAL' && (
                    <div className="bg-dark/50 rounded-lg p-2 mb-2">
                      <p className="text-xs text-light-muted mb-1">Pagamento único:</p>
                      <p className="text-xl font-bold text-light">
                        R$ {plano.preco.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  )}
                  
                  {plano.economia && (
                    <div className="bg-success/20 border border-success/50 rounded-lg p-2">
                      <p className="text-xs text-success font-bold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {plano.economia}
                      </p>
                    </div>
                  )}
                </div>

                {/* Benefícios Resumidos */}
                <div className="space-y-2 flex-1">
                  {[
                    'Treino personalizado com IA',
                    'Ajustes automáticos',
                    'Histórico completo',
                    'Acompanhamento de progresso'
                  ].map((beneficio, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-light-muted">{beneficio}</span>
                    </div>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
