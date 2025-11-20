export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export const validatePerfil = (data: any): ValidationResult => {
  const errors: Record<string, string> = {}

  if (data.idade !== undefined && data.idade !== null && data.idade !== '') {
    const idade = Number(data.idade)
    if (isNaN(idade) || idade < 13 || idade > 100) {
      errors.idade = 'Idade deve estar entre 13 e 100 anos'
    }
  }

  if (data.altura !== undefined && data.altura !== null && data.altura !== '') {
    const altura = Number(data.altura)
    if (isNaN(altura) || altura < 100 || altura > 250) {
      errors.altura = 'Altura deve estar entre 100 e 250 cm'
    }
  }

  if (data.pesoAtual !== undefined && data.pesoAtual !== null && data.pesoAtual !== '') {
    const peso = Number(data.pesoAtual)
    if (isNaN(peso) || peso < 30 || peso > 300) {
      errors.pesoAtual = 'Peso deve estar entre 30 e 300 kg'
    }
  }

  if (data.percentualGordura !== undefined && data.percentualGordura !== null && data.percentualGordura !== '') {
    const gordura = Number(data.percentualGordura)
    if (isNaN(gordura) || gordura < 5 || gordura > 50) {
      errors.percentualGordura = 'Percentual de gordura deve estar entre 5 e 50%'
    }
  }

  if (data.frequenciaSemanal !== undefined && data.frequenciaSemanal !== null && data.frequenciaSemanal !== '') {
    const freq = Number(data.frequenciaSemanal)
    if (isNaN(freq) || freq < 1 || freq > 7) {
      errors.frequenciaSemanal = 'Frequência semanal deve estar entre 1 e 7 dias'
    }
  }

  if (data.tempoDisponivel !== undefined && data.tempoDisponivel !== null && data.tempoDisponivel !== '') {
    const tempo = Number(data.tempoDisponivel)
    if (isNaN(tempo) || tempo < 30 || tempo > 120) {
      errors.tempoDisponivel = 'Tempo disponível deve estar entre 30 e 120 minutos'
    }
  }

  if (data.rpePreferido !== undefined && data.rpePreferido !== null && data.rpePreferido !== '') {
    const rpe = Number(data.rpePreferido)
    if (isNaN(rpe) || rpe < 1 || rpe > 10) {
      errors.rpePreferido = 'RPE deve estar entre 1 e 10'
    }
  }

  if (data.user?.nome !== undefined && data.user.nome !== null && data.user.nome !== '') {
    if (data.user.nome.trim().length < 2) {
      errors.nome = 'Nome deve ter no mínimo 2 caracteres'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validatePeso = (peso: string | number): ValidationResult => {
  const errors: Record<string, string> = {}
  const pesoNum = typeof peso === 'string' ? parseFloat(peso) : peso

  if (!peso || isNaN(pesoNum)) {
    errors.peso = 'Peso é obrigatório'
  } else if (pesoNum < 30 || pesoNum > 300) {
    errors.peso = 'Peso deve estar entre 30 e 300 kg'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: Record<string, string> = {}
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) {
    errors.email = 'Email é obrigatório'
  } else if (!emailRegex.test(email)) {
    errors.email = 'Email inválido'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

