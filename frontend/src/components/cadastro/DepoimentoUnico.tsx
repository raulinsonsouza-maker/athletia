export default function DepoimentoUnico() {
  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-dark-lighter/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-6">
            Resultados reais
          </h2>
        </div>

        <div className="rounded-3xl border border-grey/20 bg-dark-lighter p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-xl">
          <div className="w-full md:w-1/2">
            <div className="relative rounded-2xl overflow-hidden bg-dark">
              <img
                src="/images/onboarding/Miguel.webp"
                alt="Miguel perdeu 12 kg em 4 meses com treino personalizado inteligente AthletIA - Resultado real de transformação física"
                className="w-full h-auto object-cover"
                loading="lazy"
                width="400"
                height="600"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
                <p className="text-sm md:text-base font-semibold text-white">Miguel perdeu 12 kg em 4 meses.</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 space-y-4 text-center md:text-left">
            <p className="text-xs md:text-sm font-semibold text-primary uppercase tracking-wide">
              Caso real
            </p>
            <blockquote className="text-lg md:text-xl lg:text-2xl font-semibold text-light leading-relaxed">
              "Eu nunca soube montar treinos. Com o AthletIA, finalmente consegui seguir um plano que faz sentido. Evoluí toda semana."
            </blockquote>
            <div className="pt-2">
              <p className="text-base font-semibold text-light">Miguel</p>
              <p className="text-sm text-light-muted">32 anos – Usuário AthletIA</p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-sm text-light-muted">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Perdeu 12kg em 4 meses</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

