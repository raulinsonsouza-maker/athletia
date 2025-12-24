interface CadastroHeroProps {
  onScrollToForm: () => void
}

export default function CadastroHero({ onScrollToForm }: CadastroHeroProps) {
  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center w-full">
        {/* Texto principal */}
        <div className="space-y-6 md:space-y-8 text-center lg:text-left">
          {/* Indicador de progresso */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Plano 80% pronto
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-[1.1] tracking-tight text-light">
            Seu plano personalizado está pronto
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-light-muted leading-relaxed">
            Nossa IA analisou suas respostas e já começou a montar sua estratégia de evolução. Crie sua conta para liberar seu treino completo.
          </p>

          {/* Callouts destacados */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-sm font-semibold text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>🎁 24 horas GRÁTIS para testar tudo</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-lighter border border-grey/30 text-sm font-medium text-light-muted">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Sem cartão de crédito. Cancele quando quiser.</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={onScrollToForm}
              className="btn-primary text-base md:text-lg px-8 md:px-12 py-4 md:py-5 font-bold shadow-xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto"
            >
              Criar minha conta e continuar
            </button>
            <p className="text-xs md:text-sm text-light-muted">Leva menos de 30 segundos</p>
          </div>

          {/* Contador de tempo */}
          <div className="pt-4">
            <p className="text-sm text-light-muted">
              <span className="font-semibold text-primary">Seu treino será gerado em segundos</span> após o cadastro
            </p>
          </div>
        </div>

        {/* Mockup simples do treino sendo gerado */}
        <div className="relative mt-8 lg:mt-0 flex justify-center lg:justify-end">
          <div className="relative mx-auto lg:mx-0 max-w-sm w-full rounded-3xl border border-grey/30 bg-dark-lighter shadow-2xl shadow-black/50 overflow-hidden">
            <div className="bg-dark px-4 md:px-5 py-3 flex items-center justify-between border-b border-grey/20">
              <span className="text-xs font-medium text-light">Gerando seu treino...</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-[10px] text-light-muted">IA Ativa</span>
              </div>
            </div>
            <div className="p-4 md:p-5 space-y-3 md:space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-dark rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-dark rounded w-1/2 animate-pulse delay-75"></div>
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-dark px-3 py-2.5 border border-grey/20">
                    <div className="h-3 w-3 bg-dark-lighter rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-dark-lighter rounded w-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                      <div className="h-2 bg-dark-lighter rounded w-2/3 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-primary/10 border border-primary/20 px-3 py-3 text-[11px] md:text-xs">
                <span className="font-semibold text-primary">Gerando personalização... </span>
                <span className="text-light-muted">
                  Ajustando exercícios para seu perfil
                </span>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl hidden lg:block" />
        </div>
      </div>
    </section>
  )
}

