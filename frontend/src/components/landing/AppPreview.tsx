/**
 * Componente para exibir preview do app mobile
 * Gera desejo mostrando a interface real do sistema
 */

interface AppPreviewProps {
  className?: string
  imagemApp?: string // URL da imagem real do app (opcional)
}

export default function AppPreview({ className = '', imagemApp }: AppPreviewProps) {
  // Se uma imagem real for fornecida, usar ela
  if (imagemApp) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative mx-auto max-w-sm">
          {/* Efeito de brilho/glow ao redor */}
          <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-2xl -z-10 scale-110" />
          
          {/* Frame do telefone com imagem real */}
          <div className="relative rounded-[3rem] border-8 border-dark-lighter bg-dark-lighter shadow-2xl overflow-hidden">
            <img 
              src={imagemApp} 
              alt="Interface do aplicativo AthletIA mostrando treinos, progresso e funcionalidades"
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </div>
          
          {/* Efeitos de brilho decorativos */}
          <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-primary/10 blur-3xl -z-10" />
          <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-primary/5 blur-3xl -z-10" />
        </div>
      </div>
    )
  }

  // Mockup interativo (fallback)
  return (
    <div className={`relative ${className}`}>
      {/* Container do telefone com efeito 3D */}
      <div className="relative mx-auto max-w-sm">
        {/* Efeito de brilho/glow ao redor */}
        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-2xl -z-10 scale-110" />
        
        {/* Frame do telefone */}
        <div className="relative rounded-[3rem] border-8 border-dark-lighter bg-dark-lighter shadow-2xl overflow-hidden">
          {/* Notch do iPhone */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-dark-lighter rounded-b-2xl z-20" />
          
          {/* Conteúdo do app */}
          <div className="bg-[#0a0a0a] min-h-[600px] relative overflow-hidden">
            {/* Header do app */}
            <header className="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">ATHLETIA</div>
                    <div className="text-[10px] text-white/60">Treinos</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-xs text-white/60">Sa</div>
                </div>
              </div>
            </header>

            {/* Conteúdo principal */}
            <div className="px-4 py-4 space-y-4 overflow-y-auto max-h-[500px]">
              {/* Card de treino em destaque */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                <div className="relative p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">CARDIO</span>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">OMBROS</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Treino A - Peito</h3>
                  <div className="flex items-center gap-4 text-sm text-white/80 mb-4">
                    <span>52 min</span>
                    <span>•</span>
                    <span>6 exercícios</span>
                  </div>
                  <button className="w-full bg-primary text-dark font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Iniciar
                  </button>
                </div>
              </div>

              {/* Cards rápidos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">Treino Rápido</div>
                  <div className="text-xs text-white/60">Personalizado em segundos</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">Meu Progresso</div>
                  <div className="text-xs text-white/60">Acompanhe sua evolução</div>
                </div>
              </div>

              {/* Lista de próximos treinos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Próximos Treinos</h4>
                  <span className="text-xs text-white/60">5 programados</span>
                </div>
                <div className="space-y-3">
                  {[
                    { nome: 'Treino B - Costas', tempo: '52 min', exercicios: 6, data: 'Amanhã' },
                    { nome: 'Treino C - Quadríceps', tempo: '52 min', exercicios: 6, data: 'qua., 10 de dez.' },
                    { nome: 'Treino D - Posteriores', tempo: '52 min', exercicios: 6, data: 'qui., 11 de dez.' }
                  ].map((treino, index) => (
                    <div key={index} className="bg-white/5 rounded-2xl p-3 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-primary uppercase">CARDIO</span>
                        <span className="text-[10px] font-bold text-primary uppercase">GLÚTEOS</span>
                      </div>
                      <div className="text-sm font-semibold text-white mb-1">{treino.nome}</div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span>{treino.tempo}</span>
                        <span>•</span>
                        <span>{treino.exercicios} exercícios</span>
                        <span>•</span>
                        <span className="text-primary">{treino.data}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom navigation */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-2">
              <div className="flex items-center justify-around">
                {[
                  { icon: '🏠', label: 'Meu Plano' },
                  { icon: '📋', label: 'Treinos', active: true },
                  { icon: '📊', label: 'Progresso' },
                  { icon: '🕐', label: 'Histórico' },
                  { icon: '👤', label: 'Perfil' }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div className={`text-lg ${item.active ? 'text-primary' : 'text-white/60'}`}>
                      {item.icon}
                    </div>
                    <div className={`text-[10px] ${item.active ? 'text-primary font-semibold' : 'text-white/60'}`}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Efeitos de brilho decorativos */}
        <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-primary/10 blur-3xl -z-10" />
        <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-primary/5 blur-3xl -z-10" />
      </div>
    </div>
  )
}

