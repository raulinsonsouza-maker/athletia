import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useToast } from '../hooks/useToast'
import {
  buscarConfiguracaoTreinoPadrao,
  configurarTreinoPadrao,
  removerConfiguracaoTreinoPadrao,
  listarTreinosRecorrentes
} from '../services/treino-personalizado.service'

const DIAS_SEMANA = [
  { valor: 0, nome: 'Domingo' },
  { valor: 1, nome: 'Segunda-feira' },
  { valor: 2, nome: 'Terça-feira' },
  { valor: 3, nome: 'Quarta-feira' },
  { valor: 4, nome: 'Quinta-feira' },
  { valor: 5, nome: 'Sexta-feira' },
  { valor: 6, nome: 'Sábado' }
]

const LETRAS_TREINO = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

export default function ConfigurarTreinosPadrao() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  
  const [configuracoes, setConfiguracoes] = useState<Record<number, any>>({})
  const [treinosRecorrentes, setTreinosRecorrentes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [configResponse, treinosResponse] = await Promise.all([
        buscarConfiguracaoTreinoPadrao(),
        listarTreinosRecorrentes()
      ])

      // Converter array de configurações em objeto indexado por diaSemana
      const configMap: Record<number, any> = {}
      if (configResponse.configuracoes) {
        configResponse.configuracoes.forEach((config: any) => {
          configMap[config.diaSemana] = config
        })
      }
      setConfiguracoes(configMap)

      // Filtrar apenas treinos recorrentes existentes
      const treinosExistentes = (treinosResponse.treinos || []).filter((t: any) => t !== null)
      setTreinosRecorrentes(treinosExistentes)
    } catch (error: any) {
      showToast('Erro ao carregar configurações', 'error')
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigurar = async (diaSemana: number, tipoTreino: 'IA' | 'RECORRENTE' | null, letraTreino?: string) => {
    try {
      setSaving(true)

      if (tipoTreino === null) {
        // Remover configuração
        await removerConfiguracaoTreinoPadrao(diaSemana)
        const novasConfiguracoes = { ...configuracoes }
        delete novasConfiguracoes[diaSemana]
        setConfiguracoes(novasConfiguracoes)
        showToast('Configuração removida com sucesso!', 'success')
      } else {
        // Salvar configuração
        await configurarTreinoPadrao({
          diaSemana,
          tipoTreino,
          letraTreino
        })
        
        const novasConfiguracoes = { ...configuracoes }
        novasConfiguracoes[diaSemana] = {
          diaSemana,
          tipoTreino,
          letraTreino
        }
        setConfiguracoes(novasConfiguracoes)
        showToast('Configuração salva com sucesso!', 'success')
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao salvar configuração', 'error')
      console.error('Erro ao configurar:', error)
    } finally {
      setSaving(false)
    }
  }

  const getTreinoRecorrentePorLetra = (letra: string) => {
    return treinosRecorrentes.find((t: any) => t.letraTreino === letra)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar showBack />
        <main className="container-custom section">
          <div className="text-center py-12">
            <div className="spinner h-8 w-8 mx-auto"></div>
            <p className="text-light-muted mt-2">Carregando configurações...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar showBack />
      <main className="container-custom section">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-light mb-2">Configurar Treinos Padrão</h1>
          <p className="text-light-muted">
            Configure qual treino usar por padrão em cada dia da semana
          </p>
        </div>

        <div className="card mb-6">
          <p className="text-sm text-light-muted mb-4">
            Selecione o treino padrão para cada dia. Se não configurar, todos os treinos disponíveis serão mostrados para escolha.
          </p>
        </div>

        <div className="space-y-4">
          {DIAS_SEMANA.map((dia) => {
            const config = configuracoes[dia.valor]
            const tipoAtual = config?.tipoTreino || null
            const letraAtual = config?.letraTreino || null

            return (
              <div key={dia.valor} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-light mb-2">{dia.nome}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Opção: Treino da IA */}
                      <button
                        onClick={() => handleConfigurar(dia.valor, 'IA')}
                        disabled={saving}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          tipoAtual === 'IA'
                            ? 'border-primary bg-primary/10'
                            : 'border-dark-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            tipoAtual === 'IA'
                              ? 'border-primary bg-primary'
                              : 'border-dark-border'
                          }`}>
                            {tipoAtual === 'IA' && (
                              <div className="w-full h-full rounded-full bg-primary"></div>
                            )}
                          </div>
                          <span className="font-medium text-light">Treino da IA</span>
                        </div>
                        <p className="text-sm text-light-muted mt-1">
                          Usar treino gerado pela AthletIA
                        </p>
                      </button>

                      {/* Opção: Treino Recorrente */}
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            if (tipoAtual === 'RECORRENTE' && letraAtual) {
                              // Se já está selecionado, remover
                              handleConfigurar(dia.valor, null)
                            }
                          }}
                          disabled={saving || tipoAtual !== 'RECORRENTE'}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                            tipoAtual === 'RECORRENTE'
                              ? 'border-primary bg-primary/10'
                              : 'border-dark-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              tipoAtual === 'RECORRENTE'
                                ? 'border-primary bg-primary'
                                : 'border-dark-border'
                            }`}>
                              {tipoAtual === 'RECORRENTE' && (
                                <div className="w-full h-full rounded-full bg-primary"></div>
                              )}
                            </div>
                            <span className="font-medium text-light">Treino Recorrente</span>
                          </div>
                          {tipoAtual === 'RECORRENTE' && letraAtual && (
                            <p className="text-sm text-primary mt-1">
                              {getTreinoRecorrentePorLetra(letraAtual)?.nome || `Treino ${letraAtual}`}
                            </p>
                          )}
                        </button>

                        {tipoAtual === 'RECORRENTE' && (
                          <select
                            value={letraAtual || ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleConfigurar(dia.valor, 'RECORRENTE', e.target.value)
                              }
                            }}
                            className="input-field w-full"
                            disabled={saving}
                          >
                            <option value="">Selecione a letra</option>
                            {LETRAS_TREINO.map((letra) => {
                              const treino = getTreinoRecorrentePorLetra(letra)
                              if (!treino) return null
                              return (
                                <option key={letra} value={letra}>
                                  {letra} - {treino.nome}
                                </option>
                              )
                            })}
                          </select>
                        )}

                        {tipoAtual !== 'RECORRENTE' && (
                          <button
                            onClick={() => handleConfigurar(dia.valor, 'RECORRENTE')}
                            disabled={saving || treinosRecorrentes.length === 0}
                            className="w-full btn-secondary text-sm"
                          >
                            {treinosRecorrentes.length === 0
                              ? 'Nenhum treino recorrente criado'
                              : 'Escolher treino recorrente'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Opção: Nenhum (remover configuração) */}
                    {tipoAtual && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleConfigurar(dia.valor, null)}
                          disabled={saving}
                          className="text-sm text-red-400 hover:text-red-300"
                        >
                          Remover configuração
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Voltar
          </button>
        </div>
      </main>

      <ToastContainer />
    </div>
  )
}

