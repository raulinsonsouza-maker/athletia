import { useState, useEffect } from 'react'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import ExercicioImage from './ExercicioImage'
import { useExercicioMedia } from '../hooks/useExercicioMedia'

interface EditExercicioModalProps {
  exercicio: any | null
  isOpen: boolean
  isCreating: boolean
  gruposMusculares: string[]
  onClose: () => void
  onSave: (createdExercicio?: any) => void
  onShowPreview: (exercicio: any) => void
}

type TabType = 'basico' | 'descricao' | 'configuracoes' | 'midia'

export default function EditExercicioModal({
  exercicio,
  isOpen,
  isCreating,
  gruposMusculares,
  onClose,
  onSave,
  onShowPreview
}: EditExercicioModalProps) {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('basico')
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({
    nome: '',
    grupoMuscularPrincipal: '',
    nivelDificuldade: '',
    descricao: '',
    execucaoTecnica: '',
    sinergistas: [],
    errosComuns: [],
    equipamentoNecessario: [],
    alternativas: [],
    cargaInicialSugerida: null,
    rpeSugerido: null,
    ativo: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [arrayInputs, setArrayInputs] = useState({
    sinergistas: '',
    errosComuns: '',
    equipamentoNecessario: '',
    alternativas: ''
  })

  // Carregar dados do exercício quando modal abrir ou exercício mudar
  useEffect(() => {
    if (isOpen && exercicio) {
      setFormData({
        nome: exercicio.nome || '',
        grupoMuscularPrincipal: exercicio.grupoMuscularPrincipal || '',
        nivelDificuldade: exercicio.nivelDificuldade || '',
        descricao: exercicio.descricao || '',
        execucaoTecnica: exercicio.execucaoTecnica || '',
        sinergistas: Array.isArray(exercicio.sinergistas) ? exercicio.sinergistas : [],
        errosComuns: Array.isArray(exercicio.errosComuns) ? exercicio.errosComuns : [],
        equipamentoNecessario: Array.isArray(exercicio.equipamentoNecessario) ? exercicio.equipamentoNecessario : [],
        alternativas: Array.isArray(exercicio.alternativas) ? exercicio.alternativas : [],
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
      setErrors({})
      // Manter aba atual se já estiver definida, senão ir para básico
      if (activeTab === 'basico' || !activeTab) {
        setActiveTab('basico')
      }
    } else if (isOpen && isCreating && !exercicio) {
      // Resetar para criação apenas se não houver exercício
      setFormData({
        nome: '',
        grupoMuscularPrincipal: '',
        nivelDificuldade: '',
        descricao: '',
        execucaoTecnica: '',
        sinergistas: [],
        errosComuns: [],
        equipamentoNecessario: [],
        alternativas: [],
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
      setErrors({})
      setActiveTab('basico')
    }
  }, [isOpen, exercicio?.id, isCreating]) // Usar exercicio?.id para evitar loops

  // Validação em tempo real
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'nome':
        if (!value || value.trim() === '') return 'Nome é obrigatório'
        if (value.length < 3) return 'Nome deve ter pelo menos 3 caracteres'
        return ''
      case 'grupoMuscularPrincipal':
        if (!value || value.trim() === '') return 'Grupo muscular é obrigatório'
        return ''
      case 'nivelDificuldade':
        if (!value || value.trim() === '') return 'Nível de dificuldade é obrigatório'
        return ''
      case 'rpeSugerido':
        if (value !== null && value !== '') {
          const num = parseInt(value)
          if (isNaN(num) || num < 1 || num > 10) return 'RPE deve ser entre 1 e 10'
        }
        return ''
      case 'cargaInicialSugerida':
        if (value !== null && value !== '') {
          const num = parseFloat(value)
          if (isNaN(num) || num < 0) return 'Carga deve ser um número positivo'
        }
        return ''
      default:
        return ''
    }
  }

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }))
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleArrayFieldChange = (name: string, value: string) => {
    setArrayInputs((prev) => ({ ...prev, [name]: value }))
    const items = value.split('\n').filter(item => item.trim())
    setFormData((prev: any) => ({ ...prev, [name]: items }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar campos obrigatórios
    const newErrors: Record<string, string> = {}
    const nomeError = validateField('nome', formData.nome)
    const grupoError = validateField('grupoMuscularPrincipal', formData.grupoMuscularPrincipal)
    const nivelError = validateField('nivelDificuldade', formData.nivelDificuldade)

    if (nomeError) newErrors.nome = nomeError
    if (grupoError) newErrors.grupoMuscularPrincipal = grupoError
    if (nivelError) newErrors.nivelDificuldade = nivelError

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showToast('Por favor, corrija os erros no formulário', 'error')
      setActiveTab('basico')
      return
    }

    setSaving(true)
    try {
      if (isCreating) {
        const response = await api.post('/admin/exercicios', formData)
        showToast('Exercício criado com sucesso!', 'success')
        // Chamar onSave passando o exercício criado para atualizar no componente pai
        onSave(response.data.exercicio || response.data)
        // Mudar para aba de mídia para permitir upload
        setActiveTab('midia')
      } else {
        await api.put(`/admin/exercicios/${exercicio.id}`, formData)
        showToast('Exercício atualizado com sucesso!', 'success')
        onSave()
        onClose()
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro ao salvar exercício'
      showToast(errorMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Hook para mídia do exercício
  const exercicioMedia = useExercicioMedia({
    onError: () => {}
  })

  const tabs: Array<{ id: TabType; label: string; icon: JSX.Element }> = [
    {
      id: 'basico',
      label: 'Informações Básicas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'descricao',
      label: 'Descrição e Técnica',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'midia',
      label: 'Mídia',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ]

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-dark rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-dark border-b border-grey/30 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-display font-bold text-light">
            {isCreating ? 'Criar Novo Exercício' : 'Editar Exercício'}
          </h2>
          <button
            onClick={onClose}
            className="text-light-muted hover:text-light transition-colors p-2 hover:bg-dark-lighter rounded-lg"
            disabled={saving}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-grey/30 px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-light-muted hover:text-light'
                }`}
                disabled={saving}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Tab: Informações Básicas */}
            {activeTab === 'basico' && (
              <div className="space-y-6">
                {/* Preview da Mídia (apenas em edição) */}
                {!isCreating && exercicio && exercicioMedia.hasMedia && (
                  <div className="bg-dark-lighter rounded-lg p-4 border border-grey/30">
                    <label className="block text-sm font-medium text-light mb-3">
                      Visualização Atual
                    </label>
                    <div className="flex items-center gap-4">
                      <ExercicioImage
                        exercicio={exercicio}
                        size="large"
                        onPreview={() => onShowPreview(exercicio)}
                        className="flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-light-muted mb-1">Demonstração de execução</p>
                        <p className="text-xs text-light-muted">
                          Clique na imagem para visualizar em tamanho maior
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Nome do Exercício <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleFieldChange('nome', e.target.value)}
                      className={`input-field ${errors.nome ? 'border-red-400' : ''}`}
                      placeholder="Ex: Supino Reto com Barra"
                      required
                    />
                    {errors.nome && (
                      <p className="text-xs text-red-400 mt-1">{errors.nome}</p>
                    )}
                  </div>

                  {/* Grupo Muscular Principal */}
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Grupo Muscular Principal <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.grupoMuscularPrincipal}
                      onChange={(e) => handleFieldChange('grupoMuscularPrincipal', e.target.value)}
                      className={`input-field ${errors.grupoMuscularPrincipal ? 'border-red-400' : ''}`}
                      required
                    >
                      <option value="">Selecione um grupo...</option>
                      {gruposMusculares.map((grupo) => (
                        <option key={grupo} value={grupo}>
                          {grupo}
                        </option>
                      ))}
                    </select>
                    {errors.grupoMuscularPrincipal && (
                      <p className="text-xs text-red-400 mt-1">{errors.grupoMuscularPrincipal}</p>
                    )}
                  </div>

                  {/* Nível de Dificuldade */}
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Nível de Dificuldade <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.nivelDificuldade}
                      onChange={(e) => handleFieldChange('nivelDificuldade', e.target.value)}
                      className={`input-field ${errors.nivelDificuldade ? 'border-red-400' : ''}`}
                      required
                    >
                      <option value="">Selecione o nível...</option>
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                    {errors.nivelDificuldade && (
                      <p className="text-xs text-red-400 mt-1">{errors.nivelDificuldade}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Status
                    </label>
                    <select
                      value={formData.ativo ? 'true' : 'false'}
                      onChange={(e) => handleFieldChange('ativo', e.target.value === 'true')}
                      className="input-field"
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Descrição e Técnica */}
            {activeTab === 'descricao' && (
              <div className="space-y-6">
                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Descrição do Exercício
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => handleFieldChange('descricao', e.target.value)}
                    className="input-field"
                    rows={4}
                    placeholder="Descreva o exercício de forma clara e objetiva..."
                  />
                  <p className="text-xs text-light-muted mt-1">
                    {formData.descricao.length} caracteres
                  </p>
                </div>

                {/* Execução Técnica */}
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Execução Técnica
                  </label>
                  <textarea
                    value={formData.execucaoTecnica}
                    onChange={(e) => handleFieldChange('execucaoTecnica', e.target.value)}
                    className="input-field"
                    rows={6}
                    placeholder="Descreva passo a passo como executar o exercício corretamente..."
                  />
                  <p className="text-xs text-light-muted mt-1">
                    {formData.execucaoTecnica.length} caracteres
                  </p>
                </div>

                {/* Sinergistas */}
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Grupos Musculares Sinergistas
                  </label>
                  <textarea
                    value={arrayInputs.sinergistas}
                    onChange={(e) => handleArrayFieldChange('sinergistas', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Peito&#10;Ombros&#10;Tríceps"
                  />
                  <p className="text-xs text-light-muted mt-1">
                    {formData.sinergistas.length} grupo(s) adicionado(s) - um por linha
                  </p>
                  {formData.sinergistas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.sinergistas.map((item: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary/20 text-primary rounded text-xs"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Erros Comuns */}
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Erros Comuns
                  </label>
                  <textarea
                    value={arrayInputs.errosComuns}
                    onChange={(e) => handleArrayFieldChange('errosComuns', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Arquear demais as costas&#10;Movimento muito rápido&#10;Amplitude insuficiente"
                  />
                  <p className="text-xs text-light-muted mt-1">
                    {formData.errosComuns.length} erro(s) adicionado(s) - um por linha
                  </p>
                  {formData.errosComuns.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.errosComuns.map((item: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-red-400/20 text-red-400 rounded text-xs"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Equipamento Necessário */}
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Equipamento Necessário
                  </label>
                  <textarea
                    value={arrayInputs.equipamentoNecessario}
                    onChange={(e) => handleArrayFieldChange('equipamentoNecessario', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Barra&#10;Anilhas&#10;Banco"
                  />
                  <p className="text-xs text-light-muted mt-1">
                    {formData.equipamentoNecessario.length} equipamento(s) adicionado(s) - um por linha
                  </p>
                  {formData.equipamentoNecessario.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.equipamentoNecessario.map((item: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-400/20 text-blue-400 rounded text-xs"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Configurações */}
            {activeTab === 'configuracoes' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Carga Inicial Sugerida */}
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Carga Inicial Sugerida (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.cargaInicialSugerida || ''}
                      onChange={(e) => handleFieldChange('cargaInicialSugerida', e.target.value ? parseFloat(e.target.value) : null)}
                      className={`input-field ${errors.cargaInicialSugerida ? 'border-red-400' : ''}`}
                      placeholder="Ex: 20.0"
                    />
                    {errors.cargaInicialSugerida && (
                      <p className="text-xs text-red-400 mt-1">{errors.cargaInicialSugerida}</p>
                    )}
                  </div>

                  {/* RPE Sugerido */}
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      RPE Sugerido (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.rpeSugerido || ''}
                      onChange={(e) => handleFieldChange('rpeSugerido', e.target.value ? parseInt(e.target.value) : null)}
                      className={`input-field ${errors.rpeSugerido ? 'border-red-400' : ''}`}
                      placeholder="Ex: 6"
                    />
                    {errors.rpeSugerido && (
                      <p className="text-xs text-red-400 mt-1">{errors.rpeSugerido}</p>
                    )}
                    <p className="text-xs text-light-muted mt-1">
                      Escala de Percepção de Esforço (1 = muito fácil, 10 = máximo esforço)
                    </p>
                  </div>
                </div>

                {/* Alternativas */}
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Exercícios Alternativos (IDs)
                  </label>
                  <textarea
                    value={arrayInputs.alternativas}
                    onChange={(e) => handleArrayFieldChange('alternativas', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="uuid-exercicio-1&#10;uuid-exercicio-2"
                  />
                  <p className="text-xs text-light-muted mt-1">
                    {formData.alternativas.length} alternativa(s) adicionada(s) - um ID por linha
                  </p>
                  {formData.alternativas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.alternativas.map((item: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-400/20 text-purple-400 rounded text-xs font-mono"
                        >
                          {item.substring(0, 8)}...
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Mídia */}
            {activeTab === 'midia' && (
              <div className="space-y-6">
                {exercicio?.id ? (
                  <div>
                    <label className="block text-sm font-medium text-light mb-3">
                      Demonstração de Execução
                    </label>
                    <UploadGif
                      key={`upload-gif-${exercicio.id}-${exercicio.gifUrl || 'no-gif'}`}
                      exercicioId={exercicio.id}
                      exercicioNome={formData.nome || 'Exercício'}
                      gifUrl={exercicio.gifUrl || null}
                      onUploadSuccess={async () => {
                        // Recarregar dados do exercício após upload
                        try {
                          const response = await api.get(`/admin/exercicios/${exercicio.id}`)
                          // Atualizar formData com dados atualizados
                          const updated = response.data
                          setFormData((prev: any) => ({
                            ...prev,
                            gifUrl: updated.gifUrl
                          }))
                        } catch (err) {
                          if (import.meta.env.DEV) {
                            console.error('[EditExercicioModal] Erro ao recarregar exercício:', err)
                          }
                        }
                        onSave()
                      }}
                    />
                    <p className="text-xs text-light-muted mt-2">
                      Formatos aceitos: GIF, JPEG, PNG, WebP, MP4, WebM. Tamanho máximo: 5MB
                    </p>
                  </div>
                ) : (
                  <div className="bg-dark-lighter rounded-lg p-8 border border-grey/30 text-center">
                    <svg className="w-16 h-16 text-light-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-light-muted mb-2">
                      Salve o exercício primeiro para adicionar uma demonstração
                    </p>
                    <p className="text-xs text-light-muted">
                      Após criar o exercício, você será redirecionado para esta aba automaticamente
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer com botões */}
          <div className="sticky bottom-0 bg-dark border-t border-grey/30 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={saving}
            >
              {isCreating ? 'Cancelar' : 'Fechar'}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="spinner h-4 w-4"></div>
                  {isCreating ? 'Criando...' : 'Salvando...'}
                </>
              ) : (
                isCreating ? 'Criar Exercício' : 'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

