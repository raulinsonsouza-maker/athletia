import IconeConquista from './IconeConquista'

interface Conquista {
  id: string
  nome: string
  descricao: string
  icone: string
  desbloqueada: boolean
  progresso?: number
  progressoMaximo?: number
}

interface ConquistasProps {
  nivel: {
    nivel: number
    nome: string
    progresso: number
    proximoNivel: number
  }
  conquistas: Conquista[]
}

export default function Conquistas({ nivel, conquistas }: ConquistasProps) {
  const conquistasDesbloqueadas = conquistas.filter(c => c.desbloqueada)
  const conquistasBloqueadas = conquistas.filter(c => !c.desbloqueada)

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <h3 className="text-xl font-display font-bold text-light">Suas Conquistas</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </div>

      {/* Nível do Usuário */}
      <div className="card bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-light-muted uppercase tracking-wider mb-1">Seu Nível</div>
            <h4 className="text-2xl font-bold text-primary">
              Nível {nivel.nivel} – {nivel.nome}
            </h4>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{nivel.progresso}%</div>
            <div className="text-xs text-light-muted">para próximo nível</div>
          </div>
        </div>

        {/* Barra de Progresso do Nível */}
        <div className="w-full bg-dark-lighter rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
            style={{ width: `${nivel.progresso}%` }}
          ></div>
        </div>
        <p className="text-xs text-light-muted mt-2 text-center">
          {nivel.progresso < 100 
            ? `${nivel.proximoNivel - (nivel.nivel === 1 ? 0 : nivel.nivel === 2 ? 5 : nivel.nivel === 3 ? 15 : nivel.nivel === 4 ? 30 : nivel.nivel === 5 ? 50 : 100)} treinos para o próximo nível`
            : 'Nível máximo alcançado!'}
        </p>
      </div>

      {/* Conquistas Desbloqueadas */}
      {conquistasDesbloqueadas.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-bold text-light mb-4">Conquistas Desbloqueadas</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {conquistasDesbloqueadas.map((conquista) => (
              <div
                key={conquista.id}
                className="card border-success/30 bg-success/10 hover:border-success/50 transition-all text-center"
              >
                <div className="flex justify-center mb-2">
                  <IconeConquista tipo={conquista.icone} className="w-12 h-12" />
                </div>
                <h5 className="text-sm font-bold text-light mb-1">{conquista.nome}</h5>
                <p className="text-xs text-light-muted">{conquista.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conquistas Bloqueadas */}
      {conquistasBloqueadas.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-light mb-4">Próximas Conquistas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conquistasBloqueadas.map((conquista) => (
              <div
                key={conquista.id}
                className="card border-grey/20 bg-dark-lighter/50 opacity-75"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="opacity-50">
                    <IconeConquista tipo={conquista.icone} className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-bold text-light-muted mb-1">{conquista.nome}</h5>
                    <p className="text-xs text-light-muted">{conquista.descricao}</p>
                  </div>
                </div>
                {conquista.progresso !== undefined && conquista.progressoMaximo !== undefined && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-light-muted mb-1">
                      <span>Progresso</span>
                      <span>{conquista.progresso}/{conquista.progressoMaximo}</span>
                    </div>
                    <div className="w-full bg-dark rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary/30 rounded-full transition-all"
                        style={{ width: `${(conquista.progresso / conquista.progressoMaximo) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

