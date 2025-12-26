import { useNavigate } from 'react-router-dom'

interface FirstTrainingCompleteProps {
  isOpen: boolean
  nextTrainingId: string | null
  nextTrainingAvailable: boolean
  onContinue: () => void
}

export default function FirstTrainingComplete({
  isOpen,
  nextTrainingId,
  nextTrainingAvailable,
  onContinue
}: FirstTrainingCompleteProps) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleContinuar = () => {
    if (nextTrainingAvailable && nextTrainingId) {
      // Iniciar próximo treino imediatamente
      navigate(`/treino?treinoId=${nextTrainingId}`)
    } else {
      // Agendar próximo treino (ir para página de treinos)
      navigate('/treino')
    }
    onContinue()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-dark via-dark-light to-dark-lighter border-2 border-primary/50 rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Você concluiu seu primeiro treino!
          </h2>
          <p className="text-white/70 text-lg">
            Seu plano foi ajustado com base nisso.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <p className="text-sm text-white/80">
            {nextTrainingAvailable
              ? 'Seu próximo treino já está disponível!'
              : 'Continue sua evolução agendando seus próximos treinos.'}
          </p>
        </div>

        <button
          onClick={handleContinuar}
          className="w-full py-4 bg-primary text-dark font-bold rounded-full hover:bg-primary/90 transition shadow-lg text-lg"
        >
          Continuar Minha Evolução
        </button>
      </div>
    </div>
  )
}

