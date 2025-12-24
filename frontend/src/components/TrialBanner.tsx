import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function TrialBanner() {
  const { user, isTrialAtivo, diasRestantesTrial, horasRestantesTrial } = useAuth()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Verificar se foi fechado anteriormente (localStorage)
    const dismissedKey = `trial-banner-dismissed-${user?.id}`
    const wasDismissed = localStorage.getItem(dismissedKey)
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [user?.id])

  if (!isTrialAtivo() || dismissed || !user) {
    return null
  }

  const diasRestantes = diasRestantesTrial()
  const horasRestantes = horasRestantesTrial()
  
  // Mostrar horas quando restam menos de 24 horas
  const mostrarHoras = diasRestantes < 1
  const tempoRestante = mostrarHoras 
    ? Math.floor(horasRestantes)
    : Math.ceil(diasRestantes)
  
  const textoRestante = mostrarHoras
    ? `${tempoRestante} ${tempoRestante === 1 ? 'hora' : 'horas'}`
    : `${tempoRestante} ${tempoRestante === 1 ? 'dia' : 'dias'}`

  const handleDismiss = () => {
    if (user?.id) {
      const dismissedKey = `trial-banner-dismissed-${user.id}`
      localStorage.setItem(dismissedKey, 'true')
      setDismissed(true)
    }
  }

  const handleEscolherPlano = () => {
    navigate('/checkout')
  }

  return (
    <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-4 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-white/60 hover:text-white transition"
        aria-label="Fechar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-center justify-between gap-4 pr-8">
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">
            Teste gratuito ativo
          </h3>
          <p className="text-white/80 text-sm">
            Você tem <strong className="text-primary">{textoRestante}</strong> restantes para testar todos os recursos
          </p>
        </div>
        <button
          onClick={handleEscolherPlano}
          className="px-4 py-2 bg-primary text-dark font-semibold rounded-full hover:bg-primary/90 transition text-sm whitespace-nowrap"
        >
          Assinar Agora
        </button>
      </div>
    </div>
  )
}
