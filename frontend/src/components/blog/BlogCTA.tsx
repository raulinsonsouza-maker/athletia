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
    <section className="mt-16 pt-12 border-t border-grey/20">
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-dark rounded-2xl border-2 border-primary/30 p-8 md:p-12 text-center space-y-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-light">
          {title}
        </h2>
        <p className="text-lg md:text-xl text-light-muted max-w-2xl mx-auto">
          {description}
        </p>
        <button
          onClick={handleClick}
          className="btn-primary text-lg md:text-xl px-10 md:px-16 py-5 md:py-6 font-bold shadow-2xl shadow-primary/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
        >
          {buttonText}
        </button>
      </div>
    </section>
  )
}

