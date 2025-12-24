interface HeroSectionProps {
  onCtaClick: () => void
}

export default function HeroSection({ onCtaClick }: HeroSectionProps) {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-dark via-dark-lighter to-dark text-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* H1 Principal - SEO */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
          Treinos inteligentes criados para o seu corpo, seus objetivos e sua rotina
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
          O Athletia cria treinos personalizados com base em quem você é hoje e onde quer chegar.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onCtaClick}
            className="px-8 py-4 bg-primary text-dark font-bold text-lg rounded-full hover:bg-primary/90 transition shadow-glow hover:shadow-glow-lg min-w-[200px]"
          >
            Começar agora
          </button>
          <button
            onClick={onCtaClick}
            className="px-8 py-4 border-2 border-white/20 text-white font-semibold text-lg rounded-full hover:bg-white/10 transition min-w-[200px]"
          >
            Montar meu plano
          </button>
        </div>

        {/* Texto de apoio */}
        <p className="mt-8 text-white/60 text-sm">
          Teste gratuito de 24 horas • Sem cartão de crédito
        </p>
      </div>
    </section>
  )
}
