import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import MenuHamburger from './MenuHamburger'

interface NavbarProps {
  title?: string
  showBack?: boolean
  backPath?: string
  onBack?: () => void
}

export default function Navbar({ title, showBack = false, backPath, onBack }: NavbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backPath !== undefined) {
      navigate(backPath)
    } else {
      // Se não especificado, tenta voltar no histórico ou vai para dashboard
      if (window.history.length > 1) {
        navigate(-1)
      } else {
        navigate('/dashboard')
      }
    }
  }

  // Determinar título padrão baseado na rota
  const getPageTitle = () => {
    if (title) return title
    
    const path = location.pathname
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/treino': 'Meus Treinos',
      '/historico': 'Histórico',
      '/estatisticas': 'Estatísticas',
      '/evolucao-peso': 'Evolução de Peso',
      '/perfil': 'Meu Perfil',
      '/admin': 'Painel Admin'
    }
    
    return titles[path] || 'AthletIA'
  }

  const pageTitle = getPageTitle()
  const isDashboard = location.pathname === '/dashboard'

  return (
    <nav className="navbar border-b border-grey/20">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            {(showBack || !isDashboard) && (
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-dark-lighter transition-colors text-light-muted hover:text-light"
                aria-label="Voltar"
                title="Voltar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {isDashboard ? (
              <>
                <MenuHamburger />
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-xl font-display font-bold text-gradient hover:opacity-80 transition-opacity"
                  aria-label="Ir para Dashboard"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  AthletIA
                </button>
              </>
            ) : (
              <h1 className="text-lg md:text-xl font-display font-bold text-light">
                {pageTitle}
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-light-muted hidden sm:block">
                    Olá, {user?.nome || user?.email}
                  </span>
                  <button
                    onClick={() => navigate('/perfil')}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-dark-lighter transition-colors text-light-muted hover:text-light"
                    aria-label="Configurações"
                    title="Configurações"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-sm"
                >
                  Sair
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

