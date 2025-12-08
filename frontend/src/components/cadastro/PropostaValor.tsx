interface PropostaValorProps {
  onScrollToForm: () => void
}

const BULLETS = [
  'Ajustes automáticos conforme seu ritmo',
  'Treinos que evoluem junto com você',
  'Progressão inteligente sem platôs',
  'Zero achismos',
  'Tudo pronto para você apenas treinar'
] as const

const PROVA_SOCIAL = {
  satisfacao: 95,
  usuarios: 10000,
  avaliacao: 4.9
} as const

export default function PropostaValor({ onScrollToForm }: PropostaValorProps) {
  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-6">
            O AthletIA faz o que nenhum treino genérico faz
          </h2>
        </div>

        {/* Bullets */}
        <div className="space-y-4 mb-12">
          {BULLETS.map((bullet, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg bg-dark-lighter border border-grey/20 hover:border-primary/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mt-0.5">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base md:text-lg text-light leading-relaxed flex-1">{bullet}</p>
            </div>
          ))}
        </div>

        {/* Prova Social */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="text-center p-6 rounded-xl bg-dark-lighter border border-grey/20">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {PROVA_SOCIAL.satisfacao}%
            </div>
            <p className="text-sm text-light-muted">de satisfação</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-dark-lighter border border-grey/20">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {PROVA_SOCIAL.usuarios.toLocaleString('pt-BR')}+
            </div>
            <p className="text-sm text-light-muted">usuários ativos</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-dark-lighter border border-grey/20">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {PROVA_SOCIAL.avaliacao}
            </div>
            <p className="text-sm text-light-muted">de avaliação média</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onScrollToForm}
            className="btn-primary text-base md:text-lg px-10 md:px-14 py-4 md:py-5 font-bold shadow-xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Criar minha conta agora
          </button>
        </div>
      </div>
    </section>
  )
}

