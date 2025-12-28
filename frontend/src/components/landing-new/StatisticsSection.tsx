import { useEffect, useState } from 'react'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface Stat {
  value: number
  suffix?: string
  label: string
  icon: React.ReactNode
}

const stats: Stat[] = [
  {
    value: 300,
    suffix: '+',
    label: 'Exercícios Validados',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  {
    value: 2,
    suffix: ' min',
    label: 'Para Criar Seu Treino',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    value: 100,
    suffix: '%',
    label: 'Personalizado para Você',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    value: 24,
    suffix: '/7',
    label: 'Suporte e Acompanhamento',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  }
]

function AnimatedNumber({ value, suffix, isVisible }: { value: number; suffix?: string; isVisible: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const increment = value / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value, isVisible])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  return (
    <span>
      {suffix?.includes('/') || suffix?.includes(' min') ? (
        <>
          {Math.floor(displayValue)}
          {suffix}
        </>
      ) : (
        <>
          {formatNumber(displayValue)}
          {suffix}
        </>
      )}
    </span>
  )
}

export default function StatisticsSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 })

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="statistics"
      className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-dark-lighter/50 via-dark to-dark-lighter/50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4">
            O que você{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              vai receber
            </span>
          </h2>
          <p className="text-xl text-light-muted max-w-2xl mx-auto mb-12">
            Um sistema completo de treinos personalizados criado especialmente para você
          </p>
          
          {/* Imagem de progresso com cards */}
          <div className={`mb-16 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex justify-center">
              <img
                src="/images/app-preview/Editadas/Progresso_com_Cards.png"
                alt="Tela de progresso do AthletIA com cards e estatísticas"
                className="w-full max-w-4xl h-auto drop-shadow-2xl rounded-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-dark-lighter/50 backdrop-blur-xl rounded-2xl p-8 border border-grey/20 hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 group ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 group-hover:bg-primary/30 mb-6 mx-auto transition-colors">
                <div className="text-primary">
                  {stat.icon}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary mb-2">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} isVisible={isVisible} />
                </div>
                <p className="text-lg text-light-muted">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

