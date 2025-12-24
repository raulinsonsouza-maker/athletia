import { useEffect, useMemo, useState } from 'react'
import { TreinoCompleto } from '../types/treino.types'
import { buscarHistoricoTreinos } from '../services/treino.service'
import AppHeader from '../components/navigation/AppHeader'
import BottomTabs from '../components/navigation/BottomTabs'

type Treino = TreinoCompleto

export default function Historico() {
  const [treinos, setTreinos] = useState<Treino[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'todos' | 'concluido' | 'perdido'>('todos')

  useEffect(() => {
    carregarHistorico()
  }, [])

  const carregarHistorico = async () => {
    try {
      setLoading(true)
      setError('')
      const treinos = await buscarHistoricoTreinos(30)
      setTreinos(treinos || [])
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao carregar histórico'
      setError(errorMessage)
      setTreinos([])
    } finally {
      setLoading(false)
    }
  }

  const obterStatus = (treino: Treino) => {
    if (treino.concluido) return 'concluido'
    const dataTreino = new Date(treino.data)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    return dataTreino < hoje ? 'perdido' : 'planejado'
  }

  const treinosFiltrados = useMemo(() => {
    return treinos.filter((treino) => {
      if (filtro !== 'todos' && obterStatus(treino) !== filtro) {
        return false
      }
      if (busca) {
        const nome = treino.nome || treino.tipo || ''
        if (!nome.toLowerCase().includes(busca.toLowerCase())) {
          return false
        }
      }
      return true
    })
  }, [treinos, filtro, busca])

  const formatarData = (iso: string) => {
    const data = new Date(iso)
    return data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark text-white pb-28">
      <AppHeader title="Histórico" backTo="/meu-plano" />

      <div className="px-5 space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 flex items-center gap-3 bg-dark/60 border border-white/10 rounded-2xl px-4 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5 text-white/60"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou tipo"
                className="flex-1 bg-transparent outline-none text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-2">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'concluido', label: 'Concluídos' },
                { id: 'perdido', label: 'Perdidos' }
              ].map((opcao) => (
                <button
                  key={opcao.id}
                  onClick={() => setFiltro(opcao.id as typeof filtro)}
                  className={`px-4 py-2 rounded-full border text-sm ${
                    filtro === opcao.id ? 'border-primary bg-primary/20 text-primary' : 'border-white/20 text-white/70'
                  }`}
                >
                  {opcao.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/50">
            {treinosFiltrados.length} de {treinos.length} treinos exibidos.
          </p>
        </section>

        {error && (
          <div className="bg-error/10 border border-error/40 text-error rounded-3xl px-4 py-3">
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-24 bg-white/5 border border-white/10 rounded-3xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && treinosFiltrados.length === 0 && (
          <div className="text-center text-white/60 py-16 bg-white/5 border border-white/10 rounded-3xl">
            Nenhum treino encontrado para os filtros atuais.
          </div>
        )}

        {!loading && treinosFiltrados.length > 0 && (
          <div className="space-y-4">
            {treinosFiltrados.map((treino) => {
              const status = obterStatus(treino)
              const totalExercicios = treino.exercicios?.length || 0
              return (
                <div key={treino.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">{formatarData(treino.data)}</p>
                      <p className="text-lg font-semibold">{treino.nome || 'Treino inteligente'}</p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        status === 'concluido'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/60'
                          : 'bg-amber-500/20 text-amber-200 border border-amber-400/60'
                      }`}
                    >
                      {status === 'concluido' ? 'Concluído' : 'Perdido'}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-white/70 flex-wrap">
                    <span>{treino.exercicios ? `${totalExercicios} exercícios` : 'Sem exercícios'}</span>
                    {treino.tempoEstimado && <span>{treino.tempoEstimado} min estimados</span>}
                    <span>Origem: {treino.criadoPor === 'IA' ? 'Inteligência' : 'Manual'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomTabs active="historico" />
    </div>
  )
}
