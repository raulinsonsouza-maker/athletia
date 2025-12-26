import { OnboardingStep } from '../../types/onboarding.types'

interface OnboardingHeaderProps {
  step?: OnboardingStep
}

// Total de passos (incluindo 0)
const TOTAL_STEPS = 15

// Tempo médio por passo em minutos (baseado em experiência típica)
const TEMPO_POR_PASSO = 0.15 // ~9 segundos por passo em média

export default function OnboardingHeader({ step = 0 }: OnboardingHeaderProps) {
  // Calcular tempo estimado restante
  const calcularTempoRestante = () => {
    if (step === 0 || step >= TOTAL_STEPS) return null
    
    const passosRestantes = TOTAL_STEPS - step
    const tempoRestante = Math.ceil(passosRestantes * TEMPO_POR_PASSO)
    
    if (tempoRestante <= 1) return 'menos de 1 minuto'
    if (tempoRestante === 1) return '1 minuto'
    return `${tempoRestante} minutos`
  }

  const tempoRestante = calcularTempoRestante()
  const progresso = step > 0 ? (step / TOTAL_STEPS) * 100 : 0

  return (
    <div className="w-full py-4 md:py-5 px-4 md:px-6 border-b border-grey/30 bg-dark/95 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 md:gap-3">
            <img
              src="/favicon.svg"
              alt="Logo AthletIA - Treino Personalizado Inteligente com IA"
              className="w-8 h-8 md:w-10 md:h-10 rounded-2xl shadow-lg"
              loading="eager"
              width="40"
              height="40"
            />
            <div className="text-lg md:text-xl font-display font-bold text-primary">AthletIA</div>
          </div>
          
          {step > 0 && tempoRestante && (
            <div className="text-right">
              <div className="text-xs md:text-sm text-light-muted">
                Faltam apenas <span className="font-semibold text-primary">{tempoRestante}</span>
              </div>
              <div className="w-32 md:w-48 h-1.5 bg-grey/20 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

