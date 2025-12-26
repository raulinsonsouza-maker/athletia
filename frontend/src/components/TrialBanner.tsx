import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function TrialBanner() {
  const { user, isTrialAtivo, horasRestantesTrial } = useAuth()
  const navigate = useNavigate()

  if (!isTrialAtivo() || !user) {
    return null
  }

  const horasRestantes = horasRestantesTrial()
  
  // Não mostrar se faltam 12 horas ou menos (AvisoTrialAcabando será exibido)
  if (horasRestantes <= 12) {
    return null
  }
  
  // Sempre mostrar horas inteiras (arredondar para baixo)
  const horasInteiras = Math.floor(horasRestantes)
  const textoRestante = `${horasInteiras} ${horasInteiras === 1 ? 'hora' : 'horas'}`

  const handleEscolherPlano = () => {
    navigate('/checkout')
  }

  return (
    <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
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
          Continuar Evoluindo
        </button>
      </div>
    </div>
  )
}
