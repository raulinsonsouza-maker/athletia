import { OnboardingData } from '../../types/onboarding.types'

interface ResumoDinamicoPanelProps {
  onboardingData: OnboardingData
}

export default function ResumoDinamicoPanel({ onboardingData }: ResumoDinamicoPanelProps) {
  // Se não tem dados suficientes, não mostrar
  if (!onboardingData.objetivo && !onboardingData.experiencia && !onboardingData.frequenciaSemanal) {
    return null
  }

  const getMensagens = () => {
    const mensagens: string[] = []

    if (onboardingData.objetivo) {
      const objetivoMap: Record<string, string> = {
        'Emagrecimento': 'foco principal é emagrecimento e definição',
        'Hipertrofia': 'foco principal é ganho de massa muscular',
        'Força': 'foco principal é ganho de força',
        'Condicionamento': 'foco principal é condicionamento físico'
      }
      mensagens.push(`Seu ${objetivoMap[onboardingData.objetivo] || 'foco principal é ' + onboardingData.objetivo.toLowerCase()}`)
    }

    if (onboardingData.experiencia) {
      mensagens.push('O Athletia vai ajustar seus treinos conforme sua evolução')
    }

    if (onboardingData.frequenciaSemanal) {
      mensagens.push(`Seu plano será criado respeitando ${onboardingData.frequenciaSemanal} treinos por semana`)
    }

    return mensagens
  }

  const mensagens = getMensagens()

  if (mensagens.length === 0) {
    return null
  }

  return (
    <div className="bg-dark-lighter border border-primary/30 rounded-2xl p-6 mb-6">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Seu plano está ganhando forma
      </h3>
      <div className="space-y-3">
        {mensagens.map((msg, index) => (
          <div key={index} className="flex items-start gap-3">
            <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-white/80 text-sm leading-relaxed">{msg}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
