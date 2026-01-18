import { useState, useRef, useEffect } from 'react'
import InputMask from 'react-input-mask'
import { OnboardingData } from '../../types/onboarding.types'
import MobileNumberPicker from '../MobileNumberPicker'
import OnboardingStepCard from '../onboarding/OnboardingStepCard'
import StepIdade from '../onboarding/steps/StepIdade'
import StepSexo from '../onboarding/steps/StepSexo'
import { useCadastroForm } from '../../hooks/cadastro/useCadastroForm'
import { DEFAULT_VALUES } from '../../constants/onboarding.constants'
import {
  IDADE_OPCOES,
  SEXO_OPCOES,
  TIPO_CORPO_FEMININO,
  TIPO_CORPO_MASCULINO,
  AGUA_OPCOES,
  OBJETIVO_OPCOES_FEMININO,
  OBJETIVO_OPCOES_MASCULINO,
  EXPERIENCIA_OPCOES,
  FREQUENCIA_OPCOES,
  TEMPO_OPCOES,
  LOCAL_TREINO_OPCOES,
  LESOES_OPCOES,
  PROBLEMAS_ANTERIORES_OPCOES,
  OBJETIVOS_ADICIONAIS_OPCOES
} from '../../constants/onboarding.constants'
import { useGenderContent } from '../../hooks/onboarding/useGenderContent'

interface OnboardingFormSectionProps {
  onboardingData: OnboardingData
  onFormChange: (data: OnboardingData) => void
  onFormDataChange?: (hasData: { nomeCompleto: boolean; email: boolean; telefone: boolean; senha: boolean }) => void
  onSubmit: (formData: {
    nomeCompleto: string
    telefone: string
    email: string
    senha: string
  }) => Promise<void>
  loading?: boolean
  error?: string
}

export default function OnboardingFormSection({
  onboardingData,
  onFormChange,
  onFormDataChange,
  onSubmit,
  loading = false,
  error
}: OnboardingFormSectionProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)
  const genderContent = useGenderContent(onboardingData)
  const {
    formData,
    errors,
    touched,
    senhaStrength,
    handleChange: handleCadastroChange,
    handleBlur,
    validateAll
  } = useCadastroForm()

  // Sincronizar nome do cadastro com onboarding
  useEffect(() => {
    if (formData.nomeCompleto && formData.nomeCompleto !== onboardingData.nome) {
      onFormChange({ ...onboardingData, nome: formData.nomeCompleto })
    }
  }, [formData.nomeCompleto, onboardingData, onFormChange])

  // Notificar pai sobre mudanças nos campos de cadastro
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange({
        nomeCompleto: !!formData.nomeCompleto,
        email: !!formData.email,
        telefone: !!formData.telefone,
        senha: !!formData.senha
      })
    }
  }, [formData.nomeCompleto, formData.email, formData.telefone, formData.senha, onFormDataChange])

  const handleOnboardingChange = (field: keyof OnboardingData, value: any) => {
    const newData = { ...onboardingData, [field]: value }
    onFormChange(newData)
  }

  const handleArrayChange = (field: 'lesoes' | 'preferencias' | 'problemasAnteriores' | 'objetivosAdicionais', value: string) => {
    const current = onboardingData[field] || []
    const index = current.indexOf(value)
    if (index > -1) {
      handleOnboardingChange(field, current.filter((item: string) => item !== value))
    } else {
      handleOnboardingChange(field, [...current, value])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateAll()) {
      return
    }

    await onSubmit({
      nomeCompleto: formData.nomeCompleto,
      telefone: formData.telefone,
      email: formData.email,
      senha: formData.senha
    })
  }

  const getSenhaStrengthColor = () => {
    if (!senhaStrength) return ''
    if (senhaStrength === 'weak') return 'bg-error'
    if (senhaStrength === 'medium') return 'bg-warning'
    return 'bg-success'
  }

  const getSenhaStrengthText = () => {
    if (!senhaStrength) return ''
    if (senhaStrength === 'weak') return 'Fraca'
    if (senhaStrength === 'medium') return 'Média'
    return 'Forte'
  }

  // Calcular progresso do formulário
  const requiredFields = [
    formData.nomeCompleto,
    formData.email,
    formData.telefone,
    formData.senha,
    onboardingData.sexo,
    onboardingData.idade,
    onboardingData.altura,
    onboardingData.pesoAtual,
    onboardingData.tipoCorpo,
    onboardingData.aguaDiaria,
    onboardingData.experiencia,
    onboardingData.objetivo,
    onboardingData.frequenciaSemanal,
    onboardingData.tempoDisponivel,
    onboardingData.localTreino,
    onboardingData.lesoes && onboardingData.lesoes.length > 0
  ]

  const filledFields = requiredFields.filter(Boolean).length
  const progress = Math.round((filledFields / requiredFields.length) * 100)

  return (
    <section
      ref={formRef as React.RefObject<HTMLElement>}
      id="formulario-onboarding"
      className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/30 to-dark relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-3 md:mb-4">
            Crie seu{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              treino personalizado
            </span>
          </h2>
          <p className="text-base md:text-lg text-light-muted max-w-xl mx-auto mb-6">
            Preencha os campos abaixo para começarmos
          </p>
          
          {/* Indicador de Progresso */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-light-muted">Progresso</span>
              <span className="text-sm font-semibold text-primary">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-dark-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          {/* Seção 1: Dados de Cadastro */}
          <div className="bg-dark-lighter/70 backdrop-blur-xl rounded-2xl border-2 border-primary/30 p-6 md:p-8 shadow-2xl shadow-primary/20">
            <h3 className="text-xl md:text-2xl font-bold text-light mb-6">Dados de Cadastro</h3>
            
            <div className="space-y-5 md:space-y-6">
              {/* Nome Completo */}
              <div>
                <label htmlFor="nomeCompleto" className="block text-sm font-medium text-light mb-2">
                  Nome completo
                </label>
                <input
                  id="nomeCompleto"
                  type="text"
                  value={formData.nomeCompleto}
                  onChange={(e) => handleCadastroChange('nomeCompleto', e.target.value)}
                  onBlur={() => handleBlur('nomeCompleto')}
                  className={`w-full bg-dark/80 backdrop-blur-xl border-2 rounded-xl px-4 py-3.5 text-light focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                    touched.nomeCompleto && errors.nomeCompleto
                      ? 'border-error'
                      : touched.nomeCompleto
                      ? 'border-primary'
                      : 'border-grey/30'
                  }`}
                  placeholder="Seu nome completo"
                />
                {touched.nomeCompleto && errors.nomeCompleto && (
                  <p className="mt-1 text-sm text-error">{errors.nomeCompleto}</p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-light mb-2">
                  Telefone
                </label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => handleCadastroChange('telefone', e.target.value)}
                  onBlur={() => handleBlur('telefone')}
                >
                  {(inputProps: any) => (
                    <input
                      {...inputProps}
                      id="telefone"
                      type="tel"
                      className={`w-full bg-dark/80 backdrop-blur-xl border-2 rounded-xl px-4 py-3.5 text-light focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                        touched.telefone && errors.telefone
                          ? 'border-error'
                          : touched.telefone
                          ? 'border-primary'
                          : 'border-grey/30'
                      }`}
                      placeholder="(00) 00000-0000"
                    />
                  )}
                </InputMask>
                {touched.telefone && errors.telefone && (
                  <p className="mt-1 text-sm text-error">{errors.telefone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-light mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleCadastroChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full bg-dark/80 backdrop-blur-xl border-2 rounded-xl px-4 py-3.5 text-light focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                    touched.email && errors.email
                      ? 'border-error'
                      : touched.email
                      ? 'border-primary'
                      : 'border-grey/30'
                  }`}
                  placeholder="seu@email.com"
                />
                {touched.email && errors.email && (
                  <p className="mt-1 text-sm text-error">{errors.email}</p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-light mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={showSenha ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={(e) => handleCadastroChange('senha', e.target.value)}
                    onBlur={() => handleBlur('senha')}
                    className={`w-full bg-dark/80 backdrop-blur-xl border-2 rounded-xl px-4 py-3.5 pr-12 text-light focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                      touched.senha && errors.senha
                        ? 'border-error'
                        : touched.senha
                        ? 'border-primary'
                        : 'border-grey/30'
                    }`}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted hover:text-light transition-colors"
                    tabIndex={-1}
                  >
                    {showSenha ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {touched.senha && errors.senha && (
                  <p className="mt-1 text-sm text-error">{errors.senha}</p>
                )}
                {formData.senha && senhaStrength && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-dark-lighter rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getSenhaStrengthColor()} transition-all duration-300 ${
                            senhaStrength === 'weak' ? 'w-1/3' : senhaStrength === 'medium' ? 'w-2/3' : 'w-full'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        senhaStrength === 'weak' ? 'text-error' : senhaStrength === 'medium' ? 'text-warning' : 'text-success'
                      }`}>
                        {getSenhaStrengthText()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label htmlFor="confirmarSenha" className="block text-sm font-medium text-light mb-2">
                  Confirmar senha
                </label>
                <div className="relative">
                  <input
                    id="confirmarSenha"
                    type={showConfirmarSenha ? 'text' : 'password'}
                    value={formData.confirmarSenha}
                    onChange={(e) => handleCadastroChange('confirmarSenha', e.target.value)}
                    onBlur={() => handleBlur('confirmarSenha')}
                    className={`w-full bg-dark/80 backdrop-blur-xl border-2 rounded-xl px-4 py-3.5 pr-12 text-light focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                      touched.confirmarSenha && errors.confirmarSenha
                        ? 'border-error'
                        : touched.confirmarSenha
                        ? 'border-primary'
                        : 'border-grey/30'
                    }`}
                    placeholder="Confirme sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted hover:text-light transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmarSenha ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {touched.confirmarSenha && errors.confirmarSenha && (
                  <p className="mt-1 text-sm text-error">{errors.confirmarSenha}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção 2: Perfil Físico */}
          <div className="bg-dark-lighter/70 backdrop-blur-xl rounded-2xl border-2 border-primary/30 p-6 md:p-8 shadow-2xl shadow-primary/20">
            <h3 className="text-xl md:text-2xl font-bold text-light mb-6">Seu Perfil</h3>
            
            <div className="space-y-6">
              {/* Sexo */}
              <div>
                <label className="block text-sm font-medium text-light mb-3">Sexo</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SEXO_OPCOES.map((sexo) => {
                    const selected = onboardingData.sexo === sexo.value
                    return (
                      <OnboardingStepCard
                        key={sexo.value}
                        selected={selected}
                        onClick={() => handleOnboardingChange('sexo', sexo.value)}
                        ariaLabel={`Selecionar ${sexo.value}`}
                        ariaPressed={selected}
                      >
                        <div className="w-full aspect-[4/3] sm:aspect-[3/4] bg-dark-lighter overflow-hidden max-h-[240px] sm:max-h-none">
                          {'image' in sexo && sexo.image ? (
                            <img 
                              src={sexo.image} 
                              alt={`Treino personalizado para ${sexo.value}`}
                              className="w-full h-full object-cover object-center"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center px-6 text-light">
                              <div className="text-lg font-semibold mb-2 text-center">
                                {sexo.value}
                              </div>
                              {'description' in sexo && (
                                <p className="text-sm text-light-muted text-center leading-snug">
                                  {sexo.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
                          <div className="text-white font-bold text-xl">{sexo.value}</div>
                        </div>
                      </OnboardingStepCard>
                    )
                  })}
                </div>
              </div>

              {/* Idade */}
              {onboardingData.sexo && (
                <div>
                  <label className="block text-sm font-medium text-light mb-3">Idade</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {IDADE_OPCOES.map((faixa) => {
                      const selected = onboardingData.idade ? 
                        (faixa.label === '18-29' && onboardingData.idade >= 18 && onboardingData.idade <= 29) ||
                        (faixa.label === '30-39' && onboardingData.idade >= 30 && onboardingData.idade <= 39) ||
                        (faixa.label === '40-49' && onboardingData.idade >= 40 && onboardingData.idade <= 49) ||
                        (faixa.label === '50+' && onboardingData.idade >= 50) : false

                      return (
                        <OnboardingStepCard
                          key={faixa.label}
                          selected={selected}
                          onClick={() => handleOnboardingChange('idade', faixa.value)}
                          ariaLabel={`Selecionar idade ${faixa.label}`}
                          ariaPressed={selected}
                        >
                          <div className="w-full aspect-[4/3] sm:aspect-[3/4] bg-dark-lighter overflow-hidden max-h-[240px] sm:max-h-none">
                            <img 
                              src={faixa.image} 
                              alt={`Pessoa na faixa etária ${faixa.label} anos`}
                              className="w-full h-full object-cover object-top"
                              loading="lazy"
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-3">
                            <div className="text-white font-bold text-lg">{faixa.label}</div>
                          </div>
                        </OnboardingStepCard>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Altura e Peso */}
              {onboardingData.idade && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-light mb-3">Altura (cm)</label>
                    <div className="max-w-xs mx-auto">
                      <MobileNumberPicker
                        min={140}
                        max={220}
                        step={1}
                        value={onboardingData.altura ?? DEFAULT_VALUES.altura}
                        onChange={(valor) => handleOnboardingChange('altura', valor)}
                        unit="cm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light mb-3">Peso atual (kg)</label>
                    <div className="max-w-xs mx-auto">
                      <MobileNumberPicker
                        min={40}
                        max={200}
                        step={0.5}
                        value={onboardingData.pesoAtual ?? DEFAULT_VALUES.pesoAtual}
                        onChange={(valor) => handleOnboardingChange('pesoAtual', valor)}
                        unit="kg"
                      />
                    </div>
                    {onboardingData.altura && onboardingData.pesoAtual && (
                      <div className="bg-primary/15 border border-primary/40 rounded-lg p-4 mt-4 max-w-xs mx-auto">
                        <p className="text-xs text-light-muted uppercase tracking-wide mb-1">Seu IMC estimado</p>
                        <p className="text-3xl font-bold text-primary">
                          {(() => {
                            const alturaMetros = onboardingData.altura / 100
                            if (alturaMetros <= 0) return '—'
                            const imcValor = onboardingData.pesoAtual / (alturaMetros * alturaMetros)
                            return imcValor.toFixed(1)
                          })()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tipo de Corpo */}
                  {onboardingData.altura && onboardingData.pesoAtual && (
                    <div>
                      <label className="block text-sm font-medium text-light mb-3">Tipo de corpo</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(onboardingData.sexo === 'Feminino' ? TIPO_CORPO_FEMININO : TIPO_CORPO_MASCULINO).map((tipo) => {
                          const selected = onboardingData.tipoCorpo === tipo.value
                          return (
                            <button
                              key={tipo.value}
                              type="button"
                              onClick={() => handleOnboardingChange('tipoCorpo', tipo.value)}
                              className={`relative overflow-hidden rounded-lg transition-all ${
                                selected
                                  ? 'ring-4 ring-primary scale-105'
                                  : 'ring-2 ring-slate-300 hover:ring-primary/50'
                              }`}
                            >
                              <div className="w-full aspect-[3/4] bg-dark-lighter">
                                <img 
                                  src={tipo.image} 
                                  alt={tipo.label}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-3">
                                <div className="text-white font-bold text-lg">{tipo.label}</div>
                                <div className="text-white/80 text-xs">{tipo.desc}</div>
                              </div>
                              {selected && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Seção 3: Objetivos e Experiência */}
          {onboardingData.tipoCorpo && (
            <div className="bg-dark-lighter/70 backdrop-blur-xl rounded-2xl border-2 border-primary/30 p-6 md:p-8 shadow-2xl shadow-primary/20">
              <h3 className="text-xl md:text-2xl font-bold text-light mb-6">Objetivos e Experiência</h3>
              
              <div className="space-y-6">
                {/* Água Diária */}
                <div>
                  <label className="block text-sm font-medium text-light mb-3">Quantos litros de água você bebe por dia?</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AGUA_OPCOES.map((agua) => {
                      const selected = onboardingData.aguaDiaria === agua.value
                      return (
                        <button
                          key={agua.value}
                          type="button"
                          onClick={() => handleOnboardingChange('aguaDiaria', agua.value)}
                          className={`relative overflow-hidden rounded-xl transition-all p-6 text-left ${
                            selected
                              ? 'ring-4 ring-primary scale-105 bg-dark-lighter border-2 border-primary/50'
                              : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                          }`}
                        >
                          <div className="text-white font-bold text-xl mb-2">{agua.label}</div>
                          <div className="text-white/70 text-sm">{agua.desc}</div>
                          {selected && (
                            <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Objetivo */}
                {onboardingData.aguaDiaria && (
                  <div>
                    <label className="block text-sm font-medium text-light mb-3">Objetivo principal</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(onboardingData.sexo === 'Feminino' ? OBJETIVO_OPCOES_FEMININO : OBJETIVO_OPCOES_MASCULINO).map((obj) => {
                        const selected = onboardingData.objetivo === obj.value
                        return (
                          <button
                            key={obj.value}
                            type="button"
                            onClick={() => handleOnboardingChange('objetivo', obj.value)}
                            className={`relative overflow-hidden rounded-lg transition-all ${
                              selected
                                ? 'ring-4 ring-primary scale-105'
                                : 'ring-2 ring-slate-300 hover:ring-primary/50'
                            }`}
                          >
                            <div className="w-full aspect-[3/4] bg-dark-lighter">
                              <img 
                                src={obj.image} 
                                alt={obj.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
                              <div className="text-white font-bold text-xl mb-1">{obj.title}</div>
                              <div className="text-white/80 text-sm">{obj.desc}</div>
                            </div>
                            {selected && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Experiência */}
                {onboardingData.objetivo && (
                  <div>
                    <label className="block text-sm font-medium text-light mb-3">Nível de condicionamento físico</label>
                    <div className="grid grid-cols-1 gap-4">
                      {EXPERIENCIA_OPCOES.map((exp) => {
                        const selected = onboardingData.experiencia === exp.value
                        return (
                          <button
                            key={exp.value}
                            type="button"
                            onClick={() => handleOnboardingChange('experiencia', exp.value)}
                            className={`relative overflow-hidden rounded-lg transition-all p-6 text-left ${
                              selected
                                ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                                : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                            }`}
                          >
                            <div className="text-white font-bold text-xl mb-2">{exp.value}</div>
                            <div className="text-white/80 text-sm">{exp.desc}</div>
                            {selected && (
                              <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seção 4: Preferências de Treino */}
          {onboardingData.experiencia && (
            <div className="bg-dark-lighter/70 backdrop-blur-xl rounded-2xl border-2 border-primary/30 p-6 md:p-8 shadow-2xl shadow-primary/20">
              <h3 className="text-xl md:text-2xl font-bold text-light mb-6">Preferências de Treino</h3>
              
              <div className="space-y-6">
                {/* Frequência Semanal */}
                <div>
                  <label className="block text-sm font-medium text-light mb-3">Frequência semanal</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FREQUENCIA_OPCOES.map((freq) => {
                      const selected = onboardingData.frequenciaSemanal === freq.value
                      return (
                        <button
                          key={freq.value}
                          type="button"
                          onClick={() => handleOnboardingChange('frequenciaSemanal', freq.value)}
                          className={`relative overflow-hidden rounded-xl transition-all p-6 text-left ${
                            selected
                              ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                              : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                          }`}
                        >
                          <div className="text-white font-bold text-xl mb-2">{freq.label}</div>
                          <div className="text-white/70 text-sm">{freq.desc}</div>
                          {selected && (
                            <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tempo Disponível */}
                {onboardingData.frequenciaSemanal && (
                  <div>
                    <label className="block text-sm font-medium text-light mb-3">Tempo disponível por treino</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {TEMPO_OPCOES.map((tempo) => {
                        const selected = onboardingData.tempoDisponivel === tempo.value
                        return (
                          <button
                            key={tempo.value}
                            type="button"
                            onClick={() => handleOnboardingChange('tempoDisponivel', tempo.value)}
                            className={`relative overflow-hidden rounded-xl transition-all p-6 text-left ${
                              selected
                                ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                                : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                            }`}
                          >
                            <div className="text-white font-bold text-xl mb-2">{tempo.label}</div>
                            <div className="text-white/70 text-sm">{tempo.desc}</div>
                            {selected && (
                              <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Local de Treino */}
                {onboardingData.tempoDisponivel && (
                  <div>
                    <label className="block text-sm font-medium text-light mb-3">Local de treino</label>
                    <div className="grid grid-cols-1 gap-4">
                      {LOCAL_TREINO_OPCOES.map((local) => {
                        const selected = onboardingData.localTreino === local.value
                        return (
                          <button
                            key={local.value}
                            type="button"
                            onClick={() => handleOnboardingChange('localTreino', local.value)}
                            className={`relative overflow-hidden rounded-lg transition-all p-6 text-left ${
                              selected
                                ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                                : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                            }`}
                          >
                            <div className="text-white font-bold text-xl mb-2">{local.value}</div>
                            <div className="text-white/70 text-sm">{local.desc}</div>
                            {selected && (
                              <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Lesões */}
                {onboardingData.localTreino && (
                  <div>
                    <label className="block text-sm font-medium text-light mb-3">Lesões ou limitações físicas</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {LESOES_OPCOES.map((lesao) => {
                        const selected = onboardingData.lesoes?.includes(lesao) || 
                          (lesao === 'Nenhuma' && (!onboardingData.lesoes || onboardingData.lesoes.length === 0))
                        return (
                          <button
                            key={lesao}
                            type="button"
                            onClick={() => {
                              if (lesao === 'Nenhuma') {
                                handleOnboardingChange('lesoes', [])
                              } else {
                                handleArrayChange('lesoes', lesao)
                              }
                            }}
                            className={`py-4 rounded-lg font-semibold transition-all text-lg ${
                              selected
                                ? 'bg-primary text-dark ring-4 ring-primary/50 scale-105'
                                : 'bg-dark-lighter text-light ring-2 ring-slate-300 hover:ring-primary/50'
                            }`}
                          >
                            {lesao}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Erro geral */}
          {error && (
            <div className="rounded-xl bg-error/20 border border-error/50 p-4">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* CTA Final - será renderizado fora do form na página principal */}
        </form>
      </div>
    </section>
  )
}
