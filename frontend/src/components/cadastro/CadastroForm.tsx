import { useRef, useEffect } from 'react'
import InputMask from 'react-input-mask'
import { useCadastroForm } from '../../hooks/cadastro/useCadastroForm'

interface CadastroFormProps {
  onSubmit: (formData: {
    nomeCompleto: string
    telefone: string
    email: string
    senha: string
  }) => Promise<void>
  loading?: boolean
  error?: string
  onScrollIntoView?: boolean
}

export default function CadastroForm({ onSubmit, loading = false, error, onScrollIntoView = false }: CadastroFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const {
    formData,
    errors,
    touched,
    senhaStrength,
    handleChange,
    handleBlur,
    validateAll
  } = useCadastroForm()

  useEffect(() => {
    if (onScrollIntoView && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Auto-focus no primeiro campo
      const firstInput = formRef.current.querySelector('input') as HTMLInputElement
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 300)
      }
    }
  }, [onScrollIntoView])

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

  return (
    <section id="formulario-cadastro" className="py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-4">
            Finalize sua conta para liberar seu plano completo
          </h2>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Nome Completo */}
          <div>
            <label htmlFor="nomeCompleto" className="block text-sm font-medium text-light mb-2">
              Nome completo
            </label>
            <input
              id="nomeCompleto"
              type="text"
              value={formData.nomeCompleto}
              onChange={(e) => handleChange('nomeCompleto', e.target.value)}
              onBlur={() => handleBlur('nomeCompleto')}
              className={`w-full bg-dark-lighter border-2 rounded-lg px-4 py-3 text-light focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                touched.nomeCompleto && errors.nomeCompleto
                  ? 'border-error'
                  : touched.nomeCompleto
                  ? 'border-primary'
                  : 'border-grey/20'
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
              onChange={(e) => handleChange('telefone', e.target.value)}
              onBlur={() => handleBlur('telefone')}
            >
              {(inputProps: any) => (
                <input
                  {...inputProps}
                  id="telefone"
                  type="tel"
                  className={`w-full bg-dark-lighter border-2 rounded-lg px-4 py-3 text-light focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                    touched.telefone && errors.telefone
                      ? 'border-error'
                      : touched.telefone
                      ? 'border-primary'
                      : 'border-grey/20'
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
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`w-full bg-dark-lighter border-2 rounded-lg px-4 py-3 text-light focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                touched.email && errors.email
                  ? 'border-error'
                  : touched.email
                  ? 'border-primary'
                  : 'border-grey/20'
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
            <input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              onBlur={() => handleBlur('senha')}
              className={`w-full bg-dark-lighter border-2 rounded-lg px-4 py-3 text-light focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                touched.senha && errors.senha
                  ? 'border-error'
                  : touched.senha
                  ? 'border-primary'
                  : 'border-grey/20'
              }`}
              placeholder="Mínimo 6 caracteres"
            />
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
                    ></div>
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
            <input
              id="confirmarSenha"
              type="password"
              value={formData.confirmarSenha}
              onChange={(e) => handleChange('confirmarSenha', e.target.value)}
              onBlur={() => handleBlur('confirmarSenha')}
              className={`w-full bg-dark-lighter border-2 rounded-lg px-4 py-3 text-light focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                touched.confirmarSenha && errors.confirmarSenha
                  ? 'border-error'
                  : touched.confirmarSenha
                  ? 'border-primary'
                  : 'border-grey/20'
              }`}
              placeholder="Confirme sua senha"
            />
            {touched.confirmarSenha && errors.confirmarSenha && (
              <p className="mt-1 text-sm text-error">{errors.confirmarSenha}</p>
            )}
          </div>

          {/* Erro geral */}
          {error && (
            <div className="rounded-lg bg-error/20 border border-error/50 p-4">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Observação */}
          <div className="flex items-start gap-2 pt-2">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-light-muted">
              Seus dados estão seguros. Você terá acesso imediato aos seus treinos.
            </p>
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando conta...' : 'Criar minha conta'}
          </button>
        </form>
      </div>
    </section>
  )
}

