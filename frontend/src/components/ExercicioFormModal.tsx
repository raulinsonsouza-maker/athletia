import { useState, useEffect } from 'react'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import UploadExercicioMedia from './UploadExercicioMedia'

interface Exercicio {
  id: string
  nome: string
  grupoMuscularPrincipal: string
  nivelDificuldade: string
  descricao: string | null
  execucaoTecnica: string | null
  errosComuns: string[]
  equipamentoNecessario: string[]
  semEquipamento: boolean
  alternativas: string[]
  sinergistas: string[]
  cargaInicialSugerida: number | null
  rpeSugerido: number | null
  imagemUrl: string | null
  ativo: boolean
}

interface ExercicioFormModalProps {
  exercicio: Exercicio | null
  isOpen: boolean
  isCreating: boolean
  gruposMusculares: string[]
  onClose: () => void
  onSave: (exercicio: Exercicio) => void
}

export default function ExercicioFormModal({
  exercicio,
  isOpen,
  isCreating,
  gruposMusculares,
  onClose,
  onSave
}: ExercicioFormModalProps) {
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basico' | 'descricao' | 'configuracoes' | 'midia'>('basico')
  
  const [formData, setFormData] = useState({
    nome: '',
    grupoMuscularPrincipal: '',
    nivelDificuldade: '',
    descricao: '',
    execucaoTecnica: '',
    errosComuns: [] as string[],
    equipamentoNecessario: [] as string[],
    semEquipamento: false,
    alternativas: [] as string[],
    sinergistas: [] as string[],
    cargaInicialSugerida: null as number | null,
    rpeSugerido: null as number | null,
    ativo: true
  })

  const [arrayInputs, setArrayInputs] = useState({
    sinergistas: '',
    errosComuns: '',
    equipamentoNecessario: '',
    alternativas: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Carregar dados do exercício quando modal abrir
  useEffect(() => {
    if (isOpen && exercicio) {
      // Garantir que arrays sempre sejam arrays (mesmo se vierem null/undefined)
      const sinergistasArray = Array.isArray(exercicio.sinergistas) ? exercicio.sinergistas : (exercicio.sinergistas ? [exercicio.sinergistas] : [])
      const errosComunsArray = Array.isArray(exercicio.errosComuns) ? exercicio.errosComuns : (exercicio.errosComuns ? [exercicio.errosComuns] : [])
      const equipamentoArray = Array.isArray(exercicio.equipamentoNecessario) ? exercicio.equipamentoNecessario : (exercicio.equipamentoNecessario ? [exercicio.equipamentoNecessario] : [])
      const alternativasArray = Array.isArray(exercicio.alternativas) ? exercicio.alternativas : (exercicio.alternativas ? [exercicio.alternativas] : [])

      setFormData({
        nome: exercicio.nome || '',
        grupoMuscularPrincipal: exercicio.grupoMuscularPrincipal || '',
        nivelDificuldade: exercicio.nivelDificuldade || '',
        descricao: exercicio.descricao || '',
        execucaoTecnica: exercicio.execucaoTecnica || '',
        errosComuns: errosComunsArray,
        equipamentoNecessario: equipamentoArray,
        semEquipamento: exercicio.semEquipamento !== undefined ? exercicio.semEquipamento : false,
        alternativas: alternativasArray,
        sinergistas: sinergistasArray,
        cargaInicialSugerida: exercicio.cargaInicialSugerida !== null && exercicio.cargaInicialSugerida !== undefined ? exercicio.cargaInicialSugerida : null,
        rpeSugerido: exercicio.rpeSugerido !== null && exercicio.rpeSugerido !== undefined ? exercicio.rpeSugerido : null,
        ativo: exercicio.ativo !== undefined ? exercicio.ativo : true
      })
      setArrayInputs({
        sinergistas: sinergistasArray.join('\n'),
        errosComuns: errosComunsArray.join('\n'),
        equipamentoNecessario: equipamentoArray.join('\n'),
        alternativas: alternativasArray.join('\n')
      })
    } else if (isOpen && isCreating) {
      // Resetar para criação
      setFormData({
        nome: '',
        grupoMuscularPrincipal: '',
        nivelDificuldade: '',
        descricao: '',
        execucaoTecnica: '',
        errosComuns: [],
        equipamentoNecessario: [],
        semEquipamento: false,
        alternativas: [],
        sinergistas: [],
        cargaInicialSugerida: null,
        rpeSugerido: null,
        ativo: true
      })
      setArrayInputs({
        sinergistas: '',
        errosComuns: '',
        equipamentoNecessario: '',
        alternativas: ''
      })
      setActiveTab('basico')
    }
    setErrors({})
  }, [isOpen, exercicio, isCreating])

  const handleArrayInputChange = (field: keyof typeof arrayInputs, value: string) => {
    setArrayInputs(prev => ({ ...prev, [field]: value }))
    const array = value.split('\n').map(item => item.trim()).filter(item => item.length > 0)
    
    // Mapear corretamente os campos do arrayInputs para formData
    const fieldMap: Record<keyof typeof arrayInputs, keyof typeof formData> = {
      sinergistas: 'sinergistas',
      errosComuns: 'errosComuns',
      equipamentoNecessario: 'equipamentoNecessario',
      alternativas: 'alternativas'
    }
    
    setFormData(prev => ({ ...prev, [fieldMap[field]]: array }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validação
    const newErrors: Record<string, string> = {}
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }
    if (!formData.grupoMuscularPrincipal) {
      newErrors.grupoMuscularPrincipal = 'Grupo muscular é obrigatório'
    }
    if (!formData.nivelDificuldade) {
      newErrors.nivelDificuldade = 'Nível de dificuldade é obrigatório'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showToast('Preencha todos os campos obrigatórios', 'error')
      return
    }

    setSaving(true)
    try {
      const payload: any = {
        nome: formData.nome.trim(),
        grupoMuscularPrincipal: formData.grupoMuscularPrincipal,
        nivelDificuldade: formData.nivelDificuldade,
        descricao: formData.descricao.trim() || null,
        execucaoTecnica: formData.execucaoTecnica.trim() || null,
        errosComuns: formData.errosComuns || [],
        equipamentoNecessario: formData.equipamentoNecessario || [],
        semEquipamento: formData.semEquipamento !== undefined ? formData.semEquipamento : false,
        alternativas: formData.alternativas || [],
        sinergistas: formData.sinergistas || [],
        ativo: formData.ativo !== undefined ? formData.ativo : true
      }

      // Adicionar campos numéricos opcionais apenas se tiverem valor
      // Ao criar: omitir se null/undefined (backend usa padrão null)
      // Ao atualizar: enviar null explicitamente para permitir limpar o campo
      if (isCreating) {
        if (formData.cargaInicialSugerida !== null && formData.cargaInicialSugerida !== undefined) {
          payload.cargaInicialSugerida = formData.cargaInicialSugerida
        }
        if (formData.rpeSugerido !== null && formData.rpeSugerido !== undefined) {
          payload.rpeSugerido = formData.rpeSugerido
        }
      } else {
        // Ao atualizar, sempre enviar (mesmo que null) para permitir limpar valores
        payload.cargaInicialSugerida = formData.cargaInicialSugerida ?? null
        payload.rpeSugerido = formData.rpeSugerido ?? null
      }

      let response
      if (isCreating) {
        response = await api.post('/admin/exercicios', payload)
      } else {
        if (!exercicio?.id) {
          showToast('Erro: ID do exercício não encontrado', 'error')
          setSaving(false)
          return
        }
        response = await api.put(`/admin/exercicios/${exercicio.id}`, payload)
      }

      // O backend retorna { message: '...', exercicio: {...} }
      const exercicioSalvo = response.data?.exercicio || response.data
      
      if (!exercicioSalvo || !exercicioSalvo.id) {
        console.error('Resposta inválida do servidor:', response.data)
        showToast('Erro: Dados inválidos retornados do servidor. Verifique o console para mais detalhes.', 'error')
        setSaving(false)
        return
      }
      
      showToast(
        isCreating ? 'Exercício criado com sucesso!' : 'Exercício atualizado com sucesso!',
        'success'
      )
      onSave(exercicioSalvo)
      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar exercício:', error)
      console.error('Detalhes do erro:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      
      let errorMessage = 'Erro ao salvar exercício'
      if (error.response?.data) {
        // Se houver uma mensagem de erro específica
        if (error.response.data.error) {
          errorMessage = error.response.data.error
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.details) {
          // Se for um erro de validação com detalhes
          if (Array.isArray(error.response.data.details)) {
            const detailsMessages = error.response.data.details.map((d: any) => {
              if (typeof d === 'string') return d
              return d.msg || d.message || `${d.param || 'Campo'}: ${d.msg || d.message || 'inválido'}`
            })
            errorMessage = `Erro de validação: ${detailsMessages.join('; ')}`
          } else {
            errorMessage = `Erro de validação: ${error.response.data.details}`
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else {
          // Tentar extrair qualquer informação útil
          errorMessage = JSON.stringify(error.response.data)
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      showToast(errorMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const exercicioAtual = exercicio || null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-primary/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-grey/30">
          <h3 className="text-2xl font-display font-bold text-light">
            {isCreating ? 'Novo Exercício' : 'Editar Exercício'}
          </h3>
          <button onClick={onClose} className="btn-secondary p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-grey/30">
          {(['basico', 'descricao', 'configuracoes', 'midia'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-light-muted hover:text-light'
              }`}
            >
              {tab === 'basico' && 'Básico'}
              {tab === 'descricao' && 'Descrição'}
              {tab === 'configuracoes' && 'Configurações'}
              {tab === 'midia' && 'Mídia'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Tab Básico */}
            {activeTab === 'basico' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Nome do Exercício <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className={`input-field w-full ${errors.nome ? 'border-red-400' : ''}`}
                    placeholder="Ex: Supino Reto"
                  />
                  {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Grupo Muscular Principal <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.grupoMuscularPrincipal}
                      onChange={(e) => setFormData(prev => ({ ...prev, grupoMuscularPrincipal: e.target.value }))}
                      className={`input-field w-full ${errors.grupoMuscularPrincipal ? 'border-red-400' : ''}`}
                    >
                      <option value="">Selecione...</option>
                      {gruposMusculares.map(grupo => (
                        <option key={grupo} value={grupo}>{grupo}</option>
                      ))}
                    </select>
                    {errors.grupoMuscularPrincipal && (
                      <p className="text-red-400 text-xs mt-1">{errors.grupoMuscularPrincipal}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Nível de Dificuldade <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.nivelDificuldade}
                      onChange={(e) => setFormData(prev => ({ ...prev, nivelDificuldade: e.target.value }))}
                      className={`input-field w-full ${errors.nivelDificuldade ? 'border-red-400' : ''}`}
                    >
                      <option value="">Selecione...</option>
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                    {errors.nivelDificuldade && (
                      <p className="text-red-400 text-xs mt-1">{errors.nivelDificuldade}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">Status</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-light">Exercício ativo</span>
                  </label>
                </div>
              </div>
            )}

            {/* Tab Descrição */}
            {activeTab === 'descricao' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light mb-2">Descrição</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    rows={4}
                    className="input-field w-full"
                    placeholder="Descrição do exercício..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">Execução Técnica</label>
                  <textarea
                    value={formData.execucaoTecnica}
                    onChange={(e) => setFormData(prev => ({ ...prev, execucaoTecnica: e.target.value }))}
                    rows={6}
                    className="input-field w-full"
                    placeholder="Como executar o exercício corretamente..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">Erros Comuns</label>
                  <textarea
                    value={arrayInputs.errosComuns}
                    onChange={(e) => handleArrayInputChange('errosComuns', e.target.value)}
                    rows={4}
                    className="input-field w-full"
                    placeholder="Um erro por linha..."
                  />
                  <p className="text-xs text-light-muted mt-1">Um item por linha</p>
                </div>
              </div>
            )}

            {/* Tab Configurações */}
            {activeTab === 'configuracoes' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">Carga Inicial Sugerida (kg)</label>
                    <input
                      type="number"
                      value={formData.cargaInicialSugerida !== null && formData.cargaInicialSugerida !== undefined ? formData.cargaInicialSugerida : ''}
                      onChange={(e) => {
                        const value = e.target.value.trim()
                        setFormData(prev => ({ 
                          ...prev, 
                          cargaInicialSugerida: value === '' ? null : (isNaN(parseFloat(value)) ? prev.cargaInicialSugerida : parseFloat(value))
                        }))
                      }}
                      className="input-field w-full"
                      placeholder="Ex: 20"
                      min="0"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light mb-2">RPE Sugerido</label>
                    <input
                      type="number"
                      value={formData.rpeSugerido !== null && formData.rpeSugerido !== undefined ? formData.rpeSugerido : ''}
                      onChange={(e) => {
                        const value = e.target.value.trim()
                        setFormData(prev => ({ 
                          ...prev, 
                          rpeSugerido: value === '' ? null : (isNaN(parseInt(value)) ? prev.rpeSugerido : parseInt(value))
                        }))
                      }}
                      className="input-field w-full"
                      placeholder="Ex: 7"
                      min="1"
                      max="10"
                      step="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">Equipamento Necessário</label>
                  <textarea
                    value={arrayInputs.equipamentoNecessario}
                    onChange={(e) => handleArrayInputChange('equipamentoNecessario', e.target.value)}
                    rows={3}
                    className="input-field w-full"
                    placeholder="Um equipamento por linha..."
                    disabled={formData.semEquipamento}
                  />
                  <p className="text-xs text-light-muted mt-1">Um item por linha</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.semEquipamento}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData(prev => ({ 
                          ...prev, 
                          semEquipamento: checked,
                          // Limpar equipamentoNecessario se marcar como sem equipamento
                          equipamentoNecessario: checked ? [] : prev.equipamentoNecessario
                        }));
                        if (checked) {
                          setArrayInputs(prev => ({ ...prev, equipamentoNecessario: '' }));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-light">Exercício sem equipamento (apenas peso corporal)</span>
                  </label>
                  <p className="text-xs text-light-muted mt-1">
                    Marque esta opção se o exercício não requer nenhum equipamento além do peso corporal
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">Músculos Sinergistas</label>
                  <textarea
                    value={arrayInputs.sinergistas}
                    onChange={(e) => handleArrayInputChange('sinergistas', e.target.value)}
                    rows={3}
                    className="input-field w-full"
                    placeholder="Um músculo por linha..."
                  />
                  <p className="text-xs text-light-muted mt-1">Um item por linha</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">Alternativas</label>
                  <textarea
                    value={arrayInputs.alternativas}
                    onChange={(e) => handleArrayInputChange('alternativas', e.target.value)}
                    rows={3}
                    className="input-field w-full"
                    placeholder="Um exercício alternativo por linha..."
                  />
                  <p className="text-xs text-light-muted mt-1">Um item por linha</p>
                </div>
              </div>
            )}

            {/* Tab Mídia */}
            {activeTab === 'midia' && exercicioAtual && (
              <div>
                <UploadExercicioMedia
                  exercicioId={exercicioAtual.id}
                  exercicioNome={exercicioAtual.nome}
                  imagemUrl={exercicioAtual.imagemUrl}
                  onUploadSuccess={async () => {
                    // Recarregar exercício após upload
                    try {
                      const response = await api.get(`/admin/exercicios/${exercicioAtual.id}`)
                      onSave(response.data)
                    } catch (error) {
                      console.error('Erro ao recarregar exercício:', error)
                    }
                  }}
                />
              </div>
            )}

            {activeTab === 'midia' && isCreating && (
              <div className="text-center py-12 text-light-muted">
                <p>Salve o exercício primeiro para adicionar mídia</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-grey/30">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : isCreating ? 'Criar Exercício' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

