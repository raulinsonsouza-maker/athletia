export default function ComoFuncionaSection() {
  return (
    <section className="py-20 px-4 bg-dark-lighter">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white text-center mb-12">
          Como funciona
        </h2>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {/* Passo 1 */}
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              1. Responda algumas perguntas
            </h3>
            <p className="text-white/70 leading-relaxed">
              Sobre seu corpo, objetivos e nível atual. É rápido e simples.
            </p>
          </div>

          {/* Passo 2 */}
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              2. Veja seu plano ganhar forma
            </h3>
            <p className="text-white/70 leading-relaxed">
              Em tempo real, com base nas suas respostas. Seu treino personalizado está sendo criado.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              3. Teste o sistema gratuitamente
            </h3>
            <p className="text-white/70 leading-relaxed">
              Acesse o Athletia por 3 dias e avalie se faz sentido para você. Sem compromisso.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
