import { useState, useCallback } from 'react'

interface FormData {
  nomeCompleto: string
  telefone: string
  email: string
  senha: string
  confirmarSenha: string
}

interface FormErrors {
  nomeCompleto?: string
  telefone?: string
  email?: string
  senha?: string
  confirmarSenha?: string
}

type SenhaStrength = 'weak' | 'medium' | 'strong' | null

export function useCadastroForm() {
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = useCallback((field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'nomeCompleto':
        if (!value.trim()) return 'Nome completo é obrigatório'
        if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres'
        return undefined

      case 'email':
        if (!value.trim()) return 'E-mail é obrigatório'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'E-mail inválido'
        return undefined

      case 'telefone':
        if (!value) return 'Telefone é obrigatório'
        const phoneDigits = value.replace(/\D/g, '')
        if (phoneDigits.length < 10) return 'Telefone inválido'
        return undefined

      case 'senha':
        if (!value) return 'Senha é obrigatória'
        if (value.length < 6) return 'Senha deve ter no mínimo 6 caracteres'
        return undefined

      case 'confirmarSenha':
        if (!value) return 'Confirme sua senha'
        if (value !== formData.senha) return 'As senhas não coincidem'
        return undefined

      default:
        return undefined
    }
  }, [formData.senha])

  const validateSenhaStrength = useCallback((senha: string): SenhaStrength => {
    if (!senha) return null
    if (senha.length < 6) return 'weak'
    if (senha.length < 10) return 'medium'
    
    const temMaiuscula = /[A-Z]/.test(senha)
    const temMinuscula = /[a-z]/.test(senha)
    const temNumero = /[0-9]/.test(senha)
    const temEspecial = /[^A-Za-z0-9]/.test(senha)
    const complexidade = [temMaiuscula, temMinuscula, temNumero, temEspecial].filter(Boolean).length
    
    if (complexidade >= 3 && senha.length >= 10) return 'strong'
    if (complexidade >= 2) return 'medium'
    return 'weak'
  }, [])

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Validar em tempo real se o campo já foi tocado
    if (touched[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }, [touched, validateField])

  const handleBlur = useCallback((field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field])
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [formData, validateField])

  const validateAll = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    Object.keys(formData).forEach((key) => {
      const field = key as keyof FormData
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched({
      nomeCompleto: true,
      telefone: true,
      email: true,
      senha: true,
      confirmarSenha: true
    })

    return isValid
  }, [formData, validateField])

  const senhaStrength = validateSenhaStrength(formData.senha)

  return {
    formData,
    errors,
    touched,
    senhaStrength,
    handleChange,
    handleBlur,
    validateAll,
    setFormData
  }
}

