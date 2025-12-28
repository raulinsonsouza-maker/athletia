import { useState, useEffect } from 'react'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface Testimonial {
  name: string
  text: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    name: 'Miguel S.',
    text: 'Aplicativo incrível! Os treinos personalizados me mantêm motivado e estou vendo um progresso real. A IA realmente entende meu corpo e adapta os treinos perfeitamente.',
    rating: 5
  },
  {
    name: 'Ana M.',
    text: 'Super fácil de usar e repleto de recursos incríveis. Acompanhar meu progresso nunca foi tão simples! Os gráficos são super detalhados e me ajudam a ver minha evolução.',
    rating: 5
  },
  {
    name: 'João R.',
    text: 'Em casa ou na academia, o AthletIA adapta seu plano ao seu ambiente. Sem equipamentos? Sem problemas. Finalmente encontrei um app que realmente funciona para mim.',
    rating: 5
  },
  {
    name: 'Letícia F.',
    text: 'Os exercícios detalhados com ilustrações são perfeitos! Nunca mais treinei errado. O sistema de progressão automática é sensacional, sempre me desafia na medida certa.',
    rating: 5
  },
  {
    name: 'Carlos P.',
    text: 'Perfeito para quem quer resultados sem complicação. A interface é limpa, o app é rápido e os treinos são realmente personalizados. Recomendo demais!',
    rating: 5
  }
]

export default function TestimonialsSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!isVisible) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/30 to-dark relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4">
            O que nossos{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              usuários dizem
            </span>
          </h2>
          <p className="text-xl text-light-muted max-w-3xl mx-auto">
            Milhares de pessoas já transformaram seus corpos com o AthletIA
          </p>
        </div>

        {/* Carrossel de depoimentos */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="min-w-full px-4"
                >
                  <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-grey/20 hover:border-primary/50 transition-all duration-300">
                    <div className="flex gap-1 mb-6 justify-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-6 h-6 text-primary"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xl md:text-2xl text-light leading-relaxed text-center mb-8 max-w-4xl mx-auto">
                      "{testimonial.text}"
                    </p>
                    <p className="text-lg font-semibold text-primary text-center">
                      {testimonial.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-grey/50 hover:bg-primary/50'
                }`}
                aria-label={`Ir para depoimento ${index + 1}`}
              />
            ))}
          </div>

          {/* Botões de navegação */}
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 bg-dark-lighter/80 backdrop-blur-xl rounded-full p-3 hover:bg-primary/20 border border-primary/30 text-primary hover:scale-110 transition-all duration-300"
            aria-label="Depoimento anterior"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 bg-dark-lighter/80 backdrop-blur-xl rounded-full p-3 hover:bg-primary/20 border border-primary/30 text-primary hover:scale-110 transition-all duration-300"
            aria-label="Próximo depoimento"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

