import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../services/auth.service'

interface AdminHeaderProps {
  onMenuToggle: () => void
  sidebarOpen: boolean
}

export default function AdminHeader({ onMenuToggle, sidebarOpen }: AdminHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [unreadChatCount, setUnreadChatCount] = useState(0)

  const handleLogout = () => {
    localStorage.removeItem('adminAccessToken')
    localStorage.removeItem('adminRefreshToken')
    localStorage.removeItem('adminUser')
    navigate('/admin/login')
  }

  const adminUser = localStorage.getItem('adminUser')
  const userInfo = adminUser ? JSON.parse(adminUser) : null

  // Carregar contador de conversas não respondidas
  const loadUnreadChatCount = async () => {
    try {
      const response = await api.get('/admin/chat/sessions?status=human')
      // Verificar diferentes formatos de resposta
      let sessions = []
      if (response.data) {
        if (Array.isArray(response.data)) {
          sessions = response.data
        } else if (response.data.sessions && Array.isArray(response.data.sessions)) {
          sessions = response.data.sessions
        } else if (response.data.data && Array.isArray(response.data.data)) {
          sessions = response.data.data
        }
      }
      const count = sessions.length
      setUnreadChatCount(count)
      if (import.meta.env.DEV) {
        console.log('[AdminHeader] Contador de chat atualizado:', count, 'sessões')
      }
    } catch (error: any) {
      // Log erro apenas em desenvolvimento para debug
      if (import.meta.env.DEV) {
        console.warn('[AdminHeader] Erro ao carregar contador de chat:', error?.response?.data || error?.message)
      }
      setUnreadChatCount(0)
    }
  }

  // Carregar contador periodicamente e quando a página mudar
  useEffect(() => {
    loadUnreadChatCount()
    const interval = setInterval(loadUnreadChatCount, 30000) // Atualizar a cada 30s
    return () => clearInterval(interval)
  }, [location.pathname])

  const handleNotificationClick = () => {
    // Navegar para admin com tab chat
    if (location.pathname === '/admin') {
      // Se já está na página admin, disparar evento para mudar de aba
      const event = new CustomEvent('admin:changeTab', { detail: { tab: 'chat' } })
      window.dispatchEvent(event)
    } else {
      navigate('/admin?tab=chat')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30 flex-shrink-0">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-display font-bold text-light whitespace-nowrap leading-tight">
                Painel Administrativo
              </h1>
            </div>
          </div>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            onClick={handleNotificationClick}
            className="hidden md:flex p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white relative"
            aria-label={`Notificações${unreadChatCount > 0 ? `: ${unreadChatCount} conversas não respondidas` : ''}`}
            title={unreadChatCount > 0 ? `${unreadChatCount} conversa${unreadChatCount > 1 ? 's' : ''} não respondida${unreadChatCount > 1 ? 's' : ''}` : 'Nenhuma notificação'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-dark text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                {unreadChatCount > 99 ? '99+' : unreadChatCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 md:gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
                <span className="text-primary font-semibold text-sm">
                  {userInfo?.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-light">
                  {userInfo?.email || 'Admin'}
                </p>
                <p className="text-xs text-light-muted">Administrador</p>
              </div>
              <svg
                className={`w-4 h-4 text-light-muted transition-transform ${
                  showUserMenu ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-dark-lighter border border-grey/30 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-grey/30">
                    <p className="text-sm font-medium text-light">
                      {userInfo?.email || 'Admin'}
                    </p>
                    <p className="text-xs text-light-muted mt-1">Administrador</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        // Navegar para perfil se necessário
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-light-muted hover:bg-white/5 hover:text-light transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleLogout()
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sair
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

