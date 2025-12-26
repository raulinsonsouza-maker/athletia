import { useState } from 'react'

interface FAQItem {
  pergunta: string
  resposta: string
}

export default function FAQCadastro() {
  const [aberto, setAberto] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      pergunta: 'Preciso de cartão de crédito para o trial?',
      resposta: 'Não. O trial de 3 dias é gratuito e não requer cartão de crédito. Você testa tudo sem compromisso.'
    },
    {
      pergunta: 'O que acontece se eu não assinar após 3 dias?',
      resposta: 'Seu acesso será bloqueado, mas seus dados ficam preservados. Você pode assinar depois e retomar de onde parou.'
    },
    {
      pergunta: 'Posso cancelar a qualquer momento?',
      resposta: 'Sim. Você pode cancelar quando quiser, sem burocracias. Oferecemos garantia de 7 dias ou seu dinheiro de volta.'
    },
    {
      pergunta: 'Meus dados são preservados?',
      resposta: 'Sim. Todos os seus dados ficam salvos mesmo após o trial expirar. Seu perfil, histórico e progresso podem ser retomados a qualquer momento.'
    },
    {
      pergunta: 'O que acontece quando eu assinar?',
      resposta: 'Você terá acesso contínuo a todos os recursos. O sistema gera automaticamente treinos personalizados para os próximos 30 dias baseados no seu perfil.'
    },
    {
      pergunta: 'Posso mudar de plano depois?',
      resposta: 'Sim. Você pode alterar seu plano a qualquer momento. Planos com maior duração oferecem mais economia.'
    }
  ]

  const toggleFAQ = (index: number) => {
    setAberto(aberto === index ? null : index)
  }

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-dark-lighter/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-light-muted">
            Dúvidas sobre o processo
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl bg-dark border-2 border-grey/30 overflow-hidden transition-all duration-300 hover:border-primary/50"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl"
              >
                <span className="text-lg font-semibold text-light flex-1">
                  {faq.pergunta}
                </span>
                <svg
                  className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-300 ${
                    aberto === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  aberto === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6">
                  <p className="text-base text-light-muted leading-relaxed">
                    {faq.resposta}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
