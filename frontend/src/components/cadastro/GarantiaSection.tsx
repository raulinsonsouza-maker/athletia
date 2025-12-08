export default function GarantiaSection() {
  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl bg-primary/10 border-2 border-primary/30 p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-6">
            Garantia incondicional de 7 dias
          </h2>
          
          <div className="space-y-4 text-lg md:text-xl text-light-muted leading-relaxed max-w-2xl mx-auto">
            <p>
              Teste tudo por 7 dias.
            </p>
            <p className="text-light font-semibold">
              Se não gostar, devolvemos 100% do seu dinheiro.
            </p>
            <p>
              Sem perguntas.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

