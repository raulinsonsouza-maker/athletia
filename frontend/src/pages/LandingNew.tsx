import { useNavigate } from 'react-router-dom'
import HeroSection from '../components/landing-new/HeroSection'
import StatisticsSection from '../components/landing-new/StatisticsSection'
import FeaturesSection from '../components/landing-new/FeaturesSection'
import HowItWorksSection from '../components/landing-new/HowItWorksSection'
import TestimonialsSection from '../components/landing-new/TestimonialsSection'
import CTASection from '../components/landing-new/CTASection'
import FAQSection from '../components/landing-new/FAQSection'

export default function LandingNew() {
  const navigate = useNavigate()

  const handleStartOnboarding = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark text-light">
      {/* Header minimalista - foco em conversão */}
      <header className="w-full py-4 md:py-5 px-4 md:px-6 border-b border-grey/30 sticky top-0 z-50 bg-dark/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
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
        </div>
      </header>

      <main role="main" id="main-content" aria-label="Conteúdo principal da landing page">
        <HeroSection onStartOnboarding={handleStartOnboarding} />
        <StatisticsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection onStartOnboarding={handleStartOnboarding} />
      </main>

      {/* Footer minimalista - foco em conversão */}
      <footer className="py-8 px-4 md:px-6 border-t border-grey/20 bg-dark-lighter/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-light-muted">
            &copy; {new Date().getFullYear()} AthletIA. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

