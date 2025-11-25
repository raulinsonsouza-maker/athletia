import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { treinoRapidoService, GrupoMuscularCard } from '../services/treino-rapido.service'
import { useToast } from '../hooks/useToast'
import AppHeader from '../components/navigation/AppHeader'
import BottomTabs from '../components/navigation/BottomTabs'

const DURACOES = [20, 30, 40, 50, 60]
const DIFICULDADES = ['Iniciante', 'Intermediário', 'Avançado'] as const
const LOCAIS_TREINO = ['Academia comercial', 'Academia Pequena', 'Sem equipamento', 'Customizado']
const FOCOS_FALLBACK = ['Peito', 'Costas', 'Ombros', 'Quadríceps', 'Glúteos', 'Abdômen']

export default function TreinoRapidoConfiguracao() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast, ToastContainer } = useToast()

  const [duracao, setDuracao] = useState<number>(60)
  const [dificuldade, setDificuldade] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Intermediário')
  const [localTreino, setLocalTreino] = useState<string>('Academia comercial')
  const [corpoTodo, setCorpoTodo] = useState<boolean>(false)
  const [focoMuscular, setFocoMuscular] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [carregandoGrupos, setCarregandoGrupos] = useState(true)
  const [gruposSugestoes, setGruposSugestoes] = useState<GrupoMuscularCard[]>([])

  const gruposMusculares = location.state?.gruposMusculares || []

  useEffect(() => {
    const carregarGrupos = async () => {
      try {
        setCarregandoGrupos(true)
        const resposta = await treinoRapidoService.listarGrupos()
        setGruposSugestoes(resposta.gruposPrincipais)
      } catch (error) {
        console.error('Erro ao carregar sugestões de grupos:', error)
      } finally {
        setCarregandoGrupos(false)
      }
    }
    carregarGrupos()
  }, [])

  const toggleFoco = (foco: string) => {
    setFocoMuscular((prev) =>
      prev.includes(foco) ? prev.filter((item) => item !== foco) : [...prev, foco]
    )
  }

  const handleCriarTreino = async () => {
    if (!corpoTodo && gruposMusculares.length === 0 && focoMuscular.length === 0) {
      showToast('Selecione grupos musculares ou use corpo todo.', 'error')
      return
    }

    setLoading(true)
    try {
      await treinoRapidoService.criarTreinoRapido({
        gruposMusculares: corpoTodo ? undefined : gruposMusculares,
        duracao,
        dificuldade,
        localTreino,
        focoMuscular: corpoTodo ? undefined : focoMuscular,
        corpoTodo
      })

      showToast('Treino criado com sucesso!', 'success')
      navigate('/treino/atual')
    } catch (error: any) {
      console.error('Erro ao criar treino:', error)
      showToast(error.response?.data?.message || 'Erro ao criar treino rápido', 'error')
    } finally {
      setLoading(false)
    }
  }

  const sugestoesFoco = useMemo(() => {
    if (gruposSugestoes.length > 0) {
      return gruposSugestoes.slice(0, 9)
    }
    return FOCOS_FALLBACK.map((nome, index) => ({
      nome,
      slug: `fallback-${index}`,
      imagemUrl: null
    }))
  }, [gruposSugestoes])

  const gruposSelecionadosChips = gruposMusculares.slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark text-white pb-24">
      <AppHeader title="Configurar treino" backTo="/treino-rapido" />
      <div className="px-5 space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Resumo</p>
              <h2 className="text-lg font-semibold">Sequência personalizada para hoje</h2>
            </div>
            <span className="text-xs text-white/60">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
          {gruposSelecionadosChips.length > 0 ? (
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
          ) : (
            <p className="text-sm text-white/60">
              Nenhum grupo selecionado. Ative &quot;Corpo todo&quot; ou escolha alguns alvos logo abaixo.
            </p>
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
            <button
              onClick={() => setDuracao(0)}
              className={`rounded-2xl py-3 font-semibold border transition ${
                duracao === 0 ? 'border-primary bg-primary/15 text-white' : 'border-white/10 text-white/70'
              }`}
            >
              Customizado
            </button>
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

        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Foco muscular</p>
              <h3 className="text-lg font-semibold">
                {corpoTodo ? 'Corpo todo ativado' : 'Selecione os detalhes do seu treino'}
              </h3>
            </div>
            <label className="flex items-center gap-2 text-sm">
              Corpo todo
              <button
                type="button"
                onClick={() => {
                  const novo = !corpoTodo
                  setCorpoTodo(novo)
                  if (novo) setFocoMuscular([])
                }}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  corpoTodo ? 'bg-primary/70' : 'bg-white/20'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full transition-transform duration-200 translate-y-0.5 ${
                    corpoTodo ? 'translate-x-[22px]' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {!corpoTodo && (
            <div className="grid grid-cols-3 gap-3">
              {sugestoesFoco.map((grupo) => {
                const ativo = focoMuscular.includes(grupo.nome)
                const imagem = grupo.imagemUrl || 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=600&q=80'
                return (
                  <button
                    key={grupo.slug}
                    onClick={() => toggleFoco(grupo.nome)}
                    disabled={carregandoGrupos}
                    className={`relative rounded-2xl overflow-hidden border text-left transition ${
                      ativo ? 'border-primary bg-primary/10 shadow-glow' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="absolute inset-0">
                      <img src={imagem} alt={grupo.nome} className="w-full h-full object-cover opacity-40" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
                    <div className="relative px-3 py-4 space-y-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60">Grupo</p>
                      <p className="text-sm font-semibold">{grupo.nome}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Duração</span>
            <strong className="text-white">{duracao > 0 ? `${duracao} min` : 'Customizada'}</strong>
          </div>
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Dificuldade</span>
            <strong className="text-white">{dificuldade}</strong>
          </div>
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Local</span>
            <strong className="text-white">{localTreino}</strong>
          </div>
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Modo</span>
            <strong className="text-white">{corpoTodo ? 'Corpo todo' : `${focoMuscular.length} focos`}</strong>
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

