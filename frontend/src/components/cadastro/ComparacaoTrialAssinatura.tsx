export default function ComparacaoTrialAssinatura() {
  const recursos = [
    {
      nome: 'Treino personalizado',
      trial: true,
      assinatura: true
    },
    {
      nome: 'Ajustes automáticos',
      trial: true,
      assinatura: true
    },
    {
      nome: 'Histórico completo',
      trial: true,
      assinatura: true
    },
    {
      nome: 'Duração',
      trial: '3 dias',
      assinatura: 'Ilimitado'
    },
    {
      nome: 'Treinos futuros',
      trial: 'Limitado',
      assinatura: '30 dias gerados'
    },
    {
      nome: 'Atualizações periódicas',
      trial: false,
      assinatura: true
    },
    {
      nome: 'Suporte prioritário',
      trial: false,
      assinatura: true
    }
  ]

  const renderValor = (valor: boolean | string) => {
    if (typeof valor === 'boolean') {
      return valor ? (
        <svg className="w-6 h-6 text-success mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-error mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
    return <span className="text-sm text-light-muted text-center">{valor}</span>
  }

  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-4">
            Trial vs. Assinatura
          </h2>
          <p className="text-lg text-light-muted">
            Veja o que você tem no trial e o que ganha ao assinar
          </p>
        </div>

        <div className="rounded-3xl bg-dark-lighter border-2 border-grey/30 overflow-hidden">
          {/* Header da tabela */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-dark border-b border-grey/20">
            <div className="text-left">
              <h3 className="text-lg font-bold text-light">Recurso</h3>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-light">Trial 3 dias</h3>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-primary">Assinatura</h3>
            </div>
          </div>

          {/* Linhas da tabela */}
          <div className="divide-y divide-grey/20">
            {recursos.map((recurso, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 p-6 hover:bg-dark/50 transition-colors">
                <div className="flex items-center">
                  <span className="text-base text-light">{recurso.nome}</span>
                </div>
                <div className="flex items-center justify-center">
                  {renderValor(recurso.trial)}
                </div>
                <div className="flex items-center justify-center">
                  {renderValor(recurso.assinatura)}
                </div>
              </div>
            ))}
          </div>

          {/* Footer com destaque */}
          <div className="p-6 bg-primary/10 border-t border-primary/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-light-muted mb-1">Trial de 3 dias</p>
                <p className="text-lg font-bold text-light">100% gratuito e sem cartão</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-light-muted mb-1">Após o trial</p>
                <p className="text-lg font-bold text-primary">Escolha seu plano para continuar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

