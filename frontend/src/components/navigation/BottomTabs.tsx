import { useLocation, useNavigate } from 'react-router-dom'

interface BottomTabsProps {
  active?: 'meu-plano' | 'treinos' | 'progresso' | 'historico' | 'perfil'
}

const TABS = [
  { id: 'meu-plano', label: 'Meu Plano', path: '/meu-plano', icon: '🏠' },
  { id: 'treinos', label: 'Treinos', path: '/treino', icon: '🏋️' },
  { id: 'progresso', label: 'Progresso', path: '/estatisticas', icon: '📈' },
  { id: 'historico', label: 'Histórico', path: '/historico', icon: '📚' },
  { id: 'perfil', label: 'Perfil', path: '/perfil', icon: '👤' }
]

export default function BottomTabs({ active }: BottomTabsProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const current = active || TABS.find(tab => location.pathname.startsWith(tab.path))?.id

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0F0E0A]/95 border-t border-white/5 backdrop-blur-xl z-40">
      <div className="flex items-center justify-between px-5 py-3">
        {TABS.map((tab) => {
          const isActive = current === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 text-xs transition ${
                isActive ? 'text-primary font-semibold' : 'text-white/60'
              }`}
            >
              <span className={`text-lg ${isActive ? 'opacity-100' : 'opacity-60'}`}>{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

