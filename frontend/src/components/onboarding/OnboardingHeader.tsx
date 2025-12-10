interface OnboardingHeaderProps {
  step?: number
}

export default function OnboardingHeader({}: OnboardingHeaderProps) {
  return (
    <div className="w-full py-4 md:py-5 px-4 md:px-6 border-b border-grey/30 bg-dark/95 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center">
          <div className="flex items-center gap-2.5 md:gap-3">
            <img
              src="/favicon.svg"
              alt="Logo AthletIA - Treino Personalizado Inteligente com IA"
              className="w-8 h-8 md:w-10 md:h-10 rounded-2xl shadow-lg"
              loading="eager"
              width="40"
              height="40"
            />
            <div className="text-lg md:text-xl font-display font-bold text-primary">AthletIA</div>
          </div>
        </div>
      </div>
    </div>
  )
}

