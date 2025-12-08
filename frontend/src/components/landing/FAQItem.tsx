import { useState } from 'react'

interface FAQItemProps {
  pergunta: string
  resposta: string
}

export default function FAQItem({ pergunta, resposta }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <details
      className="group rounded-2xl bg-dark-lighter border border-grey/20 p-5 md:p-6 hover:border-primary/30 transition-colors"
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base md:text-lg font-semibold text-light pr-8">
            {pergunta}
          </h3>
          <svg
            className={`w-5 h-5 text-primary flex-shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </summary>
      <p className="mt-4 text-sm md:text-base text-light-muted leading-relaxed">
        {resposta}
      </p>
    </details>
  )
}

