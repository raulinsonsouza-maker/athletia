import { useEffect, useState } from 'react'
import { TreinoCompleto } from '../types/treino.types'
import { buscarHistoricoTreinos } from '../services/treino.service'
import AppHeader from '../components/navigation/AppHeader'
import BottomTabs from '../components/navigation/BottomTabs'
import { useAuth } from '../contexts/AuthContext'

type Treino = TreinoCompleto

export default function Historico() {
  const { isTrialAtivo } = useAuth()
  const [treinos, setTreinos] = useState<Treino[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const formatarData = (iso: string) => {
    const data = new Date(iso)
    return data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark text-white pb-28">
      <AppHeader title="Histórico" />

      <div 
        className="px-5 space-y-6" 
        style={{ 
          paddingTop: isTrialAtivo() 
            ? 'calc(var(--trial-header-height, 60px) + 6rem)' 
            : '1.5rem' 
        }}
      >
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

        {!loading && treinos.length === 0 && (
          <div className="text-center text-white/60 py-16 bg-white/5 border border-white/10 rounded-3xl">
            Nenhum treino no histórico.
          </div>
        )}

        {!loading && treinos.length > 0 && (
          <div className="space-y-4">
            {treinos.map((treino) => {
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
