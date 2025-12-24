import { useNavigate } from 'react-router-dom'

interface BlogCTAProps {
  title: string
  description: string
  buttonText: string
  link?: string
}

export default function BlogCTA({ title, description, buttonText, link }: BlogCTAProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    // Disparar evento de conversão do Google Ads
    if (typeof window !== 'undefined' && (window as any).gtag_report_conversion) {
      (window as any).gtag_report_conversion()
    }
    
    // Todos os CTAs devem levar para o step 1 do onboarding
    const onboardingLink = '/?start=true'
    
    if (link && link.startsWith('http')) {
      window.open(link, '_blank')
    } else {
      navigate(onboardingLink)
    }
  }

  return (
    <section className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-grey/20">
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-dark rounded-2xl border-2 border-primary/30 p-6 md:p-10 lg:p-12 text-center space-y-5 md:space-y-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-light">
          {title}
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-light-muted max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
        <button
          onClick={handleClick}
          className="btn-primary text-base md:text-lg lg:text-xl px-8 md:px-12 lg:px-16 py-4 md:py-5 lg:py-6 font-bold shadow-2xl shadow-primary/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
        >
          {buttonText}
        </button>
      </div>
    </section>
  )
}

