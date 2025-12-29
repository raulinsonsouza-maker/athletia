/**
 * Componente para exibir preview do app mobile
 * Mostra a interface real do sistema para gerar desejo
 */

interface AppPreviewProps {
  className?: string
  imagemApp?: string // URL da imagem real do app (opcional)
  optimizeImage?: boolean // Permite desativar otimizações caso não existam variações da imagem
}

export default function AppPreview({ className = '', imagemApp, optimizeImage = true }: AppPreviewProps) {
  const shouldOptimize = Boolean(imagemApp && optimizeImage)

  // Se uma imagem real for fornecida e puder ser otimizada, usar ela
  if (shouldOptimize && imagemApp) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative mx-auto max-w-sm">
          {/* Efeito de brilho/glow ao redor */}
          <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-2xl -z-10 scale-110" />
          
          {/* Frame do telefone com imagem real - borda melhorada - Altura fixa para evitar CLS */}
          <div className="relative rounded-[2.5rem] shadow-2xl overflow-visible w-full max-w-[400px] min-h-[600px] md:min-h-[800px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary/5 blur-xl -z-10"></div>
            <picture className="block w-full">
              {/* AVIF - formato mais moderno e eficiente (suporte limitado, mas melhor compressão) */}
              {/* Removida versão 800x1600 para reduzir tamanho - usar apenas 400x800 e 665x1310 */}
              <source 
                srcSet={`
                  ${imagemApp?.replace(/\.(png|webp)$/i, '-400x800.avif')} 400w,
                  ${imagemApp?.replace(/\.(png|webp)$/i, '-665x1310.avif')} 665w
                `}
                type="image/avif"
                sizes="(max-width: 768px) 400px, 665px"
              />
              {/* WebP - fallback para navegadores modernos */}
              <source 
                srcSet={`
                  ${imagemApp?.replace(/\.(png|webp)$/i, '-400x800.webp')} 400w,
                  ${imagemApp?.replace(/\.(png|webp)$/i, '-665x1310.webp')} 665w
                `}
                type="image/webp"
                sizes="(max-width: 768px) 400px, 665px"
              />
              {/* Fallback WebP - versão otimizada se disponível */}
              <source srcSet={imagemApp?.replace(/\.png$/i, '.webp')} type="image/webp" />
              {/* Fallback final - usar versão menor (400x800) como src padrão para melhor LCP */}
              {/* O navegador escolherá a versão correta baseado no srcset e sizes */}
              <img 
                src={imagemApp?.replace(/\.(png|webp)$/i, '-400x800.webp') || imagemApp?.replace(/\.png$/i, '.webp') || imagemApp} 
                srcSet={`
                  ${imagemApp?.replace(/\.(png|webp)$/i, '-400x800.webp')} 400w,
                  ${imagemApp?.replace(/\.(png|webp)$/i, '-665x1310.webp')} 665w
                `}
                alt="Interface do aplicativo AthletIA mostrando treinos, progresso e funcionalidades"
                className="w-full h-auto object-contain rounded-[2.5rem] block max-w-[400px] mx-auto"
                loading="eager"
                fetchPriority="high"
                width="665"
                height="1310"
                sizes="(max-width: 768px) 400px, 665px"
                style={{ minHeight: '600px' }}
                onError={(e) => {
                  // Se WebP falhar, tentar PNG original
                  const target = e.target as HTMLImageElement
                  if (!target.src.endsWith('.png')) {
                    target.src = imagemApp || ''
                  }
                }}
              />
            </picture>
          </div>
          
          {/* Efeitos de brilho decorativos */}
          <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-primary/10 blur-3xl -z-10" />
          <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-primary/5 blur-3xl -z-10" />
        </div>
      </div>
    )
  }

  // Imagem real sem otimizações (quando não há versões responsivas disponíveis)
  if (imagemApp) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative mx-auto max-w-sm">
          <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-2xl -z-10 scale-110" />
          <div className="relative rounded-[2.5rem] shadow-2xl overflow-visible w-full max-w-[400px] min-h-[600px] md:min-h-[800px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary/5 blur-xl -z-10"></div>
            <img
              src={imagemApp}
              alt="Interface do aplicativo AthletIA mostrando treinos, progresso e funcionalidades"
              className="w-full h-auto object-contain rounded-[2.5rem] block max-w-[400px] mx-auto"
              loading="eager"
              fetchPriority="high"
              width="665"
              height="1182"
              style={{ minHeight: '600px' }}
            />
          </div>
          <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-primary/10 blur-3xl -z-10" />
          <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-primary/5 blur-3xl -z-10" />
        </div>
      </div>
    )
  }

  // Mockup fiel à interface real do sistema
  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto max-w-sm">
        {/* Efeito de brilho/glow ao redor */}
        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-2xl -z-10 scale-110" />
        
        {/* Frame do telefone */}
        <div className="relative rounded-[3rem] border-8 border-dark-lighter bg-dark-lighter shadow-2xl overflow-hidden">
          {/* Notch do iPhone */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-dark-lighter rounded-b-2xl z-20" />
          
          {/* Conteúdo do app - Interface Real */}
          <div className="bg-[#0a0a0a] min-h-[700px] relative overflow-hidden">
            {/* Header do app */}
            <header className="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-1.5">
                    <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
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

            {/* Conteúdo principal - Scrollável */}
            <div className="px-4 py-4 space-y-4 overflow-y-auto pb-20">
              {/* Card de treino em destaque - EXATAMENTE COMO NA IMAGEM */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
                <div className="p-4">
                  {/* Tags no topo */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">CARDIO</span>
                    <span className="text-xs text-white/40">•</span>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">OMBROS</span>
                  </div>
                  
                  {/* Título do treino */}
                  <h3 className="text-xl font-bold text-white mb-2">Treino A - Peito</h3>
                  
                  {/* Informações */}
                  <div className="flex items-center gap-2 text-sm text-white/80 mb-4">
                    <span>52 min</span>
                    <span className="text-white/40">•</span>
                    <span>6 exercícios</span>
                  </div>
                  
                  {/* Botão de iniciar */}
                  <button className="w-full bg-primary text-dark font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Iniciar</span>
                  </button>
                </div>
              </div>

              {/* Cards rápidos - EXATAMENTE COMO NA IMAGEM */}
              <div className="grid grid-cols-2 gap-3">
                {/* Treino Rápido */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-primary/30 transition">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">Treino Rápido</div>
                  <div className="text-xs text-white/60 leading-relaxed">Personalizado em segundos</div>
                </div>
                
                {/* Meu Progresso */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-primary/30 transition">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">Meu Progresso</div>
                  <div className="text-xs text-white/60 leading-relaxed">Acompanhe sua evolução</div>
                </div>
              </div>

              {/* Seção de Próximos Treinos - EXATAMENTE COMO NA IMAGEM */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Próximos Treinos</h4>
                  <span className="text-xs text-white/60">5 programados</span>
                </div>
                
                <div className="space-y-3">
                  {/* Treino B */}
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10 hover:border-primary/20 transition">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-primary uppercase">CARDIO</span>
                      <span className="text-[10px] text-white/40">•</span>
                      <span className="text-[10px] font-bold text-primary uppercase">GLÚTEOS</span>
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">Treino B - Costas</div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <span>52 min</span>
                      <span className="text-white/40">•</span>
                      <span>6 exercícios</span>
                      <span className="text-white/40">•</span>
                      <span className="text-primary font-medium">Amanhã</span>
                    </div>
                  </div>

                  {/* Treino C */}
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10 hover:border-primary/20 transition">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-primary uppercase">CARDIO</span>
                      <span className="text-[10px] text-white/40">•</span>
                      <span className="text-[10px] font-bold text-primary uppercase">ABDÔMEN</span>
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">Treino C - Quadríceps</div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <span>52 min</span>
                      <span className="text-white/40">•</span>
                      <span>6 exercícios</span>
                      <span className="text-white/40">•</span>
                      <span className="text-primary font-medium">qua., 10 de dez.</span>
                    </div>
                  </div>

                  {/* Treino D */}
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10 hover:border-primary/20 transition">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-primary uppercase">CARDIO</span>
                      <span className="text-[10px] text-white/40">•</span>
                      <span className="text-[10px] font-bold text-primary uppercase">OMBROS</span>
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">Treino D - Posteriores</div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <span>52 min</span>
                      <span className="text-white/40">•</span>
                      <span>6 exercícios</span>
                      <span className="text-white/40">•</span>
                      <span className="text-primary font-medium">qui., 11 de dez.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom navigation - EXATAMENTE COMO NA IMAGEM */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-2.5">
              <div className="flex items-center justify-around">
                {[
                  { 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    ), 
                    label: 'Meu Plano' 
                  },
                  { 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    ), 
                    label: 'Treinos', 
                    active: true 
                  },
                  { 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ), 
                    label: 'Progresso' 
                  },
                  { 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ), 
                    label: 'Histórico' 
                  },
                  { 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ), 
                    label: 'Perfil' 
                  }
                ].map((item, index) => (
                  <button
                    key={index}
                    className="flex flex-col items-center gap-1 min-w-0 flex-1"
                  >
                    <div className={item.active ? 'text-primary' : 'text-white/60'}>
                      {item.icon}
                    </div>
                    <div className={`text-[10px] leading-tight ${item.active ? 'text-primary font-semibold' : 'text-white/60'}`}>
                      {item.label}
                    </div>
                  </button>
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
