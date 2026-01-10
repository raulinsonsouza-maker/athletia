import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface Testimonial {
  name: string
  text: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Miguel S.',
    text: 'Os treinos evoluem comigo. Nunca fiquei tanto tempo consistente.'
  },
  {
    name: 'Ana M.',
    text: 'Finalmente sei exatamente o que treinar e quando evoluir.'
  },
  {
    name: 'João R.',
    text: 'Simples, inteligente e funciona de verdade.'
  }
]

interface TestimonialsSectionProps {
  onStartOnboarding?: () => void
}

export default function TestimonialsSection({ onStartOnboarding }: TestimonialsSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/30 to-dark relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-dark-lighter/50 backdrop-blur-xl rounded-xl p-6 border border-grey/20 hover:border-primary/50 transition-all duration-300 text-center"
              >
                <p className="text-base md:text-lg text-light leading-relaxed mb-4 italic">
                  "{testimonial.text}"
                </p>
                <p className="text-sm font-semibold text-primary">
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

