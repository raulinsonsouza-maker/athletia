import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import { validatePerfil } from '../utils/validation'
import AppHeader from '../components/navigation/AppHeader'
import BottomTabs from '../components/navigation/BottomTabs'
import { useAuth } from '../contexts/AuthContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Perfil {
  id: string
  idade: number | null
  sexo: string | null
  altura: number | null
  pesoAtual: number | null
  percentualGordura: number | null
  experiencia: string | null
  objetivo: string | null
  frequenciaSemanal: number | null
  tempoDisponivel: number | null
  lesoes: string[]
  equipamentos: string[]
  preferencias: string[]
  rpePreferido: number | null
  user: {
    email: string
    nome: string | null
  }
}

interface HistoricoPeso {
  id: string
  peso: number
  data: string
  createdAt: string
}

export default function Perfil() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const { isTrialAtivo } = useAuth()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [editandoTreino, setEditandoTreino] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [pesoSlider, setPesoSlider] = useState<number>(75) // Valor padrão inicial
  const [registrandoPeso, setRegistrandoPeso] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pesoError, setPesoError] = useState('')
  const [historicoPeso, setHistoricoPeso] = useState<HistoricoPeso[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  const [imagemPerfilPadrao, _setImagemPerfilPadrao] = useState<string | null>(null)

  const inputBaseClass =
    'w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none transition'
  const inputErrorClass = 'border-error/60 focus:border-error focus:ring-error/30'


  const carregarPerfil = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/perfil')
      setPerfil(response.data)
      setFormData(response.data)
      if (response.data.pesoAtual) {
        setPesoSlider(response.data.pesoAtual)
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Se não tem perfil, redirecionar para Landing (onboarding)
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const carregarHistoricoPeso = useCallback(async () => {
    try {
      setLoadingHistorico(true)
      const response = await api.get('/peso/historico?limite=30')
      setHistoricoPeso(response.data || [])
    } catch (error: any) {
      console.error('Erro ao carregar histórico de peso:', error)
    } finally {
      setLoadingHistorico(false)
    }
  }, [])

  useEffect(() => {
    carregarPerfil()
  }, [carregarPerfil])

  useEffect(() => {
    if (perfil?.pesoAtual) {
      setPesoSlider(perfil.pesoAtual)
    } else if (perfil && !perfil.pesoAtual) {
      // Se não há peso definido, manter valor padrão de 75 kg
      setPesoSlider(75)
    }
  }, [perfil?.pesoAtual])

  useEffect(() => {
    if (perfil) {
      carregarHistoricoPeso()
    }
  }, [perfil, carregarHistoricoPeso])

  const handleSalvar = async () => {
    const validation = validatePerfil(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      showToast('Por favor, corrija os erros no formulário', 'error')
      return
    }

    setErrors({})
    try {
      setSalvando(true)
      await api.put('/perfil', formData)
      await carregarPerfil()
      setEditando(false)
      setEditandoTreino(false)
      showToast('Perfil atualizado com sucesso!', 'success')
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao atualizar perfil', 'error')
    } finally {
      setSalvando(false)
    }
  }

  const handleToggleLesao = (lesao: string) => {
    const lesoes = formData.lesoes || []
    const index = lesoes.indexOf(lesao)
    if (index > -1) {
      setFormData({ ...formData, lesoes: lesoes.filter((l: string) => l !== lesao) })
    } else {
      setFormData({ ...formData, lesoes: [...lesoes, lesao] })
    }
  }

  const handleToggleEquipamento = (equipamento: string) => {
    const equipamentos = formData.equipamentos || []
    const index = equipamentos.indexOf(equipamento)
    if (index > -1) {
      setFormData({ ...formData, equipamentos: equipamentos.filter((e: string) => e !== equipamento) })
    } else {
      setFormData({ ...formData, equipamentos: [...equipamentos, equipamento] })
    }
  }

  const handleRegistrarPeso = async () => {
    if (pesoSlider < 30 || pesoSlider > 300) {
      setPesoError('Peso deve estar entre 30 e 300 kg')
      showToast('Peso inválido. Deve estar entre 30 e 300 kg', 'error')
      return
    }

    setPesoError('')
    try {
      setRegistrandoPeso(true)
      await api.post('/peso', { peso: pesoSlider })
      
      // Atualizar estado local imediatamente para feedback visual instantâneo
      if (perfil) {
        setPerfil({ ...perfil, pesoAtual: pesoSlider })
      }
      
      showToast('Peso registrado com sucesso!', 'success')
      
      // Recarregar perfil e histórico em background para sincronizar com servidor
      setTimeout(() => {
        carregarPerfil().catch(err => {
          console.error('Erro ao recarregar perfil:', err)
        })
        carregarHistoricoPeso().catch(err => {
          console.error('Erro ao recarregar histórico:', err)
        })
      }, 500)
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao registrar peso. Tente novamente.', 'error')
      // Reverter estado local em caso de erro
      if (perfil) {
        carregarPerfil()
      }
    } finally {
      setRegistrandoPeso(false)
    }
  }

  // Cálculos de métricas
  const calculosMetricas = useMemo(() => {
    if (!perfil) return null

    const peso = perfil.pesoAtual
    const altura = perfil.altura
    const idade = perfil.idade
    const sexo = perfil.sexo
    const frequenciaSemanal = perfil.frequenciaSemanal

    // IMC
    let imc: number | null = null
    let classificacaoIMC: string | null = null
    let corIMC = 'text-white/60'

    if (peso && altura) {
      const alturaMetros = altura / 100
      imc = peso / (alturaMetros * alturaMetros)
      
      if (imc < 18.5) {
        classificacaoIMC = 'Abaixo do peso'
        corIMC = 'text-blue-400'
      } else if (imc < 25) {
        classificacaoIMC = 'Peso normal'
        corIMC = 'text-green-400'
      } else if (imc < 30) {
        classificacaoIMC = 'Sobrepeso'
        corIMC = 'text-yellow-400'
      } else {
        classificacaoIMC = 'Obesidade'
        corIMC = 'text-red-400'
      }
    }

    // TMB (Taxa Metabólica Basal) - Fórmula de Mifflin-St Jeor
    let tmb: number | null = null
    if (peso && altura && idade && sexo) {
      if (sexo === 'Masculino') {
        tmb = 10 * peso + 6.25 * altura - 5 * idade + 5
      } else if (sexo === 'Feminino') {
        tmb = 10 * peso + 6.25 * altura - 5 * idade - 161
      }
      
      // Ajustar com multiplicador de atividade
      if (tmb && frequenciaSemanal) {
        const multiplicador = frequenciaSemanal <= 2 ? 1.2 : frequenciaSemanal <= 4 ? 1.375 : 1.55
        tmb = Math.round(tmb * multiplicador)
      } else if (tmb) {
        tmb = Math.round(tmb * 1.2)
      }
    }

    // Água recomendada (35ml por kg de peso corporal)
    let aguaRecomendada: number | null = null
    if (peso) {
      aguaRecomendada = peso * 0.035 // em litros
    }

    return {
      imc: imc ? imc.toFixed(1) : null,
      classificacaoIMC,
      corIMC,
      tmb,
      aguaRecomendada: aguaRecomendada ? aguaRecomendada.toFixed(1) : null
    }
  }, [perfil?.pesoAtual, perfil?.altura, perfil?.idade, perfil?.sexo, perfil?.frequenciaSemanal])

  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 space-y-1">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark flex items-center justify-center">
        <div className="text-center space-y-4 text-white">
          <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-primary animate-spin mx-auto" />
          <p className="text-white/60">Carregando seu perfil...</p>
        </div>
      </div>
    )
  }

  if (!perfil) return null

  // Usar imagem padrão do sistema se disponível, senão usar imagem padrão baseada no sexo
  const heroImage = imagemPerfilPadrao || (
    perfil.sexo === 'Feminino'
      ? 'https://images.unsplash.com/photo-1469460340994-25b0127eea38?auto=format&fit=crop&w=1200&q=80'
      : 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=80'
  )

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark text-white pb-32">
      <AppHeader title="Meu Perfil" />
      <ToastContainer />
      <div 
        className="px-5 space-y-6 pb-28" 
        style={{ 
          paddingTop: isTrialAtivo() 
            ? 'calc(var(--trial-header-height, 60px) + 1.5rem)' 
            : '1.5rem' 
        }}
      >
        <section className="relative rounded-[32px] border border-white/10 overflow-hidden min-h-[250px]">
          <img 
            src={heroImage} 
            alt="Banner do perfil" 
            className="absolute inset-0 w-full h-full object-cover opacity-60" 
            style={{ zIndex: 0 }}
            onError={(e) => {
              // Fallback para imagem padrão se a URL falhar
              const target = e.target as HTMLImageElement
              target.src = perfil.sexo === 'Feminino'
                ? 'https://images.unsplash.com/photo-1469460340994-25b0127eea38?auto=format&fit=crop&w=1200&q=80'
                : 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=80'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/70 to-transparent" style={{ zIndex: 1 }} />
          <div className="relative z-10 px-6 py-8 space-y-4" style={{ zIndex: 2 }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="px-4 py-1 rounded-full border border-white/20 text-xs uppercase tracking-[0.4em] text-white/70">
                Perfil
              </span>
              <span className="text-sm text-white/70">
                {perfil.frequenciaSemanal ? `${perfil.frequenciaSemanal}x/semana` : 'Frequência indefinida'} ·{' '}
                {perfil.objetivo || 'Objetivo indefinido'}
              </span>
            </div>
            <h1 className="text-3xl font-semibold">
              {perfil.user?.nome ? `${perfil.user.nome}` : 'Atleta AthletIA'}
            </h1>
            <p className="text-white/70 max-w-2xl">
              Mantemos seu plano atualizado com base no seu objetivo, disponibilidade e histórico. Revise os dados abaixo sempre que suas metas mudarem.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setEditando(true)
                  scrollToSection('dados-pessoais')
                }}
                className="px-5 py-3 rounded-full bg-primary text-dark font-semibold"
              >
                Editar dados
              </button>
              <button
                onClick={() => {
                  setEditandoTreino(true)
                  scrollToSection('preferencias-treino')
                }}
                className="px-5 py-3 rounded-full border border-white/30 text-white/80"
              >
                Ajustar preferências
              </button>
            </div>
          </div>
        </section>

        <section id="metricas-peso" className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-5 backdrop-blur">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Peso e progresso</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-4xl font-bold">{perfil.pesoAtual ? `${perfil.pesoAtual.toFixed(1)} kg` : '-- kg'}</p>
                <p className="text-white/60 text-sm">Último registro atualizado</p>
              </div>
              <div className="text-sm text-white/60 text-right space-y-1">
                <p>{perfil.objetivo || 'Objetivo não definido'}</p>
                <span>{perfil.frequenciaSemanal ? `${perfil.frequenciaSemanal}x semana` : 'Frequência não definida'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/60">Atualizar peso (kg)</label>
                <span className="text-2xl font-bold text-primary">{pesoSlider.toFixed(1)} kg</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="0.1"
                  value={pesoSlider}
                  onChange={(e) => {
                    setPesoSlider(parseFloat(e.target.value))
                    if (pesoError) setPesoError('')
                  }}
                  className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #F9A620 0%, #F9A620 ${((pesoSlider - 30) / (300 - 30)) * 100}%, rgba(255,255,255,0.1) ${((pesoSlider - 30) / (300 - 30)) * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
                <style>{`
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #F9A620;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  }
                  .slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #F9A620;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  }
                `}</style>
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>30 kg</span>
                  <span>300 kg</span>
                </div>
              </div>
              {pesoError && <p className="text-error text-sm">{pesoError}</p>}
            </div>
            
            <button
              onClick={handleRegistrarPeso}
              disabled={registrandoPeso}
              className="w-full rounded-2xl bg-primary text-dark font-semibold py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-primary/90"
            >
              {registrandoPeso ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                  Registrando...
                </span>
              ) : (
                'Registrar peso'
              )}
            </button>
          </div>

          {/* Gráfico de histórico */}
          {historicoPeso.length > 0 && (
            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Histórico de peso</p>
              <div className="bg-dark/30 rounded-2xl p-4">
                <Line
                  data={{
                    labels: historicoPeso
                      .slice()
                      .reverse()
                      .map((item) => {
                        const date = new Date(item.data || item.createdAt)
                        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                      }),
                    datasets: [
                      {
                        label: 'Peso (kg)',
                        data: historicoPeso.slice().reverse().map((item) => item.peso),
                        borderColor: '#F9A620',
                        backgroundColor: 'rgba(249, 166, 32, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#F9A620',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#F9A620',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                          label: function(context) {
                            const peso = context.parsed.y ?? 0
                            return `Peso: ${peso.toFixed(1)} kg`
                          }
                        }
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.05)',
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.6)',
                          maxRotation: 45,
                          minRotation: 45,
                        },
                      },
                      y: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.05)',
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.6)',
                          callback: function(value) {
                            return value + ' kg'
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}
          {loadingHistorico && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </section>

        {/* Seção de Métricas */}
        {calculosMetricas && (
          <section id="metricas" className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-5 backdrop-blur">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Métricas de saúde</p>
              <h2 className="text-2xl font-semibold">Indicadores importantes</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card IMC */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">IMC</p>
                {calculosMetricas.imc ? (
                  <>
                    <p className={`text-3xl font-bold ${calculosMetricas.corIMC}`}>
                      {calculosMetricas.imc}
                    </p>
                    <p className={`text-sm font-medium ${calculosMetricas.corIMC}`}>
                      {calculosMetricas.classificacaoIMC}
                    </p>
                    <p className="text-xs text-white/40 mt-2">
                      Peso ideal: 18.5 - 24.9
                    </p>
                  </>
                ) : (
                  <p className="text-white/40 text-sm">Complete altura e peso para calcular</p>
                )}
              </div>

              {/* Card TMB */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Calorias diárias</p>
                {calculosMetricas.tmb ? (
                  <>
                    <p className="text-3xl font-bold text-primary">
                      {calculosMetricas.tmb.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-white/60">
                      Taxa metabólica basal
                    </p>
                    <p className="text-xs text-white/40 mt-2">
                      Ajustado pela atividade
                    </p>
                  </>
                ) : (
                  <p className="text-white/40 text-sm">Complete dados pessoais para calcular</p>
                )}
              </div>

              {/* Card Água */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Água recomendada</p>
                {calculosMetricas.aguaRecomendada ? (
                  <>
                    <p className="text-3xl font-bold text-blue-400">
                      {calculosMetricas.aguaRecomendada} L
                    </p>
                    <p className="text-sm text-white/60">
                      Por dia
                    </p>
                    <p className="text-xs text-white/40 mt-2">
                      35ml por kg de peso
                    </p>
                  </>
                ) : (
                  <p className="text-white/40 text-sm">Complete o peso para calcular</p>
                )}
              </div>
            </div>
            
            {/* Percentual de gordura se disponível */}
            {perfil.percentualGordura && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">Percentual de gordura</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {perfil.percentualGordura.toFixed(1)}%
                  </p>
                  <p className="text-xs text-white/40 mt-2">
                    Última medição registrada
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        <section id="dados-pessoais" className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-5 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Dados pessoais</p>
              <h2 className="text-2xl font-semibold">Informações básicas</h2>
            </div>
            <div className="flex gap-3">
              {editando ? (
                <button
                  onClick={() => {
                    setEditando(false)
                    setFormData(perfil)
                    setErrors({})
                  }}
                  className="px-4 py-2 rounded-full border border-white/20 text-sm text-white/70 hover:border-white/60 transition"
                  disabled={salvando}
                >
                  Cancelar
                </button>
              ) : (
                <button
                  onClick={() => setEditando(true)}
                  className="px-4 py-2 rounded-full border border-primary/40 text-sm text-primary hover:bg-primary/10 transition"
                >
                  Editar
                </button>
              )}
            </div>
          </div>

          {editando ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Nome</span>
                  <input
                    type="text"
                    value={formData.user?.nome || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, user: { ...formData.user, nome: e.target.value } })
                      if (errors.nome) setErrors({ ...errors, nome: '' })
                    }}
                    className={`${inputBaseClass} ${errors.nome ? inputErrorClass : ''}`}
                  />
                  {errors.nome && <p className="text-error text-sm">{errors.nome}</p>}
                </label>
                <label className="space-y-2 opacity-60">
                  <span className="text-sm text-white/60">Email</span>
                  <input type="email" value={formData.user?.email || ''} disabled className={`${inputBaseClass} bg-white/5`} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Idade</span>
                  <input
                    type="number"
                    min="13"
                    max="100"
                    value={formData.idade || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, idade: e.target.value })
                      if (errors.idade) setErrors({ ...errors, idade: '' })
                    }}
                    className={`${inputBaseClass} ${errors.idade ? inputErrorClass : ''}`}
                  />
                  {errors.idade && <p className="text-error text-sm">{errors.idade}</p>}
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Sexo</span>
                  <select
                    value={formData.sexo || ''}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    className={`${inputBaseClass} bg-dark`}
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Altura (cm)</span>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={formData.altura || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, altura: e.target.value })
                      if (errors.altura) setErrors({ ...errors, altura: '' })
                    }}
                    className={`${inputBaseClass} ${errors.altura ? inputErrorClass : ''}`}
                  />
                  {errors.altura && <p className="text-error text-sm">{errors.altura}</p>}
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Percentual de gordura (%)</span>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    step="0.1"
                    value={formData.percentualGordura || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, percentualGordura: e.target.value })
                      if (errors.percentualGordura) setErrors({ ...errors, percentualGordura: '' })
                    }}
                    className={`${inputBaseClass} ${errors.percentualGordura ? inputErrorClass : ''}`}
                  />
                  {errors.percentualGordura && <p className="text-error text-sm">{errors.percentualGordura}</p>}
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                  className="flex-1 rounded-2xl bg-primary text-dark font-semibold py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {salvando ? 'Salvando...' : 'Salvar alterações'}
                </button>
                <button
                  onClick={() => {
                    setEditando(false)
                    setFormData(perfil)
                    setErrors({})
                  }}
                  className="rounded-2xl border border-white/20 text-white/80 py-3 px-4"
                  disabled={salvando}
                >
                  Voltar
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Nome" value={perfil.user?.nome || 'Não informado'} />
              <InfoField label="Email" value={perfil.user?.email || 'Não informado'} />
              <InfoField label="Idade" value={perfil.idade ? `${perfil.idade} anos` : 'Não informado'} />
              <InfoField label="Sexo" value={perfil.sexo || 'Não informado'} />
              <InfoField label="Altura" value={perfil.altura ? `${perfil.altura} cm` : 'Não informado'} />
              <InfoField label="Peso atual" value={perfil.pesoAtual ? `${perfil.pesoAtual} kg` : 'Não informado'} />
            </div>
          )}
        </section>

        <section id="preferencias-treino" className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Configuração de treino</p>
              <h2 className="text-2xl font-semibold">Preferências e disponibilidade</h2>
            </div>
            <div className="flex gap-3">
              {editandoTreino ? (
                <button
                  onClick={() => {
                    setEditandoTreino(false)
                    setFormData(perfil)
                  }}
                  className="px-4 py-2 rounded-full border border-white/20 text-sm text-white/70 hover:border-white/60 transition"
                  disabled={salvando}
                >
                  Cancelar
                </button>
              ) : (
                <button
                  onClick={() => setEditandoTreino(true)}
                  className="px-4 py-2 rounded-full border border-primary/40 text-sm text-primary hover:bg-primary/10 transition"
                >
                  Ajustar
                </button>
              )}
            </div>
          </div>

          {editandoTreino ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Experiência</span>
                  <select
                    value={formData.experiencia || ''}
                    onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                    className={`${inputBaseClass} bg-dark`}
                  >
                    <option value="">Selecione</option>
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Objetivo</span>
                  <select
                    value={formData.objetivo || ''}
                    onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                    className={`${inputBaseClass} bg-dark`}
                  >
                    <option value="">Selecione</option>
                    <option value="Hipertrofia">Hipertrofia</option>
                    <option value="Força">Força</option>
                    <option value="Resistência">Resistência</option>
                    <option value="Emagrecimento">Emagrecimento</option>
                    <option value="Condicionamento">Condicionamento</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Frequência semanal</span>
                  <select
                    value={formData.frequenciaSemanal || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, frequenciaSemanal: e.target.value ? Number(e.target.value) : null })
                    }
                    className={`${inputBaseClass} bg-dark`}
                  >
                    <option value="">Selecione</option>
                    {[2, 3, 4, 5, 6].map((dia) => (
                      <option key={dia} value={dia}>{`${dia}x semana`}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Tempo disponível</span>
                  <select
                    value={formData.tempoDisponivel || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, tempoDisponivel: e.target.value ? Number(e.target.value) : null })
                    }
                    className={`${inputBaseClass} bg-dark`}
                  >
                    <option value="">Selecione</option>
                    {[30, 45, 60, 75, 90].map((min) => (
                      <option key={min} value={min}>{`${min} minutos`}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/60">RPE preferido</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.rpePreferido || ''}
                    onChange={(e) => setFormData({ ...formData, rpePreferido: e.target.value ? Number(e.target.value) : null })}
                    className={inputBaseClass}
                  />
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-white/60">Lesões / limitações</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Joelho', 'Ombro', 'Coluna', 'Pulso', 'Tornozelo', 'Outras'].map((lesao) => (
                    <label
                      key={lesao}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(formData.lesoes || []).includes(lesao)}
                        onChange={() => handleToggleLesao(lesao)}
                        className="h-5 w-5 rounded border-white/30 bg-dark accent-primary"
                      />
                      <span className="text-sm">{lesao}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-white/60">Equipamentos disponíveis</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Barra', 'Halteres', 'Anilhas', 'Máquinas', 'Cabo', 'Peso Corporal', 'Elásticos', 'Kettlebell'].map(
                    (equipamento) => (
                      <label
                        key={equipamento}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(formData.equipamentos || []).includes(equipamento)}
                          onChange={() => handleToggleEquipamento(equipamento)}
                          className="h-5 w-5 rounded border-white/30 bg-dark accent-primary"
                        />
                        <span className="text-sm">{equipamento}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                  className="flex-1 rounded-2xl bg-primary text-dark font-semibold py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {salvando ? 'Salvando...' : 'Salvar preferências'}
                </button>
                <button
                  onClick={() => {
                    setEditandoTreino(false)
                    setFormData(perfil)
                  }}
                  className="rounded-2xl border border-white/20 text-white/80 py-3 px-4"
                  disabled={salvando}
                >
                  Voltar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Experiência" value={perfil.experiencia || 'Não informado'} />
                <InfoField label="Objetivo" value={perfil.objetivo || 'Não informado'} />
                <InfoField
                  label="Frequência semanal"
                  value={perfil.frequenciaSemanal ? `${perfil.frequenciaSemanal}x semana` : 'Não informado'}
                />
                <InfoField
                  label="Tempo disponível"
                  value={perfil.tempoDisponivel ? `${perfil.tempoDisponivel} minutos` : 'Não informado'}
                />
                <InfoField label="RPE preferido" value={perfil.rpePreferido ? `${perfil.rpePreferido}/10` : 'Não informado'} />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-white/60">Lesões</p>
                {perfil.lesoes && perfil.lesoes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {perfil.lesoes.map((lesao) => (
                      <span key={lesao} className="px-3 py-1 rounded-full border border-warning/40 bg-warning/10 text-warning/80 text-sm">
                        {lesao}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">Nenhuma restrição cadastrada</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-white/60">Equipamentos</p>
                {perfil.equipamentos && perfil.equipamentos.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {perfil.equipamentos.map((equipamento) => (
                      <span
                        key={equipamento}
                        className="px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-sm"
                      >
                        {equipamento}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">Nenhum equipamento informado</p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
      <BottomTabs active="perfil" />
    </div>
  )
}

