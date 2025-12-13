import { useNavigate } from 'react-router-dom'

export default function BlogHeader() {
  const navigate = useNavigate()

  return (
    <header className="w-full py-4 md:py-5 px-4 md:px-6 border-b border-grey/30 sticky top-0 z-50 bg-dark/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-2.5 md:gap-3 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img
            src="/favicon.svg"
            alt="Logo AthletIA - Treino Personalizado Inteligente com IA"
            className="w-8 h-8 md:w-10 md:h-10 rounded-2xl shadow-lg"
            loading="eager"
            width="40"
            height="40"
          />
          <div className="text-lg md:text-xl font-display font-bold tracking-tight text-light">
            AthletIA
          </div>
        </div>
        <nav className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => navigate('/blog')}
            className="text-sm md:text-base font-medium text-light-muted hover:text-primary transition-colors px-3 py-1.5"
          >
            Blog
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-sm md:text-base font-medium text-light-muted hover:text-primary transition-colors px-3 py-1.5"
          >
            Início
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-sm md:text-base font-medium text-light-muted hover:text-primary transition-colors px-3 py-1.5"
          >
            Entrar
          </button>
        </nav>
      </div>
    </header>
  )
}

