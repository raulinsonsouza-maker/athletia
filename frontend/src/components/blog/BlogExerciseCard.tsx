interface BlogExerciseCardProps {
  name: string
  primaryMuscle?: string
  secondaryMuscles?: string[]
  instructions?: string[]
  tips?: string[]
  popularity?: 'Muito popular' | 'Popular' | 'Intermediário'
  demoUrl?: string
}

/**
 * Componente para destacar exercícios mencionados nos artigos
 * Similar ao padrão Befit, mas mantendo o design dark do AthletIA
 */
export default function BlogExerciseCard({
  name,
  primaryMuscle,
  secondaryMuscles = [],
  instructions = [],
  tips = [],
  popularity,
  demoUrl
}: BlogExerciseCardProps) {
  return (
    <div className="blog-exercise-card bg-dark-lighter rounded-xl border border-grey/20 p-6 my-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-light mb-2">
            {name}
          </h3>
          {primaryMuscle && (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Primário
                </span>
                <span className="text-sm text-light-muted">{primaryMuscle}</span>
              </div>
              {secondaryMuscles.length > 0 && (
                <>
                  <span className="text-light-muted">•</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-light-muted uppercase tracking-wide">
                      Secundário
                    </span>
                    <span className="text-sm text-light-muted">
                      {secondaryMuscles.join(', ')}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {popularity && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
            {popularity}
          </span>
        )}
      </div>

      {/* Instruções */}
      {instructions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-bold text-light mb-3">Instruções</h4>
          <ol className="space-y-2 text-light-muted">
            {instructions.map((instruction, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">{index + 1}.</span>
                <span className="leading-relaxed">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Dicas Importantes */}
      {tips.length > 0 && (
        <div className="mt-6 pt-6 border-t border-grey/20">
          <h4 className="text-lg font-bold text-light mb-3">Dicas importantes</h4>
          <ul className="space-y-2 text-light-muted">
            {tips.map((tip, index) => (
              <li key={index} className="flex gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Link para demonstração */}
      {demoUrl && (
        <div className="mt-6 pt-6 border-t border-grey/20">
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ver demonstração
          </a>
        </div>
      )}
    </div>
  )
}
