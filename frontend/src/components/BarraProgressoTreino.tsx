interface BarraProgressoTreinoProps {
  exercicioAtual: number
  totalExercicios: number
  exerciciosConcluidos: number
}

export default function BarraProgressoTreino({
  exercicioAtual,
  totalExercicios,
  exerciciosConcluidos
}: BarraProgressoTreinoProps) {
  const porcentagem = totalExercicios > 0 ? (exerciciosConcluidos / totalExercicios) * 100 : 0

  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base md:text-lg font-bold text-light">
          Exercício {exercicioAtual} de {totalExercicios}
        </span>
        <span className="text-base md:text-lg font-bold text-primary">
          {Math.round(porcentagem)}%
        </span>
      </div>
      
      {/* Barra de Progresso Grossa */}
      <div className="w-full bg-dark-lighter rounded-full h-4 md:h-5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            porcentagem === 100 ? 'bg-success' : 'bg-primary'
          }`}
          style={{ width: `${porcentagem}%` }}
        ></div>
      </div>
    </div>
  )
}

