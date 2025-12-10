export type PasswordStrength = 'weak' | 'medium' | 'strong'

export interface PasswordValidationResult {
  isValid: boolean
  strength: PasswordStrength
  errors: string[]
}

/**
 * Valida força da senha e retorna resultado detalhado
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  let strength: PasswordStrength = 'weak'

  // Verificar comprimento mínimo
  if (password.length < 8) {
    errors.push('A senha deve ter no mínimo 8 caracteres')
  }

  // Verificar se tem letra
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra')
  }

  // Verificar se tem número
  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número')
  }

  // Calcular força
  if (password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)) {
    if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength = 'strong'
    } else if (password.length >= 10) {
      strength = 'medium'
    } else {
      strength = 'medium'
    }
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors
  }
}

/**
 * Obtém cor baseada na força da senha
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return '#ef4444' // red-500
    case 'medium':
      return '#f59e0b' // amber-500
    case 'strong':
      return '#10b981' // emerald-500
    default:
      return '#6b7280' // gray-500
  }
}

/**
 * Obtém texto baseado na força da senha
 */
export function getPasswordStrengthText(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'Fraca'
    case 'medium':
      return 'Média'
    case 'strong':
      return 'Forte'
    default:
      return ''
  }
}

