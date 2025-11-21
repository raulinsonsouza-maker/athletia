import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { obterResumoDashboard } from '../services/dashboard.service'
import IconeConquista from '../components/IconeConquista'

interface Conquista {
  id: string
  nome: string
  descricao: string
  icone: string
  desbloqueada: boolean
  progresso?: number
  progressoMaximo?: number
}

export default function Conquistas() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [nivel, setNivel] = useState<any>(null)
  const [conquistas, setConquistas] = useState<Conquista[]>([])

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const resumo = await obterResumoDashboard()
      setNivel(resumo.nivel)
      setConquistas(resumo.conquistas)
    } catch (error: any) {
      console.error('Erro ao carregar conquistas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando conquistas...</p>
        </div>
      </div>
    )
  }

  if (!nivel || !conquistas) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-light-muted">Erro ao carregar conquistas</p>
        </div>
      </div>
    )
  }

  const conquistasDesbloqueadas = conquistas.filter(c => c.desbloqueada)
  const conquistasQuaseLa = conquistas.filter(c => !c.desbloqueada && c.progresso && c.progresso > 0)
  const conquistasProximas = conquistas.filter(c => !c.desbloqueada && (!c.progresso || c.progresso === 0))

  return (
    <div className="min-h-screen">
      <Navbar title="Conquistas" />
      
      <main className="container-custom section">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-light mb-2">
            Suas Conquistas
          </h1>
          <p className="text-light-muted">
            Acompanhe seu progresso e desafios completados
          </p>
        </div>

        {/* Nível do Usuário */}
        <div className="card bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-light-muted uppercase tracking-wider mb-1">Seu Nível</div>
              <h2 className="text-3xl font-bold text-primary">
                Nível {nivel.nivel} – {nivel.nome}
              </h2>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{nivel.progresso}%</div>
              <div className="text-xs text-light-muted">para próximo nível</div>
            </div>
          </div>

          {/* Barra de Progresso do Nível */}
          <div className="w-full bg-dark-lighter rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
              style={{ width: `${nivel.progresso}%` }}
            ></div>
          </div>
        </div>

        {/* Conquistas Desbloqueadas */}
        {conquistasDesbloqueadas.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-success/30 to-transparent"></div>
              <h3 className="text-xl font-display font-bold text-success">Desbloqueadas</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-success/30 to-transparent"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {conquistasDesbloqueadas.map((conquista) => (
                <div
                  key={conquista.id}
                  className="card border-success/30 bg-success/10 hover:border-success/50 transition-all text-center"
                >
                  <div className="flex justify-center mb-3">
                    <IconeConquista tipo={conquista.icone} className="w-16 h-16" />
                  </div>
                  <h4 className="text-base font-bold text-light mb-1">{conquista.nome}</h4>
                  <p className="text-xs text-light-muted">{conquista.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conquistas Quase Lá */}
        {conquistasQuaseLa.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-warning/30 to-transparent"></div>
              <h3 className="text-xl font-display font-bold text-warning">Quase Lá</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-warning/30 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conquistasQuaseLa.map((conquista) => {
                const porcentagem = conquista.progressoMaximo 
                  ? Math.round((conquista.progresso! / conquista.progressoMaximo) * 100)
                  : 0
                return (
                  <div
                    key={conquista.id}
                    className="card border-warning/30 bg-warning/10 hover:border-warning/50 transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="opacity-80">
                        <IconeConquista tipo={conquista.icone} className="w-12 h-12" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-light mb-1">{conquista.nome}</h4>
                        <p className="text-sm text-light-muted">{conquista.descricao}</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-light-muted">Progresso</span>
                        <span className="font-bold text-warning">{porcentagem}%</span>
                      </div>
                      <div className="w-full bg-dark-lighter rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-warning to-warning/80 rounded-full transition-all duration-500"
                          style={{ width: `${porcentagem}%` }}
                        ></div>
                      </div>
                    </div>
                    {conquista.progressoMaximo && (
                      <p className="text-xs text-light-muted text-center">
                        {conquista.progresso} de {conquista.progressoMaximo}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Próximos Desafios */}
        {conquistasProximas.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              <h3 className="text-xl font-display font-bold text-light">Próximos Desafios</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conquistasProximas.map((conquista) => (
                <div
                  key={conquista.id}
                  className="card border-grey/20 bg-dark-lighter/50 opacity-75"
                >
                  <div className="flex items-center gap-4">
                    <div className="opacity-50">
                      <IconeConquista tipo={conquista.icone} className="w-12 h-12" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-light-muted mb-1">{conquista.nome}</h4>
                      <p className="text-sm text-light-muted">{conquista.descricao}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem se não houver conquistas */}
        {conquistasDesbloqueadas.length === 0 && conquistasQuaseLa.length === 0 && conquistasProximas.length === 0 && (
          <div className="card text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <IconeConquista tipo="trophy" className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-light mb-2">Nenhuma conquista ainda</h3>
            <p className="text-light-muted mb-6">
              Complete seus primeiros treinos para desbloquear conquistas!
            </p>
            <button
              onClick={() => navigate('/treino')}
              className="btn-primary"
            >
              Começar a Treinar
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

