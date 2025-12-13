interface BlogLocationBoxProps {
  title?: string
  locations: string[]
}

/**
 * Componente para listar "Melhores locais" ou informações complementares
 * Similar ao padrão Befit, mas mantendo o design dark do AthletIA
 */
export default function BlogLocationBox({ 
  title = 'Melhores locais',
  locations 
}: BlogLocationBoxProps) {
  return (
    <div className="blog-location-box bg-dark-lighter rounded-xl border border-grey/20 p-6 my-6">
      <h4 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {title}
      </h4>
      <ul className="space-y-3">
        {locations.map((location, index) => (
          <li key={index} className="flex items-start gap-3 text-light-muted">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="leading-relaxed">{location}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
