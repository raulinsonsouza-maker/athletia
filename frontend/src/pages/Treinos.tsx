import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obterHomeTreinos, obterPlanoAtualResumo } from '../services/treino.service'
import { TreinoHomeResponse, TreinoCardResumo, RecursoPersonalizado } from '../types/treino.types'
import { useToast } from '../hooks/useToast'
import BottomTabs from '../components/navigation/BottomTabs'
import AppHeader from '../components/navigation/AppHeader'
import { obterImagemPorGenero } from '../utils/imagemGenero'

const formatarDuracao = (minutos: number) => `${minutos} min`

const IconZap = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
  </svg>
)

const IconList = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
)

const CardRecurso = ({ recurso, onNavigate }: { recurso: RecursoPersonalizado; onNavigate: (destino: string) => void }) => (
  <button
    onClick={() => onNavigate(recurso.destino)}
    className="bg-dark-lighter rounded-3xl px-5 py-6 flex flex-col gap-2 text-left hover:bg-dark/80 transition-all"
  >
    <div className="w-10 h-10 rounded-full bg-dark flex items-center justify-center text-white/80">
      {recurso.icone === 'zap' ? <IconZap /> : <IconList />}
    </div>
    <div className="text-light font-semibold">{recurso.titulo}</div>
    {recurso.descricao && <p className="text-light-muted text-sm">{recurso.descricao}</p>}
  </button>
)

const CardTreino = ({ item, onNavigate }: { item: TreinoCardResumo; onNavigate?: (id: string) => void }) => (
  <button
    onClick={() => onNavigate && onNavigate(item.id)}
    className="bg-dark-lighter rounded-3xl overflow-hidden text-left w-[260px] flex-shrink-0 hover:scale-[1.01] transition-all"
  >
    <div className="h-40 bg-dark relative">
      <img
        src={item.imagem || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=80'}
        alt={item.titulo}
        className="w-full h-full object-cover opacity-80"
      />
      <span className="absolute top-3 left-3 text-xs uppercase tracking-wide px-3 py-1 rounded-full bg-dark/80 text-white">
        {item.nivel}
      </span>
      {item.totalExercicios !== undefined && (
        <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full bg-dark/70 text-white/90">
          {item.totalExercicios} exercícios
        </span>
      )}
    </div>
    <div className="p-5 flex flex-col gap-2">
      <h3 className="text-light font-semibold text-lg">{item.titulo}</h3>
      <p className="text-light-muted text-sm">
        {formatarDuracao(item.duracao)} • {item.local}
      </p>
      {item.destaque && (
        <p className="text-light-muted text-xs leading-relaxed line-clamp-2">{item.destaque}</p>
      )}
    </div>
  </button>
)

export default function Treinos() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [dados, setDados] = useState<TreinoHomeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [genero, setGenero] = useState<string | null>(null)

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await obterHomeTreinos()
        setDados(response)
        const plano = await obterPlanoAtualResumo()
        setGenero(plano.genero || null)
      } catch (error: any) {
        console.error('Erro ao carregar home de treinos:', error)
        showToast('Não foi possível carregar seus treinos agora.', 'error')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [showToast])

  const handleNavigate = (destino: string) => {
    navigate(destino)
  }

  const skeleton = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="bg-dark-lighter rounded-3xl h-32 animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="bg-dark-lighter rounded-3xl h-48 animate-pulse" />
        ))}
      </div>
    </div>
  )

  const filteredSections =
    dados?.secoes
      ?.map((secao) => ({
        ...secao,
        itens: secao.itens.filter((item) =>
          item.titulo.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter((secao) => secao.itens.length > 0) ?? []

  return (
    <div className="min-h-screen bg-dark text-white pb-24">
      <AppHeader title="Treinos" subtitle="Planos e treinos recomendados" />
      <div className="px-5 pt-2 space-y-8">
        {dados?.destaquePlanoAtual && (
          <section className="rounded-3xl overflow-hidden border border-white/10 bg-white/5">
            <div className="h-44 relative">
              <img
                src={dados.destaquePlanoAtual.imagem || obterImagemPorGenero(genero, 'treinos')}
                alt={dados.destaquePlanoAtual.titulo}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Plano em destaque</p>
                <h2 className="text-2xl font-semibold">{dados.destaquePlanoAtual.titulo}</h2>
                <p className="text-sm text-white/70">
                  {dados.destaquePlanoAtual.duracao} min • {dados.destaquePlanoAtual.local}
                </p>
              </div>
            </div>
            <div className="p-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/treino/atual')}
                className="flex-1 py-3 rounded-full bg-primary text-dark font-semibold text-sm"
              >
                Iniciar plano
              </button>
              <button
                onClick={() => navigate('/meu-plano')}
                className="flex-1 py-3 rounded-full border border-white/20 text-white font-semibold text-sm"
              >
                Ajustar metas
              </button>
            </div>
          </section>
        )}

        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Central de ajustes</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/treino-rapido')}
              className="flex-1 rounded-2xl border border-primary/40 text-left px-4 py-3 hover:bg-primary/10 transition"
            >
              <p className="text-sm text-primary/80">Nova sessão</p>
              <p className="text-lg font-semibold">Criar treino rápido</p>
            </button>
            <button
              onClick={() => navigate('/treino/atual')}
              className="flex-1 rounded-2xl border border-white/20 text-left px-4 py-3 hover:bg-white/10 transition"
            >
              <p className="text-sm text-white/70">Plano ativo</p>
              <p className="text-lg font-semibold">Visualizar/editar</p>
            </button>
          </div>
        </section>

        <div className="space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-3xl px-4 py-3 flex items-center gap-3">
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar treinos ou objetivos"
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/40"
            />
          </div>
        </div>

        {loading && skeleton}

        {!loading && dados && (
          <>
            <section className="space-y-3">
              <h2 className="text-sm uppercase tracking-[0.2em] text-light-muted">Recursos personalizados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dados.recursos.map((recurso) => (
                  <CardRecurso key={recurso.id} recurso={recurso} onNavigate={handleNavigate} />
                ))}
              </div>
            </section>

            {filteredSections.map((secao) => (
              <section key={secao.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm uppercase tracking-[0.2em] text-light-muted">{secao.titulo}</h2>
                    {secao.subtitulo && (
                      <p className="text-light text-base font-semibold">{secao.subtitulo}</p>
                    )}
                  </div>
                  <button className="text-light-muted text-sm">Ver todos</button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {secao.itens.map((item) => (
                    <CardTreino key={item.id} item={item} onNavigate={() => navigate('/treino/atual')} />
                  ))}
                </div>
              </section>
            ))}

            {dados.planosAtivos.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm uppercase tracking-[0.2em] text-light-muted">Planos de treino</h2>
                  <button className="text-light-muted text-sm">Ver todos</button>
                </div>
                <div className="flex flex-col gap-3">
                  {dados.planosAtivos.map((plano) => (
                    <button
                      key={plano.id}
                      onClick={() => navigate('/treino/atual')}
                      className="bg-dark-lighter rounded-3xl overflow-hidden flex"
                    >
                      <div className="w-32 h-28 bg-dark">
                        <img
                          src={plano.imagem || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80'}
                          alt={plano.titulo}
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                      <div className="flex-1 p-4 text-left">
                        <p className="text-xs uppercase text-light-muted">{plano.nivel}</p>
                        <p className="text-light font-semibold text-lg">{plano.titulo}</p>
                        <p className="text-light-muted text-sm">
                          {formatarDuracao(plano.duracao)} • {plano.local}
                        </p>
                        {plano.totalExercicios !== undefined && (
                          <p className="text-light-muted text-xs mt-1">
                            {plano.totalExercicios} exercícios
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <BottomTabs active="treinos" />
      <ToastContainer />
    </div>
  )
}

