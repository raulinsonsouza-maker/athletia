import { useLocation, useNavigate } from 'react-router-dom'

interface BottomTabsProps {
  active?: 'meu-plano' | 'treinos' | 'progresso' | 'historico' | 'perfil'
}

const IconHome = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5l9-7 9 7M5 10.5V21h14v-10.5" />
  </svg>
)

const IconGrid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
  </svg>
)

const IconChart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5m0 14h16M8 17V9m4 8V7m4 10V11" />
  </svg>
)

const IconHistory = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3M3 12a9 9 0 1018 0 9 9 0 00-18 0zm0 0l3-3" />
  </svg>
)

const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M12 12a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
)

const TABS = [
  { id: 'meu-plano', label: 'Meu Plano', path: '/meu-plano', icon: <IconHome /> },
  { id: 'treinos', label: 'Treinos', path: '/treino', icon: <IconGrid /> },
  { id: 'progresso', label: 'Progresso', path: '/progresso', icon: <IconChart /> },
  { id: 'historico', label: 'Histórico', path: '/historico', icon: <IconHistory /> },
  { id: 'perfil', label: 'Perfil', path: '/perfil', icon: <IconUser /> }
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
              <span className={`${isActive ? 'opacity-100' : 'opacity-60'}`}>{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

