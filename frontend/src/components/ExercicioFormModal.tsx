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
      setFormData({
        nome: exercicio.nome || '',
        grupoMuscularPrincipal: exercicio.grupoMuscularPrincipal || '',
        nivelDificuldade: exercicio.nivelDificuldade || '',
        descricao: exercicio.descricao || '',
        execucaoTecnica: exercicio.execucaoTecnica || '',
        errosComuns: Array.isArray(exercicio.errosComuns) ? exercicio.errosComuns : [],
        equipamentoNecessario: Array.isArray(exercicio.equipamentoNecessario) ? exercicio.equipamentoNecessario : [],
        alternativas: Array.isArray(exercicio.alternativas) ? exercicio.alternativas : [],
        sinergistas: Array.isArray(exercicio.sinergistas) ? exercicio.sinergistas : [],
        cargaInicialSugerida: exercicio.cargaInicialSugerida || null,
        rpeSugerido: exercicio.rpeSugerido || null,
        ativo: exercicio.ativo !== undefined ? exercicio.ativo : true
      })
      setArrayInputs({
        sinergistas: Array.isArray(exercicio.sinergistas) ? exercicio.sinergistas.join('\n') : '',
        errosComuns: Array.isArray(exercicio.errosComuns) ? exercicio.errosComuns.join('\n') : '',
        equipamentoNecessario: Array.isArray(exercicio.equipamentoNecessario) ? exercicio.equipamentoNecessario.join('\n') : '',
        alternativas: Array.isArray(exercicio.alternativas) ? exercicio.alternativas.join('\n') : ''
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
    setFormData(prev => ({ ...prev, [field.replace('s', '') as keyof typeof formData]: array }))
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
        errosComuns: formData.errosComuns,
        equipamentoNecessario: formData.equipamentoNecessario,
        alternativas: formData.alternativas,
        sinergistas: formData.sinergistas,
        ativo: formData.ativo
      }

      // Adicionar apenas se tiver valor
      if (formData.cargaInicialSugerida !== null && formData.cargaInicialSugerida !== undefined) {
        payload.cargaInicialSugerida = formData.cargaInicialSugerida
      }
      if (formData.rpeSugerido !== null && formData.rpeSugerido !== undefined) {
        payload.rpeSugerido = formData.rpeSugerido
      }

      let response
      if (isCreating) {
        response = await api.post('/admin/exercicios', payload)
      } else {
        response = await api.put(`/admin/exercicios/${exercicio?.id}`, payload)
      }

      showToast(
        isCreating ? 'Exercício criado com sucesso!' : 'Exercício atualizado com sucesso!',
        'success'
      )
      onSave(response.data)
      onClose()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro ao salvar exercício'
      showToast(errorMessage, 'error')
      console.error('Erro ao salvar exercício:', error)
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
                    className={`input w-full ${errors.nome ? 'border-red-400' : ''}`}
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
                      className={`input w-full ${errors.grupoMuscularPrincipal ? 'border-red-400' : ''}`}
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
                      className={`input w-full ${errors.nivelDificuldade ? 'border-red-400' : ''}`}
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
                    className="input w-full"
                    placeholder="Descrição do exercício..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">Execução Técnica</label>
                  <textarea
                    value={formData.execucaoTecnica}
                    onChange={(e) => setFormData(prev => ({ ...prev, execucaoTecnica: e.target.value }))}
                    rows={6}
                    className="input w-full"
                    placeholder="Como executar o exercício corretamente..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">Erros Comuns</label>
                  <textarea
                    value={arrayInputs.errosComuns}
                    onChange={(e) => handleArrayInputChange('errosComuns', e.target.value)}
                    rows={4}
                    className="input w-full"
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
                      value={formData.cargaInicialSugerida || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cargaInicialSugerida: e.target.value ? parseFloat(e.target.value) : null }))}
                      className="input w-full"
                      placeholder="Ex: 20"
                      min="0"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light mb-2">RPE Sugerido</label>
                    <input
                      type="number"
                      value={formData.rpeSugerido || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, rpeSugerido: e.target.value ? parseFloat(e.target.value) : null }))}
                      className="input w-full"
                      placeholder="Ex: 7"
                      min="1"
                      max="10"
                      step="0.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">Equipamento Necessário</label>
                  <textarea
                    value={arrayInputs.equipamentoNecessario}
                    onChange={(e) => handleArrayInputChange('equipamentoNecessario', e.target.value)}
                    rows={3}
                    className="input w-full"
                    placeholder="Um equipamento por linha..."
                  />
                  <p className="text-xs text-light-muted mt-1">Um item por linha</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">Músculos Sinergistas</label>
                  <textarea
                    value={arrayInputs.sinergistas}
                    onChange={(e) => handleArrayInputChange('sinergistas', e.target.value)}
                    rows={3}
                    className="input w-full"
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
                    className="input w-full"
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

