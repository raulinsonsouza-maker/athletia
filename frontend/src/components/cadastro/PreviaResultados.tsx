import { OnboardingData } from '../../types/onboarding.types'
import { useOnboardingCalculations } from '../../hooks/useOnboardingCalculations'

interface PreviaResultadosProps {
  onboardingData: OnboardingData | null
}

export default function PreviaResultados({ onboardingData }: PreviaResultadosProps) {
  const { calorias, agua } = useOnboardingCalculations(onboardingData)
  
  if (!onboardingData) return null

  // Função para formatar números de forma amigável
  const formatarNumero = (numero: string | null): string => {
    if (!numero) return ''
    return numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const formatarAgua = (agua: string | null): string => {
    if (!agua) return ''
    return agua.replace('.', ',')
  }

  // Labels amigáveis
  const getObjetivoLabel = () => {
    if (!onboardingData.objetivo) return null
    const labels: Record<string, string> = {
      'Emagrecimento': 'Emagrecimento',
      'Hipertrofia': 'Ganhar Massa Muscular',
      'Força': 'Força'
    }
    return labels[onboardingData.objetivo] || onboardingData.objetivo
  }

  const getExperienciaLabel = () => {
    if (!onboardingData.experiencia) return null
    return onboardingData.experiencia
  }

  const getExperienciaMensagem = () => {
    const experiencia = onboardingData.experiencia
    if (experiencia === 'Iniciante') return 'Plano ajustado para você que está começando'
    if (experiencia === 'Intermediário') return 'Plano ajustado para você que já tem experiência'
    if (experiencia === 'Avançado') return 'Plano ajustado para você que já treina há tempo'
    return 'Plano ajustado especialmente para você'
  }

  // Card 1: Seu Perfil
  const card1 = {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Seu Perfil',
    highlight: getObjetivoLabel() || 'Personalizado',
    description: getExperienciaMensagem(),
    metricas: getExperienciaLabel() ? (
      <div className="mt-3 pt-3 border-t border-grey/20">
        <p className="text-xs text-light-muted">Nível: <span className="text-primary font-semibold">{getExperienciaLabel()}</span></p>
      </div>
    ) : null
  }

  // Card 2: Sua Rotina Ideal
  const card2 = {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    title: 'Sua Rotina Ideal',
    highlight: calorias ? `${formatarNumero(calorias)} calorias por dia` : 'Calculando...',
    description: 'Baseado no seu peso, altura e atividade física',
    metricas: agua ? (
      <div className="mt-3 pt-3 border-t border-grey/20">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p className="text-xs text-light-muted">Água: <span className="text-primary font-semibold">{formatarAgua(agua)} litros por dia</span></p>
        </div>
      </div>
    ) : null
  }

  // Card 3: Seu Treino Personalizado
  const getTreinoInfo = () => {
    const frequencia = onboardingData.frequenciaSemanal
    const tempo = onboardingData.tempoDisponivel
    const local = onboardingData.localTreino
    
    const partes = []
    if (frequencia) partes.push(`${frequencia} treinos por semana`)
    if (tempo) partes.push(`${tempo} minutos por treino`)
    if (local) partes.push(local)
    
    return partes.length > 0 ? partes.join(' • ') : 'Ajustado ao seu perfil'
  }

  const card3 = {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Seu Treino Personalizado',
    highlight: getTreinoInfo(),
    description: 'Ajustado ao seu tempo e espaço disponível',
    metricas: null
  }

  const cards = [card1, card2, card3]

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-dark-lighter/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-4">
            Primeiros insights gerados para você
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="rounded-2xl bg-dark border border-grey/20 p-6 hover:border-primary/30 transition-all animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  {card.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-light mb-2">{card.title}</h3>
                  <p className="text-base md:text-lg font-bold text-primary mb-2">{card.highlight}</p>
                </div>
              </div>
              <p className="text-sm text-light-muted leading-relaxed mb-2">{card.description}</p>
              {card.metricas && card.metricas}
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-light-muted">
            Isso é só a prévia. <span className="text-primary font-semibold">O plano completo é liberado após sua conta.</span>
          </p>
        </div>
      </div>
    </section>
  )
}

