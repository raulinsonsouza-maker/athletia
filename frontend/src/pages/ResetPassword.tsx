import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText, type PasswordStrength } from '../utils/passwordValidation'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; strength: PasswordStrength; errors: string[] }>({
    isValid: false,
    strength: 'weak',
    errors: []
  })

  useEffect(() => {
    if (!token) {
      setError('Token inválido. Solicite uma nova redefinição de senha.')
    }
  }, [token])

  useEffect(() => {
    if (newPassword) {
      const validation = validatePassword(newPassword)
      setPasswordValidation(validation)
    } else {
      setPasswordValidation({ isValid: false, strength: 'weak', errors: [] })
    }
  }, [newPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validações
    if (!token) {
      setError('Token inválido. Solicite uma nova redefinição de senha.')
      return
    }

    if (!passwordValidation.isValid) {
      setError('A senha não atende aos requisitos mínimos.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      await authService.resetPassword(token, newPassword)
      setSuccess(true)
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Senha redefinida com sucesso! Faça login com sua nova senha.' 
          } 
        })
      }, 2000)
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err)
      setError(err.response?.data?.error || 'Erro ao redefinir senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 border-4 border-success">
            <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold text-light">Senha redefinida!</h1>
          <p className="text-light-muted">
            Sua senha foi redefinida com sucesso. Redirecionando para o login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-dark-lighter/80 border border-white/10 rounded-[36px] p-8 backdrop-blur space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-bold text-light">Redefinir Senha</h1>
          <p className="text-sm text-light-muted">
            Digite sua nova senha abaixo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Nova Senha */}
          <label className="space-y-2 block">
            <span className="text-sm text-white/60">Nova Senha</span>
            <div className="relative rounded-2xl bg-white/5 border border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40 transition">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-transparent px-4 py-3 pr-12 text-base text-white placeholder-white/40 focus:outline-none"
                placeholder="Digite sua nova senha"
                required
                disabled={loading || !token}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-primary transition"
                disabled={loading}
                aria-label={showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showNewPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l3.612 3.612M21 21l-3.612-3.612M7.5 7.5C5.093 8.758 3.375 10.82 2.25 12c1.852 2.045 5.795 5.25 9.75 5.25 1.098 0 2.164-.174 3.177-.488M15 12a3 3 0 00-3-3m0 0c-.414 0-.81.084-1.172.238m1.172-.238a3 3 0 013 3c0 .414-.084.81-.238 1.172" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c1.852-2.045 5.795-5.25 9.75-5.25s7.898 3.205 9.75 5.25c-1.852 2.045-5.795 5.25-9.75 5.25S4.102 14.045 2.25 12z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Indicador de força da senha */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: passwordValidation.strength === 'weak' ? '33%' : passwordValidation.strength === 'medium' ? '66%' : '100%',
                        backgroundColor: getPasswordStrengthColor(passwordValidation.strength)
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: getPasswordStrengthColor(passwordValidation.strength) }}>
                    {getPasswordStrengthText(passwordValidation.strength)}
                  </span>
                </div>
                
                {/* Lista de requisitos */}
                {passwordValidation.errors.length > 0 && (
                  <ul className="text-xs text-light-muted space-y-1">
                    {passwordValidation.errors.map((err, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {err}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </label>

          {/* Confirmar Senha */}
          <label className="space-y-2 block">
            <span className="text-sm text-white/60">Confirmar Nova Senha</span>
            <div className="relative rounded-2xl bg-white/5 border border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40 transition">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent px-4 py-3 pr-12 text-base text-white placeholder-white/40 focus:outline-none"
                placeholder="Confirme sua nova senha"
                required
                disabled={loading || !token}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-primary transition"
                disabled={loading}
                aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l3.612 3.612M21 21l-3.612-3.612M7.5 7.5C5.093 8.758 3.375 10.82 2.25 12c1.852 2.045 5.795 5.25 9.75 5.25 1.098 0 2.164-.174 3.177-.488M15 12a3 3 0 00-3-3m0 0c-.414 0-.81.084-1.172.238m1.172-.238a3 3 0 013 3c0 .414-.084.81-.238 1.172" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c1.852-2.045 5.795-5.25 9.75-5.25s7.898 3.205 9.75 5.25c-1.852 2.045-5.795 5.25-9.75 5.25S4.102 14.045 2.25 12z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Validação de confirmação */}
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-error flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                As senhas não coincidem
              </p>
            )}
            
            {confirmPassword && newPassword === confirmPassword && newPassword && (
              <p className="text-xs text-success flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                As senhas coincidem
              </p>
            )}
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-primary text-dark font-semibold py-3 shadow-lg shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed transition"
            disabled={loading || !token || !passwordValidation.isValid || newPassword !== confirmPassword}
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-primary hover:underline"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    </div>
  )
}

