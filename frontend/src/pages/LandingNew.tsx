import { useNavigate } from 'react-router-dom'
import HeroSection from '../components/landing-new/HeroSection'
import StatisticsSection from '../components/landing-new/StatisticsSection'
import FeaturesSection from '../components/landing-new/FeaturesSection'
import HowItWorksSection from '../components/landing-new/HowItWorksSection'
import TestimonialsSection from '../components/landing-new/TestimonialsSection'
import CTASection from '../components/landing-new/CTASection'

export default function LandingNew() {
  const navigate = useNavigate()

  const handleStartOnboarding = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark text-light">
      {/* Header */}
      <header className="w-full py-4 md:py-5 px-4 md:px-6 border-b border-grey/30 sticky top-0 z-50 bg-dark/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 md:gap-3">
            <img
              src="/favicon.svg"
              alt="Logo AthletIA"
              className="w-8 h-8 md:w-10 md:h-10 rounded-2xl shadow-lg"
              loading="eager"
              width="40"
              height="40"
            />
            <div className="text-lg md:text-xl font-display font-bold tracking-tight text-light">
              AthletIA
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-sm md:text-base font-semibold bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-dark px-4 py-2 md:px-5 md:py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Entrar
          </button>
        </div>
      </header>

      <main role="main" id="main-content" aria-label="Conteúdo principal da landing page">
        <HeroSection onStartOnboarding={handleStartOnboarding} />
        <StatisticsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection onStartOnboarding={handleStartOnboarding} />
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 border-t border-grey/20 bg-dark-lighter/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/favicon.svg"
                  alt="Logo AthletIA"
                  className="w-8 h-8 rounded-xl"
                />
                <span className="text-lg font-display font-bold text-light">AthletIA</span>
              </div>
              <p className="text-light-muted">
                Transforme seu corpo com treinos personalizados por IA.
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold text-light mb-4">Links</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate('/termos')}
                    className="text-light-muted hover:text-primary transition-colors"
                  >
                    Termos de Uso
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/privacidade')}
                    className="text-light-muted hover:text-primary transition-colors"
                  >
                    Privacidade
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/cookies')}
                    className="text-light-muted hover:text-primary transition-colors"
                  >
                    Cookies
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-light mb-4">Contato</h4>
              <p className="text-light-muted">
                Dúvidas? Entre em contato através do chat do aplicativo.
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-grey/20 text-center text-light-muted text-sm">
            <p>&copy; {new Date().getFullYear()} AthletIA. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

