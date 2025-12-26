import { ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface AppHeaderProps {
  title: string
  subtitle?: string
  backTo?: string
  actions?: ReactNode
}

const IconButton = ({
  children,
  onClick,
  ariaLabel
}: {
  children: ReactNode
  onClick?: () => void
  ariaLabel?: string
}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 transition"
  >
    {children}
  </button>
)

export default function AppHeader({ title, subtitle, backTo, actions }: AppHeaderProps) {
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)
  const { logout, isTrialAtivo } = useAuth()

  const handleLogout = () => {
    logout()
    setMenuAberto(false)
    navigate('/login')
  }

  const linksRapidos = [
    { label: 'Meu Plano', path: '/meu-plano' },
    { label: 'Treinos', path: '/treinos' },
    { label: 'Progresso', path: '/progresso' },
    { label: 'Histórico', path: '/historico' },
    { label: 'Perfil', path: '/perfil' }
  ]

  return (
    <>
      <header className={`sticky z-40 px-5 pt-6 pb-4 flex items-center justify-between bg-[#050505]/95 backdrop-blur border-b border-white/10 ${isTrialAtivo() ? 'top-[60px]' : 'top-0'}`}>
        <div className="flex items-center gap-3">
          {backTo ? (
            <IconButton ariaLabel="Voltar" onClick={() => navigate(backTo)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
          ) : (
            <IconButton ariaLabel="Menu" onClick={() => setMenuAberto(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </IconButton>
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">AthletIA</p>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <IconButton ariaLabel="Ir para o perfil" onClick={() => navigate('/perfil')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35A1.724 1.724 0 005.38 7.753c-.94-1.543.826-3.31 2.37-2.37.996.608 2.297.07 2.574-1.066z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </IconButton>
          {actions ?? (
            <button onClick={handleLogout} className="text-sm text-white/70 hover:text-white transition">
              Sair
            </button>
          )}
        </div>
      </header>

      {menuAberto && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex flex-col" onClick={() => setMenuAberto(false)}>
          <div
            className="bg-dark p-6 rounded-b-3xl space-y-4 shadow-2xl border border-white/10"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Navegação rápida</p>
                <p className="text-lg font-semibold">Para onde vamos?</p>
              </div>
              <IconButton ariaLabel="Fechar menu" onClick={() => setMenuAberto(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </IconButton>
            </div>
            <div className="grid gap-2">
              {linksRapidos.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path)
                    setMenuAberto(false)
                  }}
                  className="w-full text-left px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-primary/10 hover:text-primary transition"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

