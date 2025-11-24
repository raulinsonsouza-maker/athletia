import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obterHomeTreinos } from '../services/treino.service'
import { TreinoHomeResponse, TreinoCardResumo, RecursoPersonalizado } from '../types/treino.types'
import { useToast } from '../hooks/useToast'

const formatarDuracao = (minutos: number) => `${minutos} min`

const CardRecurso = ({ recurso, onNavigate }: { recurso: RecursoPersonalizado; onNavigate: (destino: string) => void }) => (
  <button
    onClick={() => onNavigate(recurso.destino)}
    className="bg-dark-lighter rounded-3xl px-5 py-6 flex flex-col gap-2 text-left hover:bg-dark/80 transition-all"
  >
    <div className="w-10 h-10 rounded-full bg-dark flex items-center justify-center text-white/80">
      {recurso.icone === 'zap' ? '⚡' : '📋'}
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

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await obterHomeTreinos()
        setDados(response)
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

  return (
    <div className="min-h-screen bg-dark text-white pb-24">
      <div className="px-5 pt-10 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Treinos</h1>
            <p className="text-light-muted text-sm">Planos personalizados para seu objetivo</p>
          </div>
          <button className="w-12 h-12 rounded-full bg-dark-lighter flex items-center justify-center text-lg">
            ☆
          </button>
        </header>

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

            {dados.secoes.map((secao) => (
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

      <ToastContainer />
    </div>
  )
}

