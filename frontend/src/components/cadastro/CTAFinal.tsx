interface CTAFinalProps {
  onScrollToForm: () => void
}

export default function CTAFinal({ onScrollToForm }: CTAFinalProps) {
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-primary/10 border-t border-primary/20">
      <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-light leading-tight">
          Pronto para liberar seu treino personalizado?
        </h2>
        
        <div className="pt-2">
          <button
            onClick={onScrollToForm}
            className="btn-primary text-lg md:text-xl px-12 md:px-20 py-5 md:py-6 font-bold shadow-2xl shadow-primary/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
          >
            Criar minha conta e continuar
          </button>
        </div>
      </div>
    </section>
  )
}

