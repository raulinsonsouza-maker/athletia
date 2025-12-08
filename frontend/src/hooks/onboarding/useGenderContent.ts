import { useMemo } from 'react'
import { OnboardingData, GenderContent } from '../../types/onboarding.types'

/**
 * Hook para conteúdo personalizado por gênero com memoização
 */
export function useGenderContent(onboardingData: OnboardingData): GenderContent {
  return useMemo(() => {
    const isMasculino = onboardingData.sexo === 'Masculino'
    
    return {
      // Tipo de corpo personalizado
      tipoCorpo: {
        title: isMasculino
          ? 'Qual é o seu tipo de corpo atual?'
          : 'Como você descreveria seu corpo atual?',
        subtitle: isMasculino
          ? 'Homens têm diferentes biotipos que respondem de forma única aos treinos'
          : 'Cada tipo de corpo precisa de estratégias diferentes para alcançar seus objetivos',
        desc: isMasculino
          ? 'Identificar seu biotipo ajuda a criar treinos que maximizam ganho de massa e força'
          : 'Treinos personalizados para seu tipo de corpo garantem resultados mais rápidos e eficazes'
      },
      // Dados corporais personalizados
      dadosCorporais: {
        title: 'Informações Corporais',
        subtitle: isMasculino
          ? 'Altura e peso são fundamentais para calcular cargas ideais para ganho de massa'
          : 'Altura e peso são fundamentais para calcular cargas ideais para tonificação',
        desc: isMasculino
          ? 'Com base no seu IMC e estrutura, ajustamos cargas e volume para máximo ganho muscular'
          : 'Com base no seu IMC e estrutura, ajustamos cargas e volume para máxima definição'
      },
      // Objetivos personalizados
      objetivos: {
        title: 'Qual é o seu objetivo principal?',
        subtitle: isMasculino
          ? 'Homens têm objetivos específicos que exigem estratégias diferentes de treino'
          : 'Mulheres têm objetivos específicos que exigem estratégias diferentes de treino',
        desc: isMasculino
          ? 'Focar em um objetivo principal garante ganho de massa e força mais rápidos'
          : 'Focar em um objetivo principal garante definição e tonificação mais rápidas'
      },
      // Experiência personalizada
      experiencia: {
        title: 'Sua Experiência e Disponibilidade',
        subtitle: 'Treinos adequados ao seu nível evitam lesões e garantem progressão constante',
        desc: 'A frequência ideal depende do seu objetivo e tempo disponível. Mais não significa melhor!'
      }
    }
  }, [onboardingData.sexo])
}

