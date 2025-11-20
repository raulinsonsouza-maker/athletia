import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import Navbar from '../components/Navbar'
import { useToast } from '../hooks/useToast'
import { validatePerfil, validatePeso } from '../utils/validation'

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

export default function Perfil() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [editandoTreino, setEditandoTreino] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [pesoInput, setPesoInput] = useState('')
  const [registrandoPeso, setRegistrandoPeso] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pesoError, setPesoError] = useState('')

  useEffect(() => {
    carregarPerfil()
  }, [])

  const carregarPerfil = async () => {
    try {
      setLoading(true)
      const response = await api.get('/perfil')
      setPerfil(response.data)
      setFormData(response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Se não tem perfil, redirecionar para Landing (onboarding)
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }

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
    const validation = validatePeso(pesoInput)
    if (!validation.isValid) {
      setPesoError(validation.errors.peso || '')
      showToast(validation.errors.peso || 'Peso inválido', 'error')
      return
    }

    setPesoError('')
    try {
      setRegistrandoPeso(true)
      await api.post('/peso', { peso: parseFloat(pesoInput) })
      setPesoInput('')
      await carregarPerfil()
      showToast('Peso registrado com sucesso!', 'success')
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao registrar peso', 'error')
    } finally {
      setRegistrandoPeso(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!perfil) return null

  return (
    <div className="min-h-screen">
      <Navbar showBack />
      <ToastContainer />

      <main className="container-custom section">
        {/* Card de Registro de Peso Semanal */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-light">
              Registro Semanal de Peso
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="label-field">
                Peso Atual (kg)
              </label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    step="0.1"
                    value={pesoInput}
                    onChange={(e) => {
                      setPesoInput(e.target.value)
                      if (pesoError) setPesoError('')
                    }}
                    placeholder={perfil.pesoAtual?.toString() || 'Ex: 75.5'}
                    className={`input-field ${pesoError ? 'border-error' : ''}`}
                  />
                  {pesoError && (
                    <p className="text-error text-sm mt-1">{pesoError}</p>
                  )}
            </div>
            <button
              onClick={handleRegistrarPeso}
              disabled={registrandoPeso || !pesoInput}
              className="btn-primary min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registrandoPeso ? (
                <>
                  <div className="spinner h-4 w-4 mr-2"></div>
                  Registrando...
                </>
              ) : (
                'Registrar Peso'
              )}
            </button>
          </div>
          {perfil.pesoAtual && (
            <p className="text-sm text-light-muted mt-3">
              Último peso registrado: <strong className="text-primary">{perfil.pesoAtual} kg</strong>
            </p>
          )}
        </div>

        {/* Informações do Perfil */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold text-light">Informações Pessoais</h2>
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            )}
          </div>

          {editando ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.user?.nome || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, user: { ...formData.user, nome: e.target.value } })
                      if (errors.nome) setErrors({ ...errors, nome: '' })
                    }}
                    className={`input-field ${errors.nome ? 'border-error' : ''}`}
                  />
                  {errors.nome && (
                    <p className="text-error text-sm mt-1">{errors.nome}</p>
                  )}
                </div>
                <div>
                  <label className="label-field">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.user?.email || ''}
                    disabled
                    className="input-field bg-dark-lighter opacity-60 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="label-field">
                    Idade
                  </label>
                  <input
                    type="number"
                    min="13"
                    max="100"
                    value={formData.idade || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, idade: e.target.value })
                      if (errors.idade) setErrors({ ...errors, idade: '' })
                    }}
                    className={`input-field ${errors.idade ? 'border-error' : ''}`}
                  />
                  {errors.idade && (
                    <p className="text-error text-sm mt-1">{errors.idade}</p>
                  )}
                </div>
                <div>
                  <label className="label-field">
                    Sexo
                  </label>
                  <select
                    value={formData.sexo || ''}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={formData.altura || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, altura: e.target.value })
                      if (errors.altura) setErrors({ ...errors, altura: '' })
                    }}
                    className={`input-field ${errors.altura ? 'border-error' : ''}`}
                  />
                  {errors.altura && (
                    <p className="text-error text-sm mt-1">{errors.altura}</p>
                  )}
                </div>
                <div>
                  <label className="label-field">
                    Percentual de Gordura (%)
                  </label>
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
                    className={`input-field ${errors.percentualGordura ? 'border-error' : ''}`}
                  />
                  {errors.percentualGordura && (
                    <p className="text-error text-sm mt-1">{errors.percentualGordura}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {salvando ? (
                    <>
                      <div className="spinner h-4 w-4 mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditando(false)
                    setFormData(perfil)
                  }}
                  className="btn-secondary"
                  disabled={salvando}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-light-muted">Nome</p>
                <p className="text-lg font-semibold text-light">
                  {perfil.user?.nome || 'Não informado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-light-muted">Email</p>
                <p className="text-lg font-semibold text-light">
                  {perfil.user?.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-light-muted">Idade</p>
                <p className="text-lg font-semibold text-light">
                  {perfil.idade ? `${perfil.idade} anos` : 'Não informado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-light-muted">Sexo</p>
                <p className="text-lg font-semibold text-light">
                  {perfil.sexo || 'Não informado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-light-muted">Altura</p>
                <p className="text-lg font-semibold text-light">
                  {perfil.altura ? `${perfil.altura} cm` : 'Não informado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-light-muted">Peso Atual</p>
                <p className="text-lg font-semibold text-light">
                  {perfil.pesoAtual ? `${perfil.pesoAtual} kg` : 'Não informado'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Informações de Treino */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold text-light">Configurações de Treino</h2>
            {!editandoTreino && (
              <button
                onClick={() => setEditandoTreino(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            )}
          </div>

          {editandoTreino ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">
                    Experiência
                  </label>
                  <select
                    value={formData.experiencia || ''}
                    onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Selecione</option>
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">
                    Objetivo
                  </label>
                  <select
                    value={formData.objetivo || ''}
                    onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Selecione</option>
                    <option value="Hipertrofia">Hipertrofia</option>
                    <option value="Força">Força</option>
                    <option value="Resistência">Resistência</option>
                    <option value="Emagrecimento">Emagrecimento</option>
                    <option value="Condicionamento">Condicionamento</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">
                    Frequência Semanal (dias)
                  </label>
                  <select
                    value={formData.frequenciaSemanal || ''}
                    onChange={(e) => setFormData({ ...formData, frequenciaSemanal: e.target.value ? Number(e.target.value) : null })}
                    className="input-field"
                  >
                    <option value="">Selecione</option>
                    <option value="2">2 dias/semana</option>
                    <option value="3">3 dias/semana</option>
                    <option value="4">4 dias/semana</option>
                    <option value="5">5 dias/semana</option>
                    <option value="6">6 dias/semana</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">
                    Tempo Disponível (minutos)
                  </label>
                  <select
                    value={formData.tempoDisponivel || ''}
                    onChange={(e) => setFormData({ ...formData, tempoDisponivel: e.target.value ? Number(e.target.value) : null })}
                    className="input-field"
                  >
                    <option value="">Selecione</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                    <option value="75">75 minutos</option>
                    <option value="90">90 minutos</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">
                    RPE Preferido (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.rpePreferido || ''}
                    onChange={(e) => setFormData({ ...formData, rpePreferido: e.target.value ? Number(e.target.value) : null })}
                    className="input-field"
                    placeholder="Ex: 7"
                  />
                </div>
              </div>

              {/* Lesões */}
              <div>
                <label className="label-field mb-3">Lesões/Limitações Físicas</label>
                <div className="space-y-2">
                  {['Joelho', 'Ombro', 'Coluna', 'Pulso', 'Tornozelo', 'Outras'].map(lesao => (
                    <label key={lesao} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-dark-lighter transition-colors">
                      <input
                        type="checkbox"
                        checked={(formData.lesoes || []).includes(lesao)}
                        onChange={() => handleToggleLesao(lesao)}
                        className="w-5 h-5 text-primary border-grey rounded focus:ring-primary focus:ring-2 bg-dark-lighter cursor-pointer"
                      />
                      <span className="text-light">{lesao}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Equipamentos */}
              <div>
                <label className="label-field mb-3">Equipamentos Disponíveis</label>
                <div className="space-y-2">
                  {['Barra', 'Halteres', 'Anilhas', 'Máquinas', 'Cabo', 'Peso Corporal', 'Elásticos', 'Kettlebell'].map(equipamento => (
                    <label key={equipamento} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-dark-lighter transition-colors">
                      <input
                        type="checkbox"
                        checked={(formData.equipamentos || []).includes(equipamento)}
                        onChange={() => handleToggleEquipamento(equipamento)}
                        className="w-5 h-5 text-primary border-grey rounded focus:ring-primary focus:ring-2 bg-dark-lighter cursor-pointer"
                      />
                      <span className="text-light">{equipamento}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {salvando ? (
                    <>
                      <div className="spinner h-4 w-4 mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditandoTreino(false)
                    setFormData(perfil)
                  }}
                  className="btn-secondary"
                  disabled={salvando}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-light-muted">Experiência</p>
                  <p className="text-lg font-semibold text-light">
                    {perfil.experiencia || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-light-muted">Objetivo</p>
                  <p className="text-lg font-semibold text-light">
                    {perfil.objetivo || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-light-muted">Frequência Semanal</p>
                  <p className="text-lg font-semibold text-light">
                    {perfil.frequenciaSemanal ? `${perfil.frequenciaSemanal} dias/semana` : 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-light-muted">Tempo Disponível</p>
                  <p className="text-lg font-semibold text-light">
                    {perfil.tempoDisponivel ? `${perfil.tempoDisponivel} minutos` : 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-light-muted">RPE Preferido</p>
                  <p className="text-lg font-semibold text-light">
                    {perfil.rpePreferido ? `${perfil.rpePreferido}/10` : 'Não informado'}
                  </p>
                </div>
              </div>

              {perfil.lesoes && perfil.lesoes.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-light-muted mb-2">Lesões/Limitações</p>
                  <div className="flex flex-wrap gap-2">
                    {perfil.lesoes.map((lesao, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-warning/20 text-warning border border-warning/30 rounded-full text-sm"
                      >
                        {lesao}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {perfil.equipamentos && perfil.equipamentos.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-light-muted mb-2">Equipamentos Disponíveis</p>
                  <div className="flex flex-wrap gap-2">
                    {perfil.equipamentos.map((equipamento, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm"
                      >
                        {equipamento}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

