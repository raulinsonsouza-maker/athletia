import { useState, useEffect } from 'react'
import { Exercicio } from '../services/exercicio.service'
import { ExercicioTreino } from '../services/treino-personalizado.service'

interface ExercicioFormProps {
  exercicio: Exercicio
  exercicioTreino?: ExercicioTreino
  ordem: number
  onSave: (data: ExercicioTreino) => void
  onCancel: () => void
}

export default function ExercicioForm({
  exercicio,
  exercicioTreino,
  ordem,
  onSave,
  onCancel
}: ExercicioFormProps) {
  const [series, setSeries] = useState(exercicioTreino?.series || 3)
  const [repeticoes, setRepeticoes] = useState(exercicioTreino?.repeticoes || '8-12')
  const [carga, setCarga] = useState(exercicioTreino?.carga || undefined)
  const [descanso, setDescanso] = useState(exercicioTreino?.descanso || 90)
  const [observacoes, setObservacoes] = useState(exercicioTreino?.observacoes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      exercicioId: exercicio.id,
      ordem,
      series,
      repeticoes,
      carga,
      descanso,
      observacoes: observacoes || undefined
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-light mb-4">
            {exercicioTreino ? 'Editar' : 'Adicionar'} Exercício
          </h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-light mb-2">
              {exercicio.nome}
            </h3>
            <p className="text-sm text-light-muted">
              {exercicio.grupoMuscularPrincipal}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">
                Séries *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={series}
                onChange={(e) => setSeries(parseInt(e.target.value) || 1)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label-field">
                Repetições *
              </label>
              <input
                type="text"
                value={repeticoes}
                onChange={(e) => setRepeticoes(e.target.value)}
                placeholder="Ex: 8-12 ou 10"
                className="input-field"
                required
              />
              <p className="text-xs text-light-muted mt-1">
                Pode ser um intervalo (8-12) ou número fixo (10)
              </p>
            </div>

            <div>
              <label className="label-field">
                Carga (kg) - Opcional
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={carga || ''}
                onChange={(e) => setCarga(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-field">
                Descanso (segundos) *
              </label>
              <input
                type="number"
                min="0"
                value={descanso}
                onChange={(e) => setDescanso(parseInt(e.target.value) || 0)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label-field">
                Observações - Opcional
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                {exercicioTreino ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

