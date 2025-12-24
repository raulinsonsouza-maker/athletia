import { useNavigate, useLocation } from 'react-router-dom'

export default function BlogHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const isBlogPage = location.pathname.startsWith('/blog')

  return (
    <header className="w-full py-4 md:py-6 px-4 md:px-6 border-b border-grey/20 sticky top-0 z-50 bg-dark/98 backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-3 md:gap-4 cursor-pointer group"
          onClick={() => navigate(isBlogPage ? '/blog' : '/')}
        >
          <div className="relative">
            <img
              src="/favicon.svg"
              alt="Logo AthletIA - Treino Personalizado Inteligente com IA"
              className="w-10 h-10 md:w-12 md:h-12 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-200"
              loading="eager"
              width="48"
              height="48"
            />
            <div className="absolute inset-0 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          <div className="flex flex-col">
            <div className="text-xl md:text-2xl font-display font-bold tracking-tight text-light group-hover:text-primary transition-colors">
              AthletIA
            </div>
            {isBlogPage && (
              <div className="text-xs text-light-muted font-medium">Blog</div>
            )}
          </div>
        </div>
        <nav className="flex items-center gap-2 md:gap-3">
          {!isBlogPage && (
            <button
              onClick={() => navigate('/blog')}
              className="text-sm md:text-base font-medium text-light-muted hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-primary/10"
            >
              Blog
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="text-sm md:text-base font-medium text-light-muted hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-primary/10 hidden sm:block"
          >
            Início
          </button>
          <button
            onClick={() => {
              // Disparar evento de conversão do Google Ads
              if (typeof window !== 'undefined' && (window as any).gtag_report_conversion) {
                (window as any).gtag_report_conversion()
              }
              navigate('/?start=true')
            }}
            className="text-sm md:text-base font-bold bg-primary text-dark hover:bg-primary-dark border-2 border-primary px-4 md:px-6 py-2.5 md:py-3 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30 whitespace-nowrap"
          >
            Criar meu treino
          </button>
        </nav>
      </div>
    </header>
  )
}

