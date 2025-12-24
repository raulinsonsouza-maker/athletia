interface TrialInfoSectionProps {
  onScrollToForm: () => void
}

export default function TrialInfoSection({ onScrollToForm }: TrialInfoSectionProps) {
  return (
    <section className="py-12 md:py-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Card Principal Destacado */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/50 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl shadow-primary/20">
          <div className="text-center mb-8">
            {/* Ícone de Relógio */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/30 mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-light mb-4">
              24 horas de acesso completo e gratuito
            </h2>
            <p className="text-lg md:text-xl text-primary font-semibold mb-6">
              Teste todos os recursos sem compromisso
            </p>
            <p className="text-base md:text-lg text-light-muted leading-relaxed max-w-3xl mx-auto">
              Ao finalizar seu cadastro, você terá <strong className="text-primary">24 horas</strong> para explorar toda a plataforma sem nenhum custo. Após esse período, escolha um dos planos abaixo para continuar sua jornada.
            </p>
          </div>

          {/* O que você terá acesso durante o trial */}
          <div className="mb-10">
            <h3 className="text-xl md:text-2xl font-bold text-light mb-6 text-center">
              O que você terá acesso durante o trial
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-dark/50 border border-grey/20">
                <svg className="w-6 h-6 text-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-semibold text-light">Treino personalizado completo</p>
                  <p className="text-sm text-light-muted">Baseado no seu perfil único</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-dark/50 border border-grey/20">
                <svg className="w-6 h-6 text-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-semibold text-light">Ajustes automáticos baseados em RPE</p>
                  <p className="text-sm text-light-muted">IA adapta conforme seu progresso</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-dark/50 border border-grey/20">
                <svg className="w-6 h-6 text-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-semibold text-light">Histórico e progresso</p>
                  <p className="text-sm text-light-muted">Acompanhe sua evolução completa</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-dark/50 border border-grey/20">
                <svg className="w-6 h-6 text-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-semibold text-light">Todos os recursos da plataforma</p>
                  <p className="text-sm text-light-muted">Acesso completo sem limitações</p>
                </div>
              </div>
            </div>
          </div>

          {/* O que acontece após 24h */}
          <div className="mb-10">
            <h3 className="text-xl md:text-2xl font-bold text-light mb-6 text-center">
              O que acontece após 24 horas?
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-dark-lighter border-2 border-grey/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-light">Se não assinar</h4>
                </div>
                <p className="text-light-muted leading-relaxed">
                  Seu acesso será bloqueado, mas <strong className="text-light">todos os seus dados serão preservados</strong>. Você pode assinar um plano a qualquer momento para retomar de onde parou.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-dark-lighter border-2 border-primary/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-light">Se assinar</h4>
                </div>
                <p className="text-light-muted leading-relaxed">
                  Você terá <strong className="text-primary">acesso contínuo</strong> a todos os recursos + <strong className="text-primary">treinos para 30 dias gerados automaticamente</strong> baseados no seu perfil.
                </p>
              </div>
            </div>
          </div>

          {/* Grid de Planos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-10">
            {/* Plano Mensal */}
            <div className="bg-dark-lighter border-2 border-grey/30 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300">
              <h3 className="text-xl font-bold text-light mb-3">Mensal</h3>
              <div className="mb-4">
                <p className="text-3xl font-extrabold text-primary mb-1">R$ 19,90</p>
                <p className="text-sm text-light-muted">por mês</p>
              </div>
            </div>

            {/* Plano Trimestral - Mais Popular */}
            <div className="bg-dark-lighter border-2 border-primary/60 rounded-2xl p-6 hover:border-primary hover:shadow-xl shadow-primary/20 transition-all duration-300 relative md:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-gradient-to-r from-primary to-primary/80 text-dark text-xs font-bold px-4 py-1.5 rounded-full shadow-lg animate-pulse flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  MAIS POPULAR
                </span>
              </div>
              <h3 className="text-xl font-bold text-light mb-3 mt-2">Trimestral</h3>
              <div className="mb-4">
                <p className="text-3xl font-extrabold text-primary mb-1">R$ 49,90</p>
                <p className="text-sm text-light-muted mb-2">a cada 3 meses</p>
                <p className="text-sm font-semibold text-primary">Economize R$ 9,80</p>
              </div>
            </div>

            {/* Plano Semestral */}
            <div className="bg-dark-lighter border-2 border-grey/30 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300">
              <h3 className="text-xl font-bold text-light mb-3">Semestral</h3>
              <div className="mb-4">
                <p className="text-3xl font-extrabold text-primary mb-1">R$ 89,90</p>
                <p className="text-sm text-light-muted mb-2">a cada 6 meses</p>
                <p className="text-sm font-semibold text-primary">Economize R$ 29,50</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <button
              onClick={onScrollToForm}
              className="btn-primary text-lg md:text-xl px-12 md:px-20 py-5 md:py-6 font-bold shadow-2xl shadow-primary/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
            >
              Criar minha conta e começar agora
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
