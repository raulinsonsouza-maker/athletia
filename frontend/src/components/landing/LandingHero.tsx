import AppPreview from './AppPreview'

interface LandingHeroProps {
  onStartOnboarding: () => void
}

export default function LandingHero({ onStartOnboarding }: LandingHeroProps) {
  return (
    <section aria-label="Hero - Treino Personalizado Inteligente" className="min-h-[600px] md:min-h-[700px] flex items-center px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center w-full">
        {/* Texto principal - OTIMIZADO PARA CONVERSÃO */}
        <div className="space-y-6 md:space-y-8 text-center lg:text-left min-h-[400px] md:min-h-[500px] flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-[1.1] tracking-tight text-light" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            Treinos criados automaticamente para evoluir seu corpo toda semana.
          </h1>

          <p className="text-xl md:text-2xl text-light-muted leading-relaxed" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            A IA monta seu treino completo em 2 minutos e ajusta tudo a cada sessão. Você só treina.
          </p>

          {/* CTA PRINCIPAL - DESTAQUE MÁXIMO */}
          <div className="space-y-4 pt-4">
            <button
              onClick={onStartOnboarding}
              className="btn-primary text-lg md:text-xl px-10 md:px-16 py-5 md:py-6 font-bold shadow-2xl shadow-primary/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 w-full sm:w-auto text-center"
              aria-label="Criar meu treino personalizado agora"
            >
              Criar meu treino agora
            </button>
            {/* Microprovas */}
            <p className="text-sm md:text-base text-light-muted font-medium">
              Resultados rápidos • Funciona para iniciantes e avançados • Evolução automática
            </p>
          </div>
        </div>

        {/* Preview do app com imagem real */}
        <div className="relative mt-8 lg:mt-0 flex justify-center lg:justify-end overflow-visible">
          <AppPreview
            className="transform hover:scale-105 transition-transform duration-500"
            imagemApp="/images/app-preview/Editadas/Hero_nova.png"
            optimizeImage={true}
          />
        </div>
      </div>
    </section>
  )
}

