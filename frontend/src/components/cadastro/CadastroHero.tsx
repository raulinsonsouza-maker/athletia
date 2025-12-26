interface CadastroHeroProps {
  onScrollToForm: () => void
}

export default function CadastroHero({ onScrollToForm }: CadastroHeroProps) {
  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-5xl mx-auto text-center">
        {/* Título Principal */}
        <div className="space-y-8 md:space-y-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-extrabold leading-[1.1] tracking-tight text-light">
            Seu plano está quase finalizado
          </h1>

          <p className="text-2xl md:text-3xl lg:text-4xl text-light-muted leading-relaxed max-w-3xl mx-auto font-medium">
            Falta apenas criar sua conta
          </p>

          {/* CTA Principal */}
          <div className="pt-4">
            <button
              onClick={onScrollToForm}
              className="btn-primary text-lg md:text-xl lg:text-2xl px-12 md:px-16 lg:px-20 py-5 md:py-6 lg:py-7 font-bold shadow-2xl shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Finalizar meu cadastro
            </button>
            <p className="text-sm md:text-base text-light-muted mt-4">
              Leva menos de 30 segundos
            </p>
          </div>

          {/* Informações essenciais */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-lighter border border-grey/30">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm md:text-base text-light-muted">3 dias gratuitos</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-lighter border border-grey/30">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm md:text-base text-light-muted">Sem cartão de crédito</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
