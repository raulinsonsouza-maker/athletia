import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { obterResumoDashboard, ResumoDashboard } from '../services/dashboard.service'
import { ModoTreino } from '../services/modo-treino.service'
import { atualizarModoTreino } from '../services/modo-treino.service'
import { NotificationService } from '../services/notifications.service'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import ProgressoSemanal from '../components/ProgressoSemanal'
import StorytellingEvolucao from '../components/StorytellingEvolucao'
import Conquistas from '../components/Conquistas'
import MensagemMotivacional from '../components/MensagemMotivacional'
import { useToast } from '../hooks/useToast'
import api from '../services/auth.service'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [hasPerfil, setHasPerfil] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null)
  const [precisaAtualizacao, setPrecisaAtualizacao] = useState(false)
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null)
  const [mostrarModalAtualizacao, setMostrarModalAtualizacao] = useState(false)

  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        setLoading(true)
        
        // Verificar se tem perfil
        try {
          const perfilResponse = await api.get('/perfil')
          setHasPerfil(!!perfilResponse.data)
          
          if (perfilResponse.data) {
            NotificationService.requestPermission()
            
            // Carregar dados em paralelo para melhor performance
            try {
              const [resumoData, atualizacaoResponse] = await Promise.all([
                obterResumoDashboard(),
                api.get('/perfil/atualizacao-periodica').catch(() => ({ data: { precisaAtualizar: false, diasRestantes: null } }))
              ])
              
              setResumo(resumoData)
              setPrecisaAtualizacao(atualizacaoResponse.data?.precisaAtualizar || false)
              setDiasRestantes(atualizacaoResponse.data?.diasRestantes || null)
              
              if (atualizacaoResponse.data?.precisaAtualizar) {
                setTimeout(() => {
                  setMostrarModalAtualizacao(true)
                }, 2000)
              }
            } catch (error: any) {
              console.error('Erro ao carregar dados do dashboard:', error)
              // Tentar carregar pelo menos o resumo se a atualização periódica falhar
              try {
                const resumoData = await obterResumoDashboard()
                setResumo(resumoData)
              } catch (resumoError: any) {
                console.error('Erro ao carregar resumo:', resumoError)
                showToast('Erro ao carregar alguns dados do dashboard', 'warning')
              }
            }
          }
        } catch (error: any) {
          if (error.response?.status === 404) {
            setHasPerfil(false)
          } else {
            console.error('Erro ao verificar perfil:', error)
            setHasPerfil(false)
            showToast('Erro ao verificar perfil. Verifique sua conexão.', 'error')
          }
        }
      } catch (error: any) {
        console.error('Erro ao carregar dashboard:', error)
        showToast('Erro ao carregar dados do dashboard. Tente recarregar a página.', 'error')
      } finally {
        setLoading(false)
      }
    }
    
    carregarDashboard()
  }, [showToast])

  const handleModoChange = async (novoModo: ModoTreino) => {
    try {
      await atualizarModoTreino(novoModo)
      // Recarregar resumo do dashboard
      const resumoData = await obterResumoDashboard()
      setResumo(resumoData)
    } catch (error: any) {
      console.error('Erro ao atualizar modo de treino:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!hasPerfil) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full card text-center animate-scale-in">
          <h2 className="text-2xl font-display font-bold text-light mb-4">
            Complete seu Perfil
          </h2>
          <p className="text-light-muted mb-6">
            Para começar a receber treinos personalizados, complete o onboarding primeiro.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary w-full"
          >
            Ir para Onboarding
          </button>
        </div>
      </div>
    )
  }

  if (!resumo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container-custom section">
        {/* Hero Section */}
        <HeroSection
          nome={resumo.usuario.nome}
          treinoHoje={resumo.treinoHoje}
          modoTreino={resumo.usuario.modoTreino}
          onModoChange={handleModoChange}
          loading={false}
        />

        {/* Mensagem Motivacional */}
        <MensagemMotivacional mensagem={resumo.mensagemMotivacional} />

        {/* Progresso Semanal */}
        <ProgressoSemanal
          concluidos={resumo.progressoSemanal.concluidos}
          meta={resumo.progressoSemanal.meta}
          porcentagem={resumo.progressoSemanal.porcentagem}
          faltam={resumo.progressoSemanal.faltam}
          sequenciaAtual={resumo.sequencia.atual}
          melhorSequencia={resumo.sequencia.melhor}
          ehRecorde={resumo.sequencia.ehRecorde}
        />

        {/* Storytelling de Evolução */}
        <StorytellingEvolucao
          evolucaoPeso={resumo.evolucao.peso}
          progressaoForca={resumo.evolucao.progressaoForca}
          totalTreinosMes={resumo.evolucao.totalTreinosMes}
          semanasSeguidas={resumo.evolucao.semanasSeguidas}
          totalTreinos={resumo.estatisticas.totalTreinos}
        />

        {/* Conquistas */}
        <Conquistas nivel={resumo.nivel} conquistas={resumo.conquistas} />

        {/* Acesso Rápido - Reorganizado por Prioridade */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <h3 className="text-xl font-display font-bold text-light">Acesso Rápido</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Evolução - Maior destaque */}
            <button
              onClick={() => navigate('/evolucao-peso')}
              className="group relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-5 border-2 border-primary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
              aria-label="Ver evolução de peso"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/30 group-hover:bg-primary/40 flex items-center justify-center mb-4 transition-colors">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-light mb-1">Evolução</h3>
                <p className="text-xs text-light-muted">Peso e medidas</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-100 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Estatísticas */}
            <button
              onClick={() => navigate('/estatisticas')}
              className="group relative overflow-hidden bg-dark-lighter rounded-xl p-5 border border-grey/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
              aria-label="Ver estatísticas e progresso"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center mb-4 transition-colors">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-light mb-1">Estatísticas</h3>
                <p className="text-xs text-light-muted">Análise de progresso</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Meus Treinos */}
            <button
              onClick={() => navigate('/meus-treinos')}
              className="group relative overflow-hidden bg-dark-lighter rounded-xl p-5 border border-grey/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
              aria-label="Ver meus treinos"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center mb-4 transition-colors">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-light mb-1">Meus Treinos</h3>
                <p className="text-xs text-light-muted">Personalizados</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Criar Treino - Menor destaque */}
            <button
              onClick={() => navigate('/treinos-recorrentes')}
              className="group relative overflow-hidden bg-dark-lighter rounded-xl p-5 border border-grey/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
              aria-label="Gerenciar treinos recorrentes"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center mb-4 transition-colors">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-light mb-1">Criar Treino</h3>
                <p className="text-xs text-light-muted">Recorrente (A-G)</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Histórico - Menor destaque */}
            <button
              onClick={() => navigate('/historico')}
              className="group relative overflow-hidden bg-dark-lighter rounded-xl p-5 border border-grey/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
              aria-label="Ver histórico de treinos"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center mb-4 transition-colors">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-light mb-1">Histórico</h3>
                <p className="text-xs text-light-muted">Treinos anteriores</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Admin - Se for admin */}
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin')}
                className="group relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/50 hover:border-primary/70 transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/30 group-hover:bg-primary/40 flex items-center justify-center mb-4 transition-colors">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-primary mb-1">Admin</h3>
                  <p className="text-xs text-light-muted">Painel administrativo</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-100 group-hover:opacity-100 transition-opacity"></div>
              </button>
            )}
          </div>
        </div>

        {/* Alerta de Atualização Periódica */}
        {precisaAtualizacao && (
          <div className="card border-warning/50 bg-warning/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-warning flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-display font-bold text-warning mb-2">
                    Atualização Periódica Necessária
                  </h3>
                  <p className="text-light-muted">
                    É hora de atualizar seus dados! Atualize seu peso, percentual de gordura e lesões para evoluir seus treinos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalAtualizacao(true)}
                className="btn-primary"
              >
                Atualizar Agora
              </button>
            </div>
          </div>
        )}

        {diasRestantes !== null && diasRestantes > 0 && !precisaAtualizacao && (
          <div className="card border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-light-muted text-sm">
                Próxima atualização periódica em <strong className="text-primary">{diasRestantes} dias</strong>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Atualização Periódica */}
      {mostrarModalAtualizacao && (
        <ModalAtualizacaoPeriodica
          onClose={() => setMostrarModalAtualizacao(false)}
          onSuccess={() => {
            setMostrarModalAtualizacao(false)
            setPrecisaAtualizacao(false)
            // Recarregar dados
            window.location.reload()
          }}
          showToast={showToast}
        />
      )}
      <ToastContainer />
    </div>
  )
}

// Componente Modal de Atualização Periódica
function ModalAtualizacaoPeriodica({ onClose, onSuccess, showToast }: { onClose: () => void; onSuccess: () => void; showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void }) {
  const [pesoAtual, setPesoAtual] = useState('')
  const [percentualGordura, setPercentualGordura] = useState('')
  const [lesoes, setLesoes] = useState<string[]>([])
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState('')
  const [temDadosNaoSalvos, setTemDadosNaoSalvos] = useState(false)

  // Atualizar estado quando dados mudarem
  useEffect(() => {
    const temDados = pesoAtual !== '' || percentualGordura !== '' || lesoes.length > 0
    setTemDadosNaoSalvos(temDados)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pesoAtual, percentualGordura, lesoes])

  const handleClose = () => {
    if (temDadosNaoSalvos && !salvando) {
      if (window.confirm('Você tem dados não salvos. Deseja realmente fechar e perder essas informações?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const lesoesDisponiveis = ['Joelho', 'Ombro', 'Coluna', 'Pulso', 'Tornozelo', 'Outras']

  const handleToggleLesao = (lesao: string) => {
    setLesoes(prev => 
      prev.includes(lesao) 
        ? prev.filter(l => l !== lesao)
        : [...prev, lesao]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSalvando(true)

    try {
      const dados: any = {}
      if (pesoAtual) dados.pesoAtual = parseFloat(pesoAtual)
      if (percentualGordura) dados.percentualGordura = parseFloat(percentualGordura)
      if (lesoes.length > 0) dados.lesoes = lesoes

      await api.post('/perfil/atualizacao-periodica', dados)
      
      showToast('Atualização realizada com sucesso! Novos treinos foram gerados para os próximos 30 dias.', 'success')
      onSuccess()
    } catch (err: any) {
      console.error('Erro na atualização periódica:', err)
      setError(err.response?.data?.error || err.response?.data?.message || 'Erro ao atualizar dados')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Fechar apenas se clicar no overlay (não no conteúdo)
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div className="card max-w-2xl w-full animate-scale-in border border-primary/30">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <h3 className="text-2xl font-display font-bold text-light">
              Atualização Periódica
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-light-muted hover:text-light transition-colors"
            aria-label="Fechar modal"
            disabled={salvando}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-light-muted mb-6">
          É hora de atualizar seus dados para evoluir seus treinos! 
          Preencha os campos abaixo (todos são opcionais, mas recomendamos preencher).
        </p>

        {error && (
          <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label-field">Peso Atual (kg)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={pesoAtual}
                onChange={(e) => {
                  setPesoAtual(e.target.value)
                  if (error) setError('')
                }}
                className="input-field"
                placeholder="Ex: 75.5"
                aria-label="Peso atual em quilogramas"
                aria-required="false"
              />
          </div>

          <div>
            <label className="label-field">Percentual de Gordura (%)</label>
              <input
                type="number"
                step="0.1"
                min="5"
                max="50"
                value={percentualGordura}
                onChange={(e) => {
                  setPercentualGordura(e.target.value)
                  if (error) setError('')
                }}
                className="input-field"
                placeholder="Ex: 15.5"
                aria-label="Percentual de gordura corporal"
                aria-required="false"
              />
          </div>

          <div>
            <label className="label-field mb-3">Lesões ou Limitações Físicas</label>
            <div className="space-y-2">
              {lesoesDisponiveis.map(lesao => (
                <label key={lesao} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-dark-lighter transition-colors">
                  <input
                    type="checkbox"
                    checked={lesoes.includes(lesao)}
                    onChange={() => handleToggleLesao(lesao)}
                    className="w-5 h-5 text-primary border-grey rounded focus:ring-primary focus:ring-2 bg-dark-lighter cursor-pointer"
                  />
                  <span className="text-light">{lesao}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Atualizar e Gerar Novos Treinos'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={salvando}
              aria-label="Cancelar e fechar modal"
            >
              {temDadosNaoSalvos ? 'Cancelar e Fechar' : 'Cancelar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
