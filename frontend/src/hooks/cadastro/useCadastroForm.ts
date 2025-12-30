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

  const validateField = useCallback((field: keyof FormData, value: string, currentFormData?: FormData): string | undefined => {
    const data = currentFormData || formData
    
    switch (field) {
      case 'nomeCompleto':
        if (!value.trim()) return 'Nome completo é obrigatório'
        if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres'
        return undefined

      case 'email': {
        if (!value.trim()) return 'E-mail é obrigatório'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'E-mail inválido'
        return undefined
      }

      case 'telefone': {
        if (!value) return 'Telefone é obrigatório'
        const phoneDigits = value.replace(/\D/g, '')
        if (phoneDigits.length < 10) return 'Telefone inválido'
        return undefined
      }

      case 'senha':
        if (!value) return 'Senha é obrigatória'
        if (value.length < 8) return 'Senha deve ter no mínimo 8 caracteres'
        return undefined

      case 'confirmarSenha':
        if (!value) return 'Confirme sua senha'
        if (value !== data.senha) return 'As senhas não coincidem'
        return undefined

      default:
        return undefined
    }
  }, [formData])

  const validateSenhaStrength = useCallback((senha: string): SenhaStrength => {
    if (!senha) return null
    if (senha.length < 8) return 'weak'
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
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Se mudou a senha, revalidar confirmarSenha se já foi tocado
      if (field === 'senha' && touched.confirmarSenha && newData.confirmarSenha) {
        const confirmarSenhaError = newData.confirmarSenha !== value 
          ? 'As senhas não coincidem' 
          : undefined
        setErrors(prev => ({ ...prev, confirmarSenha: confirmarSenhaError }))
      }
      
      // Validar em tempo real se o campo já foi tocado
      if (touched[field]) {
        const error = validateField(field, value, newData)
        setErrors(prev => ({ ...prev, [field]: error }))
      }
      
      // Validar confirmarSenha em tempo real quando está digitando (mesmo sem ter saído do campo)
      if (field === 'confirmarSenha' && newData.senha) {
        const error = value !== newData.senha ? 'As senhas não coincidem' : undefined
        setErrors(prev => ({ ...prev, confirmarSenha: error }))
      }
      
      return newData
    })
  }, [touched, validateField])

  const handleBlur = useCallback((field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    // Validar após marcar como tocado
    setFormData(prev => {
      const error = validateField(field, prev[field], prev)
      setErrors(prevErrors => ({ ...prevErrors, [field]: error }))
      return prev // Não altera o estado, só usa para validação
    })
  }, [validateField])

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

