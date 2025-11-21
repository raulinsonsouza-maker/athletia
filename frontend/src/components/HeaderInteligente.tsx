import { useNavigate } from 'react-router-dom'

interface HeaderInteligenteProps {
  nome: string
  treinoHoje: any | null
}

export default function HeaderInteligente({ nome, treinoHoje }: HeaderInteligenteProps) {
  const navigate = useNavigate()

  const getSaudacao = () => {
    const hora = new Date().getHours()
    if (hora < 12) return 'Bom dia'
    if (hora < 18) return 'Boa tarde'
    return 'Boa noite'
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

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-dark-lighter border-2 border-primary/30 mb-8 p-6 md:p-8 shadow-lg shadow-primary/10">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-0"></div>

      <div className="relative z-10">
        {/* Saudação */}
        <h1 className="text-2xl md:text-3xl font-display font-bold text-light mb-4">
          {getSaudacao()}, {nome.split(' ')[0]}!
        </h1>

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
              </div>
            </div>

            {/* Botão Principal Gigante */}
            <button
              onClick={() => {
                if (treinoHoje.concluido) {
                  navigate('/historico')
                } else {
                  navigate('/treino')
                }
              }}
              className="w-full btn-primary text-xl py-6 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all font-bold"
            >
              {treinoHoje.concluido ? (
                <>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ver Detalhes no Histórico
                </>
              ) : (
                <>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  COMEÇAR TREINO DO DIA
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
              Gere seu treino personalizado agora e comece a treinar!
            </p>
            <button
              onClick={() => navigate('/treino')}
              className="btn-primary px-8 py-3 flex items-center justify-center gap-2 mx-auto text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Gerar Treino do Dia
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

