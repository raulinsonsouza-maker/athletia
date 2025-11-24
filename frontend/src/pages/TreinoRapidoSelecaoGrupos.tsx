import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast'

const GRUPOS_MUSCULARES = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Quadríceps',
  'Glúteos',
  'Posteriores',
  'Abdômen',
  'Adutores',
  'Trapézio',
  'Panturrilhas',
  'Antebraços',
  'Oblíquos',
  'Lombar',
  'Abdutores'
]

const MUSCLE_GRADIENT =
  'bg-[radial-gradient(circle_at_top,_rgba(249,166,32,0.35),_rgba(249,166,32,0.08)_40%,_transparent)]'

export default function TreinoRapidoSelecaoGrupos() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [selecionados, setSelecionados] = useState<string[]>([])

  const toggleGrupo = (grupo: string) => {
    setSelecionados((prev) =>
      prev.includes(grupo) ? prev.filter((item) => item !== grupo) : [...prev, grupo]
    )
  }

  const handleAvancar = () => {
    if (selecionados.length === 0) {
      showToast('Selecione ao menos um grupo muscular.', 'error')
      return
    }
    navigate('/treino-rapido/configuracao', {
      state: { gruposMusculares: selecionados }
    })
  }

  return (
    <div className="min-h-screen bg-dark text-white flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-[#03121b] rounded-[32px] border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-1">Selecione</p>
            <h1 className="text-2xl font-semibold">Treino Rápido</h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg hover:bg-white/10 transition"
          >
            ×
          </button>
        </div>

        <p className="px-6 text-sm text-white/70">
          Escolha os grupos musculares que deseja trabalhar hoje. Combinaremos com o seu perfil
          para montar um treino equilibrado.
        </p>

        <div className="grid grid-cols-3 gap-4 px-6 py-6 max-h-[60vh] overflow-y-auto">
          {GRUPOS_MUSCULARES.map((grupo) => {
            const ativo = selecionados.includes(grupo)
            return (
              <button
                key={grupo}
                onClick={() => toggleGrupo(grupo)}
                className={`aspect-square rounded-3xl border transition-all duration-200 flex flex-col items-center justify-between py-4 px-3 ${
                  ativo
                    ? 'border-primary/70 bg-primary/10 shadow-[0_0_30px_rgba(249,166,32,0.25)]'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div
                  className={`w-full flex-1 rounded-2xl ${MUSCLE_GRADIENT} border border-white/5 flex items-center justify-center`}
                >
                  <div
                    className={`w-10 h-16 rounded-full border ${
                      ativo ? 'border-primary/40 bg-primary/20' : 'border-white/10 bg-white/5'
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-white mt-3">{grupo}</span>
              </button>
            )
          })}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={handleAvancar}
            className={`w-full py-4 rounded-full font-semibold text-lg ${
              selecionados.length === 0
                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                : 'bg-primary text-dark shadow-glow hover:bg-primary/90'
            } transition`}
            disabled={selecionados.length === 0}
          >
            Criar um novo treino rápido
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

