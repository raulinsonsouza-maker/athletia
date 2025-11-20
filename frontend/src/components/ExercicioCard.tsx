import { Exercicio } from '../services/exercicio.service'

interface ExercicioCardProps {
  exercicio: Exercicio
  onSelect: (exercicio: Exercicio) => void
  selected?: boolean
}

export default function ExercicioCard({ exercicio, onSelect, selected }: ExercicioCardProps) {
  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Iniciante':
        return 'bg-green-500/20 text-green-400'
      case 'Intermediário':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'Avançado':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const gifUrl = exercicio.gifUrl 
    ? exercicio.gifUrl.startsWith('http') 
      ? exercicio.gifUrl 
      : `http://localhost:3001${exercicio.gifUrl}`
    : null

  return (
    <button
      onClick={() => onSelect(exercicio)}
      className={`card text-left transition-all h-[140px] flex ${
        selected 
          ? 'border-primary bg-primary/10' 
          : 'hover:border-primary/50'
      }`}
    >
      <div className="flex gap-4 w-full">
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-dark-lighter">
          {gifUrl ? (
            <img
              src={gifUrl}
              alt={exercicio.nome}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-10 h-10 text-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-light mb-2 truncate">
              {exercicio.nome}
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                {exercicio.grupoMuscularPrincipal}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${getNivelColor(exercicio.nivelDificuldade)}`}>
                {exercicio.nivelDificuldade}
              </span>
            </div>
          </div>
          <div>
            {exercicio.descricao ? (
              <p className="text-xs text-light-muted line-clamp-2">
                {exercicio.descricao}
              </p>
            ) : (
              <p className="text-xs text-light-muted italic">
                Sem descrição disponível
              </p>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

