import { useNavigate } from 'react-router-dom'
import ModoTreinoToggle from './ModoTreinoToggle'
import { ModoTreino } from '../services/modo-treino.service'

interface HeroSectionProps {
  nome: string
  treinoHoje: any | null
  modoTreino: ModoTreino
  onModoChange?: (modo: ModoTreino) => void
  loading?: boolean
}

export default function HeroSection({ 
  nome, 
  treinoHoje, 
  modoTreino, 
  onModoChange,
  loading = false 
}: HeroSectionProps) {
  const navigate = useNavigate()

  const getSaudacao = () => {
    const hora = new Date().getHours()
    if (hora < 12) return 'Bom dia'
    if (hora < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const formatarData = () => {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const getGruposMusculares = () => {
    if (!treinoHoje?.exercicios) return null
    
    const grupos = new Set<string>()
    treinoHoje.exercicios.forEach((ex: any) => {
      if (ex.exercicio?.grupoMuscularPrincipal) {
        const grupo = ex.exercicio.grupoMuscularPrincipal
        if (grupo !== 'Cardio' && grupo !== 'Flexibilidade') {
          grupos.add(grupo)
        }
      }
    })
    
    return Array.from(grupos).slice(0, 3).join(', ')
  }

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-dark-lighter border-2 border-primary/30 mb-8 p-6 md:p-8 shadow-lg shadow-primary/10">
        <div className="text-center py-12">
          <div className="spinner h-8 w-8 mx-auto mb-3"></div>
          <p className="text-light-muted text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-dark-lighter border-2 border-primary/30 mb-8 p-6 md:p-8 shadow-lg shadow-primary/10">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-0"></div>

      <div className="relative z-10">
        {/* Saudação e Modo de Treino */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-light mb-2">
              {getSaudacao()}, {nome.split(' ')[0]}!
            </h1>
            <p className="text-light-muted text-sm md:text-base">
              {formatarData()}
            </p>
          </div>
          <div className="hidden md:block">
            <ModoTreinoToggle onModoChange={onModoChange} />
          </div>
        </div>

        {/* Modo de Treino Mobile */}
        <div className="md:hidden mb-6">
          <ModoTreinoToggle onModoChange={onModoChange} />
        </div>

        {/* Treino do Dia */}
        {treinoHoje ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-light-muted mb-2">Hoje é dia de treino:</p>
              <div className="flex items-center gap-3 mb-4">
                {treinoHoje.letraTreino && (
                  <div className="w-14 h-14 rounded-xl bg-primary text-dark flex items-center justify-center font-bold text-2xl shadow-lg">
                    {treinoHoje.letraTreino}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-display font-bold text-light mb-1">
                    {treinoHoje.nome || 'Treino do Dia'}
                  </h2>
                  {getGruposMusculares() && (
                    <p className="text-sm text-light-muted">
                      {getGruposMusculares()}
                    </p>
                  )}
                </div>
                {treinoHoje.concluido && (
                  <span className="badge-success flex items-center gap-2 px-4 py-2 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Concluído
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-dark/60 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
                <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Exercícios</div>
                <div className="text-2xl md:text-3xl font-bold text-primary">{treinoHoje.exercicios?.length || 0}</div>
              </div>
              <div className="bg-dark/60 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
                <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Tempo</div>
                <div className="text-2xl md:text-3xl font-bold text-light">{treinoHoje.tempoEstimado || 60} min</div>
              </div>
              <div className="bg-dark/60 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
                <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Status</div>
                <div className="text-lg font-bold text-light">
                  {treinoHoje.concluido ? 'Finalizado' : 'Pendente'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                // Se treino concluído, ir para histórico. Caso contrário, ir para treino do dia
                if (treinoHoje.concluido) {
                  navigate('/historico')
                } else {
                  navigate('/treino')
                }
              }}
              className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
            >
              {treinoHoje.concluido ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ver Detalhes no Histórico
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  COMEÇAR TREINO AGORA
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-light mb-2">
              Nenhum treino programado para hoje
            </h3>
            <p className="text-light-muted mb-6 max-w-md mx-auto">
              {modoTreino === 'IA' 
                ? 'Gere seu treino personalizado agora e comece a treinar!'
                : 'Crie seu treino manual ou altere para modo IA para gerar automaticamente.'}
            </p>
            <button
              onClick={() => {
                if (modoTreino === 'IA') {
                  navigate('/treino')
                } else {
                  navigate('/meus-treinos')
                }
              }}
              className="btn-primary px-8 py-3 flex items-center justify-center gap-2 mx-auto text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {modoTreino === 'IA' ? 'Gerar Treino do Dia' : 'Criar Treino Manual'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

