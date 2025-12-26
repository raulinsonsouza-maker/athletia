import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { treinoRapidoService } from '../services/treino-rapido.service'
import { useToast } from '../hooks/useToast'
import AppHeader from '../components/navigation/AppHeader'
import BottomTabs from '../components/navigation/BottomTabs'
import { useAuth } from '../contexts/AuthContext'

const DURACOES = [20, 30, 40, 50, 60]
const DIFICULDADES = ['Iniciante', 'Intermediário', 'Avançado'] as const
const LOCAIS_TREINO = ['Academia comercial', 'Academia Pequena', 'Sem equipamento']

export default function TreinoRapidoConfiguracao() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast, ToastContainer } = useToast()
  const { isTrialAtivo } = useAuth()

  const [duracao, setDuracao] = useState<number>(60)
  const [dificuldade, setDificuldade] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Intermediário')
  const [localTreino, setLocalTreino] = useState<string>('Academia comercial')
  const [loading, setLoading] = useState(false)

  const gruposMusculares = location.state?.gruposMusculares || []

  useEffect(() => {
    // Se vier direto para esta tela sem selecionar grupos antes, voltar
    if (!location.state || !gruposMusculares.length) {
      navigate('/treino-rapido', { replace: true })
    }
  }, [location.state, gruposMusculares.length, navigate])

  const handleCriarTreino = async () => {
    if (gruposMusculares.length === 0) {
      showToast('Selecione ao menos um grupo muscular na etapa anterior.', 'error')
      return
    }

    setLoading(true)
    try {
      const treinoCriado = await treinoRapidoService.criarTreinoRapido({
        gruposMusculares,
        duracao,
        dificuldade,
        localTreino
      })

      showToast('Treino criado com sucesso!', 'success')

      // Se o backend retornou o treino criado, navegar diretamente para ele
      const treinoId = (treinoCriado as any)?.id
      if (treinoId) {
        navigate(`/treino/atual?treino=${treinoId}`)
      } else {
        // Fallback: manter comportamento antigo
        navigate('/treino/atual')
      }
    } catch (error: any) {
      console.error('Erro ao criar treino:', error)
      showToast(error.response?.data?.message || 'Erro ao criar treino rápido', 'error')
    } finally {
      setLoading(false)
    }
  }

  const gruposSelecionadosChips = gruposMusculares.slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark text-white pb-24">
      <AppHeader title="Configurar treino" backTo="/treino-rapido" />
      <div 
        className="px-5 space-y-6" 
        style={{ 
          paddingTop: isTrialAtivo() 
            ? 'calc(var(--trial-header-height, 60px) + 6rem)' 
            : '1.5rem' 
        }}
      >
        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Resumo</p>
              <h2 className="text-lg font-semibold">Sequência personalizada para hoje</h2>
            </div>
            <span className="text-xs text-white/60">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
          {gruposSelecionadosChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {gruposSelecionadosChips.map((grupo: string) => (
                <span key={grupo} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {grupo}
                </span>
              ))}
              {gruposMusculares.length > gruposSelecionadosChips.length && (
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs">
                  +{gruposMusculares.length - gruposSelecionadosChips.length}
                </span>
              )}
            </div>
          )}
        </section>

        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Duração do treino</p>
          <div className="grid grid-cols-3 gap-3">
            {DURACOES.map((item) => {
              const ativo = duracao === item
              return (
                <button
                  key={item}
                  onClick={() => setDuracao(item)}
                  className={`rounded-2xl py-3 font-semibold border transition ${
                    ativo ? 'border-primary bg-primary/15 text-white' : 'border-white/10 text-white/70'
                  }`}
                >
                  {item} min
                </button>
              )
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Dificuldade</p>
            <div className="grid grid-cols-3 gap-3">
              {DIFICULDADES.map((nivel) => {
                const ativo = dificuldade === nivel
                return (
                  <button
                    key={nivel}
                    onClick={() => setDificuldade(nivel)}
                    className={`rounded-2xl py-3 font-semibold border transition ${
                      ativo ? 'border-primary bg-primary/15 text-white' : 'border-white/10 text-white/70'
                    }`}
                  >
                    {nivel}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Local do treino</p>
            <div className="grid grid-cols-2 gap-3">
              {LOCAIS_TREINO.map((local) => {
                const ativo = localTreino === local
                return (
                  <button
                    key={local}
                    onClick={() => setLocalTreino(local)}
                    className={`rounded-2xl py-3 px-4 text-left font-semibold border transition ${
                      ativo ? 'border-primary bg-primary/15 text-white' : 'border-white/10 text-white/70'
                    }`}
                  >
                    {local}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Duração</span>
            <strong className="text-white">{`${duracao} min`}</strong>
          </div>
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Dificuldade</span>
            <strong className="text-white">{dificuldade}</strong>
          </div>
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Local</span>
            <strong className="text-white">{localTreino}</strong>
          </div>
          <button
            onClick={handleCriarTreino}
            disabled={loading}
            className={`w-full mt-4 py-4 rounded-full font-semibold text-lg transition ${
              loading ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-primary text-dark shadow-glow'
            }`}
          >
            {loading ? 'Gerando treino...' : 'Criar um novo treino rápido'}
          </button>
        </section>
      </div>
      <BottomTabs active="treinos" />
      <ToastContainer />
    </div>
  )
}

