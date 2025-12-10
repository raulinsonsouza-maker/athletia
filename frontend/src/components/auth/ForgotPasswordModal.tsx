import { useState } from 'react'
import { authService } from '../../services/auth.service'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.requestPasswordReset(email)
      setSuccess(true)
      // Fechar modal após 3 segundos
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setEmail('')
      }, 3000)
    } catch (err: any) {
      console.error('Erro ao solicitar redefinição:', err)
      setError(err.response?.data?.error || 'Erro ao processar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-dark-lighter rounded-2xl shadow-xl border border-grey/30 animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-grey/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-light">Esqueci minha senha</h2>
            <button
              onClick={onClose}
              className="text-light-muted hover:text-primary transition-colors"
              aria-label="Fechar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 border-4 border-success mb-4">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-light">E-mail enviado!</h3>
              <p className="text-sm text-light-muted">
                Se o e-mail <strong className="text-light">{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
              </p>
              <p className="text-xs text-light-muted mt-2">
                Verifique sua caixa de entrada e a pasta de spam.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-light-muted mb-6">
                Digite seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-2xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                    {error}
                  </div>
                )}

                <label className="space-y-2 block">
                  <span className="text-sm text-white/60">E-mail</span>
                  <div className="rounded-2xl bg-white/5 border border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40 transition">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent px-4 py-3 text-base text-white placeholder-white/40 focus:outline-none"
                      placeholder="seu@email.com"
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-primary text-dark font-semibold py-3 shadow-lg shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  disabled={loading || !email}
                >
                  {loading ? 'Enviando...' : 'Enviar e-mail de redefinição'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

