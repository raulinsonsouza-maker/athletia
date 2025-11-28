import { useMemo } from 'react'

interface OnboardingData {
  nome?: string
  dataNascimento?: string
  idade?: number
  sexo?: string
  altura?: number
  pesoAtual?: number
  percentualGordura?: number
  tipoCorpo?: string
  aguaDiaria?: string
  experiencia?: string
  objetivo?: string
  frequenciaSemanal?: number
  tempoDisponivel?: number
  localTreino?: string
  problemasAnteriores?: string[]
  objetivosAdicionais?: string[]
  lesoes?: string[]
  preferencias?: string[]
  rpePreferido?: number
}

/**
 * Hook para cálculos do onboarding
 * Separa lógica pesada para melhorar performance
 */
export function useOnboardingCalculations(onboardingData: OnboardingData | null) {
  // Calcular IMC
  const imc = useMemo(() => {
    if (!onboardingData?.pesoAtual || !onboardingData?.altura) return null
    const peso = Number(onboardingData.pesoAtual)
    const altura = Number(onboardingData.altura) / 100 // converter cm para m
    if (peso <= 0 || altura <= 0) return null
    const imcValue = peso / (altura * altura)
    return imcValue.toFixed(1)
  }, [onboardingData?.pesoAtual, onboardingData?.altura])

  // Classificação do IMC
  const classificacaoIMC = useMemo(() => {
    if (!imc) return null
    const imcValue = parseFloat(imc)
    if (imcValue < 18.5) return 'Abaixo do peso'
    if (imcValue < 25) return 'Peso normal'
    if (imcValue < 30) return 'Sobrepeso'
    return 'Obesidade'
  }, [imc])

  // Validação cruzada IMC vs Tipo de Corpo
  const validacao = useMemo(() => {
    if (!onboardingData?.tipoCorpo || !imc) return null
    const tipoCorpo = onboardingData.tipoCorpo
    const imcValue = parseFloat(imc)

    // Faixas esperadas por tipo de corpo
    const faixasEsperadas: Record<string, { min: number; max: number }> = {
      'Ectomorfo': { min: 16, max: 20 },
      'Mesomorfo': { min: 20, max: 25 },
      'Endomorfo': { min: 25, max: 30 },
      'Obesidade': { min: 30, max: 50 },
      'Em Forma': { min: 18.5, max: 25 },
      'Sobrepeso': { min: 25, max: 30 },
      'Acima do Peso': { min: 25, max: 30 },
    }

    const faixa = faixasEsperadas[tipoCorpo]
    if (!faixa) return null

    const consistente = imcValue >= faixa.min && imcValue <= faixa.max
    return {
      consistente,
      imcCalculado: imcValue,
      tipoCorpo,
      faixaEsperada: `${faixa.min.toFixed(1)} - ${faixa.max.toFixed(1)}`
    }
  }, [onboardingData?.tipoCorpo, imc])

  // Calcular calorias
  const calorias = useMemo(() => {
    if (!onboardingData?.pesoAtual || !onboardingData?.altura || !onboardingData?.idade) return null
    const peso = Number(onboardingData.pesoAtual)
    const altura = Number(onboardingData.altura)
    const idade = Number(onboardingData.idade)

    // TMB (Taxa Metabólica Basal) - Fórmula de Mifflin-St Jeor
    const tmb = onboardingData.sexo === 'Masculino' 
      ? 10 * peso + 6.25 * altura - 5 * idade + 5
      : 10 * peso + 6.25 * altura - 5 * idade - 161

    // Multiplicador de atividade
    const multiplicador = onboardingData.frequenciaSemanal ? 
      (onboardingData.frequenciaSemanal <= 2 ? 1.2 :
       onboardingData.frequenciaSemanal <= 4 ? 1.375 : 1.55) : 1.2

    const caloriasDiarias = Math.round(tmb * multiplicador)
    return caloriasDiarias.toString()
  }, [
    onboardingData?.pesoAtual,
    onboardingData?.altura,
    onboardingData?.idade,
    onboardingData?.sexo,
    onboardingData?.frequenciaSemanal
  ])

  // Calcular água
  const agua = useMemo(() => {
    if (!onboardingData?.pesoAtual) return null
    const peso = Number(onboardingData.pesoAtual)
    const aguaDiaria = peso * 0.035 // 35ml por kg
    return aguaDiaria.toFixed(1)
  }, [onboardingData?.pesoAtual])

  // Calcular transformação (imagens antes/depois)
  const transformacao = useMemo(() => {
    if (!onboardingData) return null
    if (!onboardingData.sexo) return null

    const isMasculino = onboardingData.sexo === 'Masculino'
    const isFeminino = onboardingData.sexo === 'Feminino'

    // Determinar imagem atual
    const getImagemAtual = () => {
      const tipoCorpo = onboardingData.tipoCorpo
      
      if (isMasculino) {
        if (tipoCorpo === 'Ectomorfo') return '/images/onboarding/magro.webp'
        if (tipoCorpo === 'Mesomorfo') return '/images/onboarding/sobrepeso.webp'
        if (tipoCorpo === 'Endomorfo') return '/images/onboarding/acima_do_peso.webp'
        if (tipoCorpo === 'Obesidade') return '/images/onboarding/obeso.webp'
        return '/images/onboarding/sobrepeso.webp'
      } else if (isFeminino) {
        if (tipoCorpo === 'Em Forma') return '/images/onboarding/Em_forma.webp'
        if (tipoCorpo === 'Sobrepeso') return '/images/onboarding/Sobrepeso.png'
        if (tipoCorpo === 'Acima do Peso') return '/images/onboarding/Acima do peso.webp'
        if (tipoCorpo === 'Obesidade') return '/images/onboarding/Obesidade.webp'
        return '/images/onboarding/Sobrepeso.png'
      }
      return null
    }

    // Determinar imagem futura baseada no objetivo
    const getImagemFutura = () => {
      if (isMasculino) {
        if (onboardingData.objetivo === 'Emagrecimento') return '/images/onboarding/perder_peso.webp'
        if (onboardingData.objetivo === 'Hipertrofia') return '/images/onboarding/ganahr_massa.webp'
        if (onboardingData.objetivo === 'Força') return '/images/onboarding/ficar_musculoso.webp'
        return '/images/onboarding/ganahr_massa.webp'
      } else if (isFeminino) {
        if (onboardingData.objetivo === 'Emagrecimento') return '/images/onboarding/Perder_peso.webp'
        if (onboardingData.objetivo === 'Hipertrofia') return '/images/onboarding/Ganhar_massa_muscular.webp'
        if (onboardingData.objetivo === 'Força') return '/images/onboarding/Ficar_musculosa.webp'
        return '/images/onboarding/Ganhar_massa_muscular.webp'
      }
      return null
    }

    const imagemAtual = getImagemAtual()
    const imagemFutura = getImagemFutura()

    if (!imagemAtual || !imagemFutura) return null

    return {
      imagemAtual,
      imagemFutura
    }
  }, [
    onboardingData?.sexo,
    onboardingData?.tipoCorpo,
    onboardingData?.objetivo
  ])

  return {
    imc,
    classificacaoIMC,
    validacao,
    calorias,
    agua,
    transformacao
  }
}

