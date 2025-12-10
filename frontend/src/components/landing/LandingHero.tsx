interface LandingHeroProps {
  onStartOnboarding: () => void
  onScrollToHowItWorks: () => void
}

export default function LandingHero({ onStartOnboarding, onScrollToHowItWorks }: LandingHeroProps) {
  return (
    <section aria-label="Hero - Treino Personalizado Inteligente" className="min-h-[calc(100vh-80px)] flex items-center px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center w-full">
        {/* Texto principal */}
        <div className="space-y-6 md:space-y-8 text-center lg:text-left">
          {/* Badge de produto */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-semibold text-primary">Treino Personalizado com Inteligência Artificial</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-[1.1] tracking-tight text-light">
            Treino Personalizado com IA que Evolui Junto com Você
          </h1>

          <div className="space-y-3 md:space-y-4">
            <p className="text-lg md:text-xl lg:text-2xl text-light font-semibold">
              Seu treino criado automaticamente, ajustado a cada sessão e pronto para fazer você evoluir — sem treinos genéricos e sem perder tempo.
            </p>
            <p className="text-base md:text-lg lg:text-xl text-light-muted leading-relaxed">
              Em menos de 2 minutos, a IA cria seu treino 100% personalizado: objetivo, nível, rotina, tempo disponível e equipamentos.
            </p>
          </div>

          <ul className="space-y-3 md:space-y-4 pt-2 text-left">
            {[
              'Ajusta séries, cargas e repetições automaticamente',
              'Evolui de acordo com seu desempenho',
              'Funciona em casa ou na academia',
              'Zero complicação — você só treina'
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 md:gap-4">
                <span className="flex-shrink-0 inline-flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                  <svg className="h-4 w-4 md:h-5 md:w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm md:text-base lg:text-lg text-light leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 justify-center lg:justify-start">
              <button
                onClick={onStartOnboarding}
                className="btn-primary text-base md:text-lg px-8 md:px-12 py-4 md:py-5 font-bold shadow-xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto"
              >
                Criar meu treino personalizado agora
              </button>
              <button
                type="button"
                onClick={onScrollToHowItWorks}
                className="text-sm md:text-base font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors px-2 py-1"
              >
                Ver como funciona
              </button>
            </div>
            <p className="text-xs md:text-sm text-light-muted text-center lg:text-left">
              Leva menos de 2 minutos • Resultados desde o primeiro treino
            </p>
          </div>
        </div>

        {/* Mockup do app */}
        <div className="relative mt-8 lg:mt-0 flex justify-center lg:justify-end">
          <div className="relative mx-auto lg:mx-0 max-w-sm w-full rounded-3xl border border-grey/30 bg-dark-lighter shadow-2xl shadow-black/50 overflow-hidden">
            <div className="bg-dark px-4 md:px-5 py-3 flex items-center justify-between border-b border-grey/20">
              <span className="text-xs font-medium text-light">Treino de hoje</span>
              <span className="text-[10px] text-light-muted">AthletIA · IA Ativa</span>
            </div>
            <div className="p-4 md:p-5 space-y-3 md:space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary mb-1.5">Treino A · Peito e Costas</p>
                <p className="text-base md:text-lg font-semibold text-light">Força e definição na parte superior</p>
                <p className="text-xs text-light-muted mt-1">Tempo estimado: 48 min · Nível: Intermediário</p>
              </div>
              <div className="space-y-2 md:space-y-3">
                {[
                  'Aquecimento em esteira – 8 min',
                  'Supino reto com barra – 4 x 8–10',
                  'Puxada na frente – 4 x 10–12',
                  'Crucifixo com halteres – 3 x 12',
                  'Remada baixa – 3 x 10–12',
                  'Alongamento guiado – 6 min'
                ].map((linha) => (
                  <div
                    key={linha}
                    className="flex items-center justify-between gap-3 rounded-xl bg-dark px-3 py-2.5 border border-grey/20"
                  >
                    <span className="text-[11px] md:text-xs text-light-muted truncate flex-1">{linha}</span>
                    <span className="h-5 w-5 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-[10px] text-primary flex-shrink-0">
                      ✓
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-primary/10 border border-primary/20 px-3 py-3 text-[11px] md:text-xs">
                <span className="font-semibold text-primary">IA ativa: </span>
                <span className="text-light-muted">
                  Séries, cargas e volume serão ajustados automaticamente de acordo com seu desempenho de hoje.
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

