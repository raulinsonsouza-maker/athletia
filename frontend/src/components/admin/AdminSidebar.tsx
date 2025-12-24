import { useNavigate, useLocation } from 'react-router-dom'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path?: string
  onClick?: () => void
  children?: MenuItem[]
}

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function AdminSidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
}: AdminSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      children: [
        {
          id: 'estatisticas',
          label: 'Estatísticas',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          ),
          onClick: () => onTabChange('estatisticas'),
        },
      ],
    },
    {
      id: 'gerenciamento',
      label: 'Gerenciamento',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      ),
      children: [
        {
          id: 'usuarios',
          label: 'Usuários',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
          onClick: () => onTabChange('usuarios'),
        },
        {
          id: 'exercicios',
          label: 'Exercícios',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          ),
          onClick: () => onTabChange('exercicios'),
        },
        {
          id: 'grupos',
          label: 'Grupos Musculares',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          ),
          onClick: () => onTabChange('grupos'),
        },
      ],
    },
    {
      id: 'conteudo',
      label: 'Conteúdo',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      children: [
        {
          id: 'imagens',
          label: 'Imagens de Treino',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
          onClick: () => onTabChange('imagens'),
        },
        {
          id: 'blog',
          label: 'Blog',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          ),
          onClick: () => navigate('/admin/blog'),
        },
      ],
    },
    {
      id: 'comunicacao',
      label: 'Comunicação',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      children: [
        {
          id: 'whatsapp',
          label: 'WhatsApp',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          ),
          onClick: () => onTabChange('whatsapp'),
        },
        {
          id: 'chat',
          label: 'Chat',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          ),
          onClick: () => onTabChange('chat'),
        },
      ],
    },
  ]

  const isActive = (itemId: string) => {
    if (itemId === 'estatisticas' && activeTab === 'estatisticas') return true
    if (itemId === 'usuarios' && activeTab === 'usuarios') return true
    if (itemId === 'exercicios' && activeTab === 'exercicios') return true
    if (itemId === 'grupos' && activeTab === 'grupos') return true
    if (itemId === 'imagens' && activeTab === 'imagens') return true
    if (itemId === 'whatsapp' && activeTab === 'whatsapp') return true
    if (itemId === 'chat' && activeTab === 'chat') return true
    if (itemId === 'blog' && location.pathname.startsWith('/admin/blog')) return true
    return false
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-dark-lighter border-r border-grey/30 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64 overflow-y-auto`}
      >
        <nav className="p-4 space-y-4">
          {menuItems.map((item, index) => (
            <div key={item.id}>
              {/* Categoria - não clicável, apenas informativo */}
              <div className="px-3 py-2 mb-2 pointer-events-none">
                <div className="flex items-center gap-2 text-xs font-semibold text-light-muted/70 uppercase tracking-wider">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </div>

              {/* Itens filhos - clicáveis com melhor indentação */}
              <div className="space-y-1 ml-4">
                {item.children?.map((child) => {
                  const active = isActive(child.id)
                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        child.onClick?.()
                        onClose() // Fechar no mobile após clicar
                      }}
                      className={`w-full flex items-center gap-3 pl-6 pr-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                        active
                          ? 'bg-primary/20 text-primary border-l-2 border-primary font-medium'
                          : 'text-light-muted hover:bg-primary/10 hover:text-light'
                      }`}
                    >
                      {child.icon}
                      <span className="text-sm">{child.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Separador visual após cada categoria (exceto a última) */}
              {index < menuItems.length - 1 && (
                <div className="mt-4 mb-2 border-b border-grey/20"></div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}

