import { useNavigate } from 'react-router-dom'

export default function TrialExpirado() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Ícone ou Ilustração */}
        <div className="mx-auto w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Título */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">
            Seu período de teste acabou
          </h1>
          <p className="text-white/70 text-lg">
            Você experimentou o Athletia por 24 horas gratuitas. Agora é hora de escolher um plano para continuar sua jornada!
          </p>
        </div>

        {/* Recursos que experimentou */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 text-left">
          <h2 className="text-lg font-semibold text-white mb-4">
            O que você experimentou:
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white/80">Treinos personalizados por IA</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white/80">Acompanhamento de progresso</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white/80">Exercícios adaptados ao seu perfil</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white/80">Muito mais recursos esperando por você</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 rounded-full bg-primary text-dark font-bold text-lg shadow-glow hover:bg-primary/90 transition"
          >
            Desbloquear Meu Plano
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition"
          >
            Fazer Login
          </button>
        </div>

        {/* Mensagem adicional */}
        <p className="text-white/50 text-sm">
          Não perca seu progresso! Escolha um plano agora e continue sua jornada.
        </p>
      </div>
    </div>
  )
}
