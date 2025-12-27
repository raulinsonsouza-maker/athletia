import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'

export default function TrialLastDayBanner() {
  const { user, isTrialAtivo } = useAuth()
  const navigate = useNavigate()
  
  // Calcular altura do TrialProgressHeader dinamicamente
  const getTrialHeaderHeight = () => {
    const header = document.getElementById('trial-progress-header')
    if (header) {
      return header.offsetHeight
    }
    return 60 // fallback
  }

  const [headerHeight, setHeaderHeight] = useState(60)

  useEffect(() => {
    const updateHeight = () => {
      setHeaderHeight(getTrialHeaderHeight())
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    // Atualizar após um pequeno delay para garantir que o header foi renderizado
    const timeout = setTimeout(updateHeight, 100)
    return () => {
      window.removeEventListener('resize', updateHeight)
      clearTimeout(timeout)
    }
  }, [])

  if (!isTrialAtivo() || !user) {
    return null
  }

  // Só mostrar no último dia (menos de 12 horas restantes)
  if (!user.dataFimTrial) {
    return null
  }
  
  const agora = new Date()
  const dataFimTrial = new Date(user.dataFimTrial)
  const horasRestantes = (dataFimTrial.getTime() - agora.getTime()) / (1000 * 60 * 60)
  
  // Só mostrar se faltam menos de 12 horas mas mais de 0
  // E não mostrar se TrialProgressHeader já está visível (evitar duplicação)
  if (horasRestantes <= 0 || horasRestantes > 12) {
    return null
  }

  const handleAssinar = () => {
    navigate('/checkout')
  }

  return (
    <div 
      className="fixed left-0 right-0 z-40 bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-yellow-500/30 border-b-2 border-yellow-500/50 backdrop-blur-xl"
      style={{ top: `${headerHeight}px` }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <svg
              className="w-5 h-5 text-yellow-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">
                Você já iniciou sua evolução. Não perca sua sequência.
              </p>
            </div>
          </div>
          <button
            onClick={handleAssinar}
            className="px-4 py-2 bg-primary text-dark text-sm font-bold rounded-full hover:bg-primary/90 transition whitespace-nowrap flex-shrink-0"
          >
            Assinar Agora
          </button>
        </div>
      </div>
    </div>
  )
}

