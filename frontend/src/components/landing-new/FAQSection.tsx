import { useState } from 'react'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'Como funciona o AthletIA?',
    answer: 'O AthletIA usa inteligência artificial para criar treinos personalizados baseados no seu perfil, objetivos e desempenho. Você responde algumas perguntas rápidas e a IA gera um programa completo que evolui automaticamente a cada treino.'
  },
  {
    question: 'Preciso ter experiência com treino?',
    answer: 'Não! O AthletIA é perfeito tanto para iniciantes quanto para pessoas mais experientes. O sistema adapta os treinos ao seu nível, começando mais leve e aumentando a intensidade conforme você evolui.'
  },
  {
    question: 'Os treinos funcionam em casa?',
    answer: 'Sim! O AthletIA cria treinos personalizados para o ambiente que você tem disponível. Se você treina em casa, a IA usa apenas exercícios que podem ser feitos com o que você tem ou apenas com peso corporal.'
  },
  {
    question: 'Como o app acompanha meu progresso?',
    answer: 'O AthletIA registra cada treino que você completa, incluindo pesos, repetições e séries. Com essas informações, a IA ajusta automaticamente seus próximos treinos para manter você sempre desafiado e em constante evolução.'
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento, sem taxas ou burocracias. Seus dados ficam salvos caso queira voltar depois.'
  },
  {
    question: 'Quanto tempo leva para ver resultados?',
    answer: 'A maioria dos usuários começa a ver resultados visíveis em 4-6 semanas de uso consistente. O importante é seguir os treinos gerados pela IA e manter a consistência.'
  }
]

export default function FAQSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-dark-lighter/50 via-dark to-dark relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4">
            Perguntas{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Frequentes
            </span>
          </h2>
          <p className="text-xl text-light-muted max-w-2xl mx-auto">
            Tire suas dúvidas sobre o AthletIA
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-dark-lighter/50 backdrop-blur-xl rounded-2xl border border-grey/20 hover:border-primary/50 transition-all duration-300 overflow-hidden ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 md:px-8 py-6 text-left flex items-center justify-between gap-4 group"
              >
                <h3 className="text-lg md:text-xl font-display font-bold text-light group-hover:text-primary transition-colors pr-8">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  <svg
                    className={`w-6 h-6 text-primary transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 md:px-8 pb-6">
                  <div className="pt-4 border-t border-grey/20">
                    <p className="text-lg text-light-muted leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

