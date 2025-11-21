import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import UploadGif from '../components/UploadGif'

interface User {
  id: string
  email: string
  nome: string | null
  telefone?: string | null
  role: string
  plano?: string | null
  planoAtivo?: boolean
  dataPagamento?: string | null
  createdAt: string
  updatedAt?: string
  perfil?: {
    objetivo: string | null
    experiencia: string | null
    pesoAtual: number | null
  }
}

interface UserDetails {
  usuario: {
    id: string
    email: string
    nome: string | null
    telefone: string | null
    dataNascimento: string | null
    role: string
    plano: string | null
    planoAtivo: boolean
    dataPagamento: string | null
    createdAt: string
    updatedAt: string
  }
  perfil: UserProfile | null
  historicoPeso: HistoricoPeso[]
  treinos: {
    proximos: UserTraining[]
    passados: UserTraining[]
  }
  estatisticas: UserStats
}

interface UserProfile {
  idade: number | null
  sexo: string | null
  altura: number | null
  pesoAtual: number | null
  percentualGordura: number | null
  tipoCorpo: string | null
  experiencia: string | null
  objetivo: string | null
  frequencia: number | null
  tempoDisponivel: number | null
  localTreino: string | null
  rpeMedio: number | null
  lesoes: string[]
  preferencias: string[]
  problemasAnteriores: string[]
  objetivosAdicionais: string[]
}

interface UserTraining {
  id: string
  tipo: string
  data: string
  concluido: boolean
  observacoes: string | null
  numeroExercicios: number
  tempoEstimado: number
}

interface HistoricoPeso {
  id: string
  peso: number
  data: string
}

interface UserStats {
  totalTreinos: number
  treinosConcluidos: number
  treinosPendentes: number
  taxaConclusao: number
  pesoInicial: number | null
  pesoAtual: number | null
  variacaoPeso: number | null
}

interface Estatisticas {
  usuarios: {
    total: number
    admins: number
    usuarios: number
    comPerfil: number
    semPerfil?: number
    comPlanoSemPerfil?: number
    comPerfilSemPlano?: number
    comPlanoAtivo?: number
  }
  treinos: {
    total: number
    concluidos?: number
    taxaConclusao?: number
  }
  exercicios: {
    total: number
  }
  financeiro?: {
    receitaTotal: number
    receitaMensal: number
    receitaPorPlano: {
      mensal: number
      trimestral: number
      semestral: number
    }
    planosAtivos: {
      mensal: number
      trimestral: number
      semestral: number
      total: number
    }
    precos: {
      MENSAL: number
      TRIMESTRAL: number
      SEMESTRAL: number
    }
  }
  metricas?: {
    taxaConversao: number
    taxaConclusaoTreinos: number
    perfilCompleto: number
    perfilIncompleto: number
  }
}

export default function Admin() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [loading, setLoading] = useState(true)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(false)
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null)
  const [errorEstatisticas, setErrorEstatisticas] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'usuarios' | 'exercicios' | 'estatisticas'>('estatisticas')
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [search, setSearch] = useState('')
  const [exercicios, setExercicios] = useState<any[]>([])
  const [gruposMusculares, setGruposMusculares] = useState<string[]>([])
  const [loadingExercicios, setLoadingExercicios] = useState(false)
  const [errorExercicios, setErrorExercicios] = useState<string | null>(null)
  const [searchExercicio, setSearchExercicio] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState<string>('')
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'table'>(() => {
    const saved = localStorage.getItem('adminViewMode')
    return (saved as 'cards' | 'list' | 'table') || 'cards'
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    nome: '',
    role: 'USER' as 'USER' | 'ADMIN'
  })
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [, setSelectedUserId] = useState<string | null>(null) // Usado apenas para setter
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [detailsTab, setDetailsTab] = useState<'basicas' | 'onboarding' | 'treinos' | 'historico'>('basicas')
  const [viewModeExercicios, setViewModeExercicios] = useState<'cards' | 'list' | 'table'>(() => {
    const saved = localStorage.getItem('adminViewModeExercicios')
    return (saved as 'cards' | 'list' | 'table') || 'list'
  })
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedExercicioId, setSelectedExercicioId] = useState<string | null>(null)
  const [exercicioEdit, setExercicioEdit] = useState<any>(null)
  const [loadingExercicioEdit, setLoadingExercicioEdit] = useState(false)
  const [savingExercicio, setSavingExercicio] = useState(false)
  const [isCreatingExercicio, setIsCreatingExercicio] = useState(false)
  const [showGifPreview, setShowGifPreview] = useState(false)
  const [exercicioPreview, setExercicioPreview] = useState<any>(null)

  useEffect(() => {
    verificarAdmin()
  }, [])

  useEffect(() => {
    if (activeTab === 'usuarios') {
      carregarUsuarios()
    } else if (activeTab === 'estatisticas') {
      carregarEstatisticas()
    } else if (activeTab === 'exercicios') {
      carregarExercicios()
    }
  }, [activeTab, search, searchExercicio, filtroGrupo])

  const verificarAdmin = async () => {
    try {
      // Verificar se tem token admin
      const adminToken = localStorage.getItem('adminAccessToken')
      if (!adminToken) {
        navigate('/admin/login')
        return
      }

      // Verificar se token é válido tentando buscar estatísticas
      await carregarEstatisticas()
      setLoading(false)
    } catch (error: any) {
      console.error('Erro ao verificar admin:', error)
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('adminRefreshToken')
        localStorage.removeItem('adminUser')
        showToast('Sessão expirada. Faça login novamente.', 'error')
        navigate('/admin/login')
      } else if (error.isNetworkError || !error.response) {
        // Erro de rede - backend offline
        showToast('Erro de conexão. Verifique se o backend está rodando na porta 3001.', 'error')
        setLoading(false)
      } else {
        showToast('Erro ao verificar autenticação. Tente novamente.', 'error')
        setLoading(false)
      }
    }
  }

  const carregarUsuarios = async () => {
    setLoadingUsuarios(true)
    setErrorUsuarios(null)
    
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      const response = await api.get(`/admin/usuarios${params}`)
      setUsuarios(response.data.usuarios || [])
      
      if (response.data.usuarios && response.data.usuarios.length === 0 && search) {
        setErrorUsuarios(`Nenhum usuário encontrado para "${search}"`)
      }
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error)
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('adminRefreshToken')
        localStorage.removeItem('adminUser')
        showToast('Sessão expirada. Faça login novamente.', 'error')
        navigate('/admin/login')
      } else if (error.isNetworkError || !error.response) {
        const errorMsg = 'Erro de conexão. Verifique se o backend está rodando na porta 3001.'
        setErrorUsuarios(errorMsg)
        showToast(errorMsg, 'error')
      } else {
        const errorMsg = error.response?.data?.error || error.message || 'Erro ao carregar usuários'
        setErrorUsuarios(errorMsg)
        showToast(errorMsg, 'error')
      }
    } finally {
      setLoadingUsuarios(false)
    }
  }

  const carregarExercicios = async () => {
    setLoadingExercicios(true)
    setErrorExercicios(null)
    
    try {
      // Buscar todos os exercícios (filtros aplicados no frontend)
      const response = await api.get('/admin/exercicios')
      const todosExercicios = response.data.exercicios || []
      setGruposMusculares(response.data.gruposMusculares || [])
      
      // Aplicar filtros no frontend
      let exerciciosFiltrados = todosExercicios
      
      // Filtro por busca (nome)
      if (searchExercicio) {
        const searchLower = searchExercicio.toLowerCase()
        exerciciosFiltrados = exerciciosFiltrados.filter((ex: any) =>
          ex.nome.toLowerCase().includes(searchLower)
        )
      }
      
      // Filtro por grupo muscular
      if (filtroGrupo) {
        exerciciosFiltrados = exerciciosFiltrados.filter((ex: any) =>
          ex.grupoMuscularPrincipal === filtroGrupo
        )
      }
      
      setExercicios(exerciciosFiltrados)
      
      if (exerciciosFiltrados.length === 0 && (searchExercicio || filtroGrupo)) {
        setErrorExercicios(`Nenhum exercício encontrado${searchExercicio ? ` para "${searchExercicio}"` : ''}${filtroGrupo ? ` no grupo "${filtroGrupo}"` : ''}`)
      }
    } catch (error: any) {
      console.error('Erro ao carregar exercícios:', error)
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('adminRefreshToken')
        localStorage.removeItem('adminUser')
        showToast('Sessão expirada. Faça login novamente.', 'error')
        navigate('/admin/login')
      } else if (error.isNetworkError || !error.response) {
        const errorMsg = 'Erro de conexão. Verifique se o backend está rodando na porta 3001.'
        setErrorExercicios(errorMsg)
        showToast(errorMsg, 'error')
      } else {
        const errorMsg = error.response?.data?.error || error.message || 'Erro ao carregar exercícios'
        setErrorExercicios(errorMsg)
        showToast(errorMsg, 'error')
      }
    } finally {
      setLoadingExercicios(false)
    }
  }

  const carregarEstatisticas = async () => {
    setLoadingEstatisticas(true)
    setErrorEstatisticas(null)
    
    try {
      const response = await api.get('/admin/estatisticas')
      setEstatisticas(response.data)
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error)
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('adminRefreshToken')
        localStorage.removeItem('adminUser')
        showToast('Sessão expirada. Faça login novamente.', 'error')
        navigate('/admin/login')
      } else if (error.isNetworkError || !error.response) {
        const errorMsg = 'Erro de conexão. Verifique se o backend está rodando na porta 3001.'
        setErrorEstatisticas(errorMsg)
        showToast(errorMsg, 'error')
      } else {
        const errorMsg = error.response?.data?.error || error.message || 'Erro ao carregar estatísticas'
        setErrorEstatisticas(errorMsg)
        // Não mostrar toast para erro de estatísticas no carregamento inicial
        if (!loading) {
          showToast(errorMsg, 'error')
        }
      }
    } finally {
      setLoadingEstatisticas(false)
    }
  }

  const carregarDetalhesUsuario = async (userId: string) => {
    setLoadingDetails(true)
    try {
      const response = await api.get(`/admin/usuarios/${userId}`)
      setUserDetails(response.data)
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do usuário:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('adminRefreshToken')
        localStorage.removeItem('adminUser')
        showToast('Sessão expirada. Faça login novamente.', 'error')
        navigate('/admin/login')
      } else if (error.isNetworkError || !error.response) {
        showToast('Erro de conexão. Verifique se o backend está rodando na porta 3001.', 'error')
      } else {
        showToast(error.response?.data?.error || 'Erro ao carregar detalhes do usuário', 'error')
      }
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleShowDetails = (userId: string) => {
    setSelectedUserId(userId)
    setShowDetailsModal(true)
    setDetailsTab('basicas')
    carregarDetalhesUsuario(userId)
  }

  const handleCloseDetails = () => {
    setShowDetailsModal(false)
    setSelectedUserId(null)
    setUserDetails(null)
    setDetailsTab('basicas')
  }

  const handleViewModeChange = (mode: 'cards' | 'list' | 'table') => {
    setViewMode(mode)
    localStorage.setItem('adminViewMode', mode)
  }

  const handleViewModeExerciciosChange = (mode: 'cards' | 'list' | 'table') => {
    setViewModeExercicios(mode)
    localStorage.setItem('adminViewModeExercicios', mode)
  }

  const handleCreateExercicio = () => {
    setIsCreatingExercicio(true)
    setSelectedExercicioId(null)
    setExercicioEdit({
      nome: '',
      grupoMuscularPrincipal: '',
      nivelDificuldade: '',
      descricao: '',
      execucaoTecnica: '',
      sinergistas: [],
      errosComuns: [],
      equipamentoNecessario: [],
      cargaInicialSugerida: null,
      rpeSugerido: null,
      alternativas: [],
      ativo: true
    })
    setShowEditModal(true)
  }

  const handleEditExercicio = async (exercicioId: string) => {
    setIsCreatingExercicio(false)
    setSelectedExercicioId(exercicioId)
    setShowEditModal(true)
    setLoadingExercicioEdit(true)
    setExercicioEdit(null)
    
    try {
      const response = await api.get(`/admin/exercicios/${exercicioId}`)
      setExercicioEdit(response.data)
    } catch (error: any) {
      console.error('Erro ao carregar exercício:', error)
      showToast(error.response?.data?.error || 'Erro ao carregar exercício', 'error')
      setShowEditModal(false)
    } finally {
      setLoadingExercicioEdit(false)
    }
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedExercicioId(null)
    setExercicioEdit(null)
    setIsCreatingExercicio(false)
  }

  const handleSaveExercicio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exercicioEdit) return

    setSavingExercicio(true)
    try {
      if (isCreatingExercicio) {
        // Criar novo exercício
        const response = await api.post('/admin/exercicios', exercicioEdit)
        showToast('Exercício criado com sucesso!', 'success')
        // Atualizar estado para modo edição e manter modal aberto
        setSelectedExercicioId(response.data.exercicio.id)
        setExercicioEdit(response.data.exercicio)
        setIsCreatingExercicio(false)
        carregarExercicios()
      } else {
        // Atualizar exercício existente
        if (!selectedExercicioId) return
        await api.put(`/admin/exercicios/${selectedExercicioId}`, exercicioEdit)
        showToast('Exercício atualizado com sucesso!', 'success')
        handleCloseEditModal()
        carregarExercicios()
      }
    } catch (error: any) {
      console.error('Erro ao salvar exercício:', error)
      showToast(error.response?.data?.error || `Erro ao ${isCreatingExercicio ? 'criar' : 'atualizar'} exercício`, 'error')
    } finally {
      setSavingExercicio(false)
    }
  }

  // Função helper para construir URL do GIF
  // Baseado na implementação do fitnessprogramer.com para URLs confiáveis
  const getGifUrl = (gifUrl: string | null) => {
    if (!gifUrl) {
      return null
    }
    
    // Se já é uma URL completa, retornar como está
    if (gifUrl.startsWith('http://') || gifUrl.startsWith('https://')) {
      return gifUrl
    }
    
    // Construir URL completa baseada na configuração do ambiente
    // VITE_API_URL pode ser 'http://localhost:3001/api' ou 'http://localhost:3001'
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    
    // Remover /api do final se existir, pois a URL do GIF já inclui /api
    let baseUrl = apiBaseUrl.replace(/\/api$/, '').replace(/\/$/, '')
    
    // A URL do gifUrl já vem como /api/uploads/exercicios/{id}/exercicio.gif
    // Garantir que comece com /
    const relativeUrl = gifUrl.startsWith('/') ? gifUrl : `/${gifUrl}`
    
    // Construir URL completa
    const fullUrl = `${baseUrl}${relativeUrl}`
    
    return fullUrl
  }

  // Função para abrir preview do GIF
  const handleShowGifPreview = (exercicio: any) => {
    setExercicioPreview(exercicio)
    setShowGifPreview(true)
  }

  const handleCriarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      await api.post('/admin/usuarios', formData)
      setShowCreateModal(false)
      setFormData({ email: '', senha: '', nome: '', role: 'USER' })
      await carregarUsuarios()
      await carregarEstatisticas()
      showToast('Usuário criado com sucesso!', 'success')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro ao criar usuário'
      if (error.response?.data?.details) {
        const details = error.response.data.details.map((d: any) => d.msg).join(', ')
        showToast(`${errorMessage}: ${details}`, 'error')
      } else {
        showToast(errorMessage, 'error')
      }
    } finally {
      setCreating(false)
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

  const handleLogout = () => {
    localStorage.removeItem('adminAccessToken')
    localStorage.removeItem('adminRefreshToken')
    localStorage.removeItem('adminUser')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen">
      <ToastContainer />
      <nav className="navbar">
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-display font-bold text-light">Painel Administrativo</h1>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </nav>
      
      <main className="container-custom section">
        {/* Tabs */}
        <div className="card mb-6">
          <div className="border-b border-grey/30">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('estatisticas')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'estatisticas'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-light-muted hover:text-light hover:border-grey/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Estatísticas
              </button>
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'usuarios'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-light-muted hover:text-light hover:border-grey/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Usuários
              </button>
              <button
                onClick={() => setActiveTab('exercicios')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'exercicios'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-light-muted hover:text-light hover:border-grey/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Exercícios
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'usuarios' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold text-light">Gerenciar Usuários</h2>
              <div className="flex items-center gap-3">
                {/* Botões de Visualização */}
                <div className="flex items-center gap-1 bg-dark-lighter rounded-lg p-1 border border-grey/30">
                  <button
                    onClick={() => handleViewModeChange('cards')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-primary text-dark'
                        : 'text-light-muted hover:text-light'
                    }`}
                    title="Visualização em Cards"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-primary text-dark'
                        : 'text-light-muted hover:text-light'
                    }`}
                    title="Visualização em Lista"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleViewModeChange('table')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'table'
                        ? 'bg-primary text-dark'
                        : 'text-light-muted hover:text-light'
                    }`}
                    title="Visualização em Tabela"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Criar Usuário
                </button>
              </div>
            </div>

            {/* Busca */}
            <div className="mb-6">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field"
                placeholder="Buscar por email ou nome..."
              />
            </div>

            {/* Lista de Usuários */}
            {loadingUsuarios ? (
              <div className="text-center py-12">
                <div className="spinner h-8 w-8 mx-auto"></div>
                <p className="mt-4 text-light-muted">Carregando usuários...</p>
              </div>
            ) : errorUsuarios ? (
              <div className="text-center py-12">
                <div className="text-red-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-400 mb-2">{errorUsuarios}</p>
                <button onClick={carregarUsuarios} className="btn-secondary text-sm mt-4">
                  Tentar Novamente
                </button>
              </div>
            ) : (
              <>
                {usuarios.length > 0 && (
                  <div className="mb-4 text-sm text-light-muted">
                    {usuarios.length} {usuarios.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
                  </div>
                )}
                
                {/* Visualização em Cards */}
                {viewMode === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {usuarios.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleShowDetails(user.id)}
                        className="card-hover cursor-pointer transition-all"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-light mb-1">
                                {user.nome || 'Sem nome'}
                              </h3>
                              <p className="text-light-muted text-sm truncate">{user.email}</p>
                              {user.telefone && (
                                <p className="text-light-muted text-sm mt-1">{user.telefone}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {user.role === 'ADMIN' ? (
                              <span className="badge-primary text-xs">Admin</span>
                            ) : (
                              <span className="badge-secondary text-xs">User</span>
                            )}
                            {user.planoAtivo ? (
                              <span className="badge-success text-xs">Plano Ativo</span>
                            ) : (
                              <span className="badge-error text-xs">Sem Plano</span>
                            )}
                            {user.perfil ? (
                              <span className="badge-success text-xs">Perfil Completo</span>
                            ) : (
                              <span className="badge-warning text-xs">Sem Perfil</span>
                            )}
                            {user.plano && (
                              <span className="badge-primary text-xs">{user.plano}</span>
                            )}
                          </div>

                          {user.perfil && (
                            <div className="mb-3 space-y-1">
                              {user.perfil.objetivo && (
                                <p className="text-light-muted text-xs">
                                  <span className="font-medium">Objetivo:</span> {user.perfil.objetivo}
                                </p>
                              )}
                              {user.perfil.experiencia && (
                                <p className="text-light-muted text-xs">
                                  <span className="font-medium">Experiência:</span> {user.perfil.experiencia}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="mt-auto pt-3 border-t border-grey/30">
                            <p className="text-light-muted text-xs">
                              Cadastrado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleShowDetails(user.id)
                              }}
                              className="btn-secondary text-xs w-full mt-2"
                            >
                              Ver Detalhes
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Visualização em Lista Compacta */}
                {viewMode === 'list' && (
                  <div className="space-y-2">
                    {usuarios.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleShowDetails(user.id)}
                        className="card-hover cursor-pointer p-4 flex items-center justify-between hover:bg-dark-lighter transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-light truncate">
                              {user.nome || 'Sem nome'}
                            </h3>
                            <p className="text-light-muted text-sm truncate">{user.email}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {user.role === 'ADMIN' ? (
                              <span className="badge-primary text-xs">Admin</span>
                            ) : (
                              <span className="badge-secondary text-xs">User</span>
                            )}
                            {user.planoAtivo ? (
                              <span className="badge-success text-xs">Plano Ativo</span>
                            ) : (
                              <span className="badge-error text-xs">Sem Plano</span>
                            )}
                            {user.perfil ? (
                              <span className="badge-success text-xs">Perfil</span>
                            ) : (
                              <span className="badge-warning text-xs">Sem Perfil</span>
                            )}
                            {user.plano && (
                              <span className="badge-primary text-xs">{user.plano}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShowDetails(user.id)
                          }}
                          className="btn-secondary text-xs ml-4"
                        >
                          Ver Detalhes
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Visualização em Tabela */}
                {viewMode === 'table' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-grey/30">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Nome</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Telefone</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Plano</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Perfil</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Cadastro</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((user) => (
                          <tr
                            key={user.id}
                            onClick={() => handleShowDetails(user.id)}
                            className="border-b border-grey/10 hover:bg-dark-lighter cursor-pointer transition-colors"
                          >
                            <td className="py-3 px-4 text-sm text-light font-medium">
                              {user.nome || 'Sem nome'}
                            </td>
                            <td className="py-3 px-4 text-sm text-light-muted">{user.email}</td>
                            <td className="py-3 px-4 text-sm text-light-muted">
                              {user.telefone || '-'}
                            </td>
                            <td className="py-3 px-4">
                              {user.plano ? (
                                <span className="badge-primary text-xs">{user.plano}</span>
                              ) : (
                                <span className="text-light-muted text-xs">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {user.planoAtivo ? (
                                <span className="badge-success text-xs">Ativo</span>
                              ) : (
                                <span className="badge-error text-xs">Inativo</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {user.perfil ? (
                                <span className="badge-success text-xs">Completo</span>
                              ) : (
                                <span className="badge-warning text-xs">Incompleto</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-light-muted">
                              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleShowDetails(user.id)
                                }}
                                className="btn-secondary text-xs"
                              >
                                Ver Detalhes
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {usuarios.length === 0 && !search && (
                  <div className="text-center py-12 text-light-muted">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg mb-2">Nenhum usuário cadastrado</p>
                    <p className="text-sm">Clique em "Criar Usuário" para começar</p>
                  </div>
                )}
                {usuarios.length === 0 && search && (
                  <div className="text-center py-12 text-light-muted">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-lg mb-2">Nenhum usuário encontrado</p>
                    <p className="text-sm">Tente buscar com outro termo</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'exercicios' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold text-light">Gerenciar Exercícios</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-dark-lighter rounded-lg p-1">
                  <button
                    onClick={() => handleViewModeExerciciosChange('cards')}
                    className={`p-2 rounded transition-colors ${
                      viewModeExercicios === 'cards'
                        ? 'bg-primary text-dark'
                        : 'text-light-muted hover:text-light'
                    }`}
                    title="Visualização em Cards"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleViewModeExerciciosChange('list')}
                    className={`p-2 rounded transition-colors ${
                      viewModeExercicios === 'list'
                        ? 'bg-primary text-dark'
                        : 'text-light-muted hover:text-light'
                    }`}
                    title="Visualização em Lista"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleViewModeExerciciosChange('table')}
                    className={`p-2 rounded transition-colors ${
                      viewModeExercicios === 'table'
                        ? 'bg-primary text-dark'
                        : 'text-light-muted hover:text-light'
                    }`}
                    title="Visualização em Tabela"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <button 
                  onClick={handleCreateExercicio}
                  className="btn-primary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar Exercício
                </button>
              </div>
            </div>

            {/* Busca e Filtro */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchExercicio}
                    onChange={(e) => setSearchExercicio(e.target.value)}
                    className="input-field"
                    placeholder="Buscar por nome do exercício..."
                  />
                </div>
                <div className="md:w-64">
                  <select
                    value={filtroGrupo}
                    onChange={(e) => setFiltroGrupo(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Todos os grupos musculares</option>
                    {gruposMusculares.map((grupo) => (
                      <option key={grupo} value={grupo}>
                        {grupo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de Exercícios */}
            {loadingExercicios ? (
              <div className="text-center py-12">
                <div className="spinner h-8 w-8 mx-auto"></div>
                <p className="mt-4 text-light-muted">Carregando exercícios...</p>
              </div>
            ) : errorExercicios ? (
              <div className="text-center py-12">
                <div className="text-red-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-400 mb-2">{errorExercicios}</p>
                <button onClick={carregarExercicios} className="btn-secondary text-sm mt-4">
                  Tentar Novamente
                </button>
              </div>
            ) : (
              <>
                {exercicios.length > 0 && (
                  <div className="mb-4 text-sm text-light-muted">
                    {exercicios.length} {exercicios.length === 1 ? 'exercício encontrado' : 'exercícios encontrados'}
                  </div>
                )}
                
                {/* Visualização em Cards */}
                {viewModeExercicios === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exercicios.map((exercicio) => {
                      const gifFullUrl = getGifUrl(exercicio.gifUrl)
                      
                      return (
                        <div
                          key={exercicio.id}
                          className="card-hover p-5"
                        >
                          <div className="flex flex-col">
                            <div className="mb-4">
                              {/* Miniatura da Demonstração */}
                              {gifFullUrl && (
                                <div className="mb-3">
                                  <div className="relative w-full h-32 rounded-lg border border-grey/30 overflow-hidden bg-dark-lighter flex items-center justify-center">
                                    <img
                                      src={gifFullUrl}
                                      alt={`Demonstração de execução de ${exercicio.nome}`}
                                      className="w-full h-full object-contain cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => handleShowGifPreview(exercicio)}
                                      onError={(e) => {
                                        const target = e.currentTarget
                                        target.style.display = 'none'
                                      }}
                                    />
                                    <button
                                      onClick={() => handleShowGifPreview(exercicio)}
                                      className="absolute top-2 right-2 btn-secondary text-xs p-1.5 rounded z-10"
                                      title="Visualizar em tamanho maior"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              <h3 className="text-lg font-semibold text-light mb-2">
                                {exercicio.nome}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className="badge-primary text-xs">{exercicio.grupoMuscularPrincipal}</span>
                                <span className="badge-secondary text-xs">{exercicio.nivelDificuldade}</span>
                                {exercicio.ativo ? (
                                  <span className="badge-success text-xs">Ativo</span>
                                ) : (
                                  <span className="badge-error text-xs">Inativo</span>
                                )}
                              </div>
                              {exercicio.descricao && (
                                <p className="text-sm text-light-muted line-clamp-2 mb-2">
                                  {exercicio.descricao}
                                </p>
                              )}
                            </div>

                            <div className="mt-auto pt-4 border-t border-grey/30">
                              <button
                                onClick={() => handleEditExercicio(exercicio.id)}
                                className="btn-secondary btn-sm w-full flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar Exercício
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Visualização em Lista */}
                {viewModeExercicios === 'list' && (
                  <div className="space-y-3">
                    {exercicios.map((exercicio) => {
                      const gifFullUrl = getGifUrl(exercicio.gifUrl)
                      
                      return (
                        <div
                          key={exercicio.id}
                          className="card-hover p-4 flex items-center gap-4"
                        >
                          {gifFullUrl ? (
                            <div className="relative flex-shrink-0">
                              <div className="w-20 h-20 rounded-md border border-grey/30 overflow-hidden bg-dark-lighter flex items-center justify-center">
                                <img
                                  src={gifFullUrl}
                                  alt={`Demonstração de execução de ${exercicio.nome}`}
                                  className="w-full h-full object-contain cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => handleShowGifPreview(exercicio)}
                                  onError={(e) => {
                                    const target = e.currentTarget
                                    target.style.display = 'none'
                                  }}
                                />
                              </div>
                              <button
                                onClick={() => handleShowGifPreview(exercicio)}
                                className="absolute top-1 right-1 btn-secondary text-xs p-1 rounded z-10"
                                title="Visualizar em tamanho maior"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-md border border-grey/30 bg-dark-lighter flex items-center justify-center flex-shrink-0">
                              <svg className="w-8 h-8 text-light-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-light mb-1 truncate">
                              {exercicio.nome}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="badge-primary text-xs">{exercicio.grupoMuscularPrincipal}</span>
                              <span className="badge-secondary text-xs">{exercicio.nivelDificuldade}</span>
                              {exercicio.ativo ? (
                                <span className="badge-success text-xs">Ativo</span>
                              ) : (
                                <span className="badge-error text-xs">Inativo</span>
                              )}
                            </div>
                            {exercicio.descricao && (
                              <p className="text-sm text-light-muted line-clamp-1">
                                {exercicio.descricao}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleEditExercicio(exercicio.id)}
                              className="btn-secondary btn-sm flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Visualização em Tabela */}
                {viewModeExercicios === 'table' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-grey/30">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Nome</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Grupo Muscular</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Nível</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Demonstração</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exercicios.map((exercicio) => {
                          const gifFullUrl = getGifUrl(exercicio.gifUrl)
                          
                          return (
                            <tr
                              key={exercicio.id}
                              className="border-b border-grey/10 hover:bg-dark-lighter transition-colors"
                            >
                              <td className="py-3 px-4 text-sm text-light font-medium">
                                {exercicio.nome}
                              </td>
                              <td className="py-3 px-4">
                                <span className="badge-primary text-xs">{exercicio.grupoMuscularPrincipal}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="badge-secondary text-xs">{exercicio.nivelDificuldade}</span>
                              </td>
                              <td className="py-3 px-4">
                                {exercicio.ativo ? (
                                  <span className="badge-success text-xs">Ativo</span>
                                ) : (
                                  <span className="badge-error text-xs">Inativo</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {gifFullUrl ? (
                                  <div className="relative inline-block">
                                    <div className="w-12 h-12 rounded border border-grey/30 overflow-hidden bg-dark-lighter flex items-center justify-center">
                                      <img
                                        src={gifFullUrl}
                                        alt={`Demonstração de execução de ${exercicio.nome}`}
                                        className="w-full h-full object-contain cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => handleShowGifPreview(exercicio)}
                                        onError={(e) => {
                                          const target = e.currentTarget
                                          target.style.display = 'none'
                                        }}
                                      />
                                    </div>
                                    <button
                                      onClick={() => handleShowGifPreview(exercicio)}
                                      className="absolute -top-1 -right-1 btn-secondary text-xs p-0.5 rounded-full z-10"
                                      title="Visualizar em tamanho maior"
                                    >
                                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded border border-grey/30 bg-dark-lighter flex items-center justify-center">
                                    <svg className="w-5 h-5 text-light-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleEditExercicio(exercicio.id)}
                                  className="btn-secondary text-xs flex items-center gap-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Editar
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {exercicios.length === 0 && !searchExercicio && !filtroGrupo && (
                  <div className="text-center py-12 text-light-muted">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <p className="text-lg mb-2">Nenhum exercício cadastrado</p>
                    <p className="text-sm">Os exercícios aparecerão aqui quando forem cadastrados</p>
                  </div>
                )}
                {exercicios.length === 0 && (searchExercicio || filtroGrupo) && (
                  <div className="text-center py-12 text-light-muted">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-lg mb-2">Nenhum exercício encontrado</p>
                    <p className="text-sm">Tente buscar com outro termo ou filtrar por outro grupo</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'estatisticas' && (
          <div className="space-y-6">
            {loadingEstatisticas ? (
              <div className="card">
                <div className="flex items-center justify-center py-12">
                  <div className="spinner h-8 w-8"></div>
                  <p className="ml-4 text-light-muted">Carregando estatísticas...</p>
                </div>
              </div>
            ) : errorEstatisticas ? (
              <div className="card">
                <div className="text-center py-12">
                  <div className="text-red-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-400 mb-2">{errorEstatisticas}</p>
                  <button onClick={carregarEstatisticas} className="btn-secondary text-sm mt-4">
                    Tentar Novamente
                  </button>
                </div>
              </div>
            ) : estatisticas ? (
              <>
                {/* Resumo Geral */}
                <div className="card">
                  <h2 className="text-2xl font-display font-bold text-light mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Resumo Geral
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card-hover p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-light-muted">Total de Usuários</p>
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-3xl font-bold text-primary">{estatisticas.usuarios.total}</p>
                      <p className="text-xs text-light-muted mt-1">
                        {estatisticas.usuarios.admins} admins, {estatisticas.usuarios.usuarios} usuários
                      </p>
                    </div>
                    <div className="card-hover p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-light-muted">Usuários com Plano Ativo</p>
                        <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-3xl font-bold text-success">{estatisticas.usuarios.comPlanoAtivo || 0}</p>
                      <p className="text-xs text-light-muted mt-1">
                        {estatisticas.metricas?.taxaConversao ? `${estatisticas.metricas.taxaConversao}% de conversão` : 'N/A'}
                      </p>
                    </div>
                    <div className="card-hover p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-light-muted">Total de Treinos</p>
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-3xl font-bold text-primary">{estatisticas.treinos.total}</p>
                      <p className="text-xs text-light-muted mt-1">
                        {estatisticas.treinos.concluidos || 0} concluídos ({estatisticas.treinos.taxaConclusao || 0}%)
                      </p>
                    </div>
                    <div className="card-hover p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-light-muted">Total de Exercícios</p>
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </div>
                      <p className="text-3xl font-bold text-primary">{estatisticas.exercicios.total}</p>
                      <p className="text-xs text-light-muted mt-1">Exercícios cadastrados</p>
                    </div>
                  </div>
                </div>

                {/* Dados Financeiros */}
                {estatisticas.financeiro && (
                  <div className="card">
                    <h2 className="text-2xl font-display font-bold text-light mb-6 flex items-center gap-2">
                      <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Dados Financeiros
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="card-hover p-4 bg-gradient-to-br from-success/20 to-success/5 border border-success/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-light-muted">Receita Total</p>
                          <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold text-success">
                          R$ {estatisticas.financeiro.receitaTotal.toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-xs text-light-muted mt-1">Soma de todos os planos ativos</p>
                      </div>
                      <div className="card-hover p-4 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-light-muted">Receita Mensal</p>
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold text-primary">
                          R$ {estatisticas.financeiro.receitaMensal.toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-xs text-light-muted mt-1">Mês atual</p>
                      </div>
                      <div className="card-hover p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-light-muted">Planos Ativos</p>
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold text-primary">{estatisticas.financeiro.planosAtivos.total}</p>
                        <p className="text-xs text-light-muted mt-1">Total de assinaturas ativas</p>
                      </div>
                      <div className="card-hover p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-light-muted">Taxa de Conversão</p>
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold text-primary">
                          {estatisticas.metricas?.taxaConversao || 0}%
                        </p>
                        <p className="text-xs text-light-muted mt-1">Onboarding → Pagamento</p>
                      </div>
                    </div>

                    {/* Receita por Plano */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-light mb-4">Receita por Tipo de Plano</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card-hover p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-light">Mensal</p>
                            <span className="badge-primary text-xs">{estatisticas.financeiro.planosAtivos.mensal} ativos</span>
                          </div>
                          <p className="text-2xl font-bold text-primary">
                            R$ {estatisticas.financeiro.receitaPorPlano.mensal.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-xs text-light-muted mt-1">
                            R$ {estatisticas.financeiro.precos.MENSAL.toFixed(2).replace('.', ',')} por assinatura
                          </p>
                        </div>
                        <div className="card-hover p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-light">Trimestral</p>
                            <span className="badge-primary text-xs">{estatisticas.financeiro.planosAtivos.trimestral} ativos</span>
                          </div>
                          <p className="text-2xl font-bold text-primary">
                            R$ {estatisticas.financeiro.receitaPorPlano.trimestral.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-xs text-light-muted mt-1">
                            R$ {estatisticas.financeiro.precos.TRIMESTRAL.toFixed(2).replace('.', ',')} por assinatura
                          </p>
                        </div>
                        <div className="card-hover p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-light">Semestral</p>
                            <span className="badge-primary text-xs">{estatisticas.financeiro.planosAtivos.semestral} ativos</span>
                          </div>
                          <p className="text-2xl font-bold text-primary">
                            R$ {estatisticas.financeiro.receitaPorPlano.semestral.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-xs text-light-muted mt-1">
                            R$ {estatisticas.financeiro.precos.SEMESTRAL.toFixed(2).replace('.', ',')} por assinatura
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Métricas de Conversão */}
                {estatisticas.metricas && (
                  <div className="card">
                    <h2 className="text-2xl font-display font-bold text-light mb-6 flex items-center gap-2">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Métricas de Conversão e Engajamento
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="card-hover p-4">
                        <p className="text-sm text-light-muted mb-2">Taxa de Conversão</p>
                        <p className="text-3xl font-bold text-primary">{estatisticas.metricas.taxaConversao}%</p>
                        <p className="text-xs text-light-muted mt-1">Usuários com plano ativo</p>
                      </div>
                      <div className="card-hover p-4">
                        <p className="text-sm text-light-muted mb-2">Taxa de Conclusão de Treinos</p>
                        <p className="text-3xl font-bold text-primary">{estatisticas.metricas.taxaConclusaoTreinos}%</p>
                        <p className="text-xs text-light-muted mt-1">Média geral</p>
                      </div>
                      <div className="card-hover p-4">
                        <p className="text-sm text-light-muted mb-2">Perfis Completos</p>
                        <p className="text-3xl font-bold text-success">{estatisticas.metricas.perfilCompleto}</p>
                        <p className="text-xs text-light-muted mt-1">Onboarding completo</p>
                      </div>
                      <div className="card-hover p-4">
                        <p className="text-sm text-light-muted mb-2">Perfis Incompletos</p>
                        <p className="text-3xl font-bold text-warning">{estatisticas.metricas.perfilIncompleto}</p>
                        <p className="text-xs text-light-muted mt-1">Onboarding incompleto</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Distribuição de Usuários */}
                <div className="card">
                  <h2 className="text-2xl font-display font-bold text-light mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Distribuição de Usuários
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="card-hover p-4">
                      <p className="text-sm text-light-muted mb-2">Com Perfil Completo</p>
                      <p className="text-2xl font-bold text-success">{estatisticas.usuarios.comPerfil}</p>
                    </div>
                    <div className="card-hover p-4">
                      <p className="text-sm text-light-muted mb-2">Sem Perfil</p>
                      <p className="text-2xl font-bold text-warning">{estatisticas.usuarios.semPerfil || 0}</p>
                    </div>
                    <div className="card-hover p-4">
                      <p className="text-sm text-light-muted mb-2">Com Plano mas Sem Perfil</p>
                      <p className="text-2xl font-bold text-error">{estatisticas.usuarios.comPlanoSemPerfil || 0}</p>
                    </div>
                    <div className="card-hover p-4">
                      <p className="text-sm text-light-muted mb-2">Com Perfil mas Sem Plano</p>
                      <p className="text-2xl font-bold text-warning">{estatisticas.usuarios.comPerfilSemPlano || 0}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card">
                <div className="text-center py-12 text-light-muted">
                  <p>Nenhuma estatística disponível</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Criar Usuário */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full animate-scale-in border border-primary/30">
            <h3 className="text-xl font-display font-bold text-light mb-6">Criar Novo Usuário</h3>
            <form onSubmit={handleCriarUsuario} className="space-y-4">
              <div>
                <label className="label-field">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="usuario@exemplo.com"
                  required
                />
              </div>
              <div>
                <label className="label-field">Senha *</label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="input-field"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="label-field">Nome (opcional)</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="input-field"
                  placeholder="Nome do usuário"
                />
              </div>
              <div>
                <label className="label-field">Tipo de Usuário</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
                  className="input-field"
                >
                  <option value="USER">Usuário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <div className="spinner h-4 w-4 mr-2"></div>
                      Criando...
                    </>
                  ) : (
                    'Criar Usuário'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ email: '', senha: '', nome: '', role: 'USER' })
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Usuário */}
      {showDetailsModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseDetails}
        >
          <div 
            className="card max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-primary/30"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="spinner h-8 w-8"></div>
                <p className="ml-4 text-light-muted">Carregando detalhes...</p>
              </div>
            ) : userDetails ? (
              <>
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-grey/30">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-light">
                      {userDetails.usuario.nome || 'Usuário'}
                    </h3>
                    <p className="text-light-muted text-sm mt-1">{userDetails.usuario.email}</p>
                  </div>
                  <button
                    onClick={handleCloseDetails}
                    className="btn-secondary p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-grey/30 mb-6">
                  <nav className="flex -mb-px">
                    {(['basicas', 'onboarding', 'treinos', 'historico'] as const).map((tab) => {
                      const labels = {
                        basicas: 'Informações Básicas',
                        onboarding: 'Dados do Onboarding',
                        treinos: 'Treinos',
                        historico: 'Histórico e Progresso'
                      }
                      return (
                        <button
                          key={tab}
                          onClick={() => setDetailsTab(tab)}
                          className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                            detailsTab === tab
                              ? 'border-primary text-primary'
                              : 'border-transparent text-light-muted hover:text-light hover:border-grey/50'
                          }`}
                        >
                          {labels[tab]}
                        </button>
                      )
                    })}
                  </nav>
                </div>

                {/* Conteúdo das Tabs */}
                <div className="flex-1 overflow-y-auto">
                  {detailsTab === 'basicas' && (
                    <div className="space-y-6">
                      {/* Dados Pessoais */}
                      <div className="card-hover p-5">
                        <h4 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Dados Pessoais
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Nome</label>
                            <p className="text-base text-light font-medium">{userDetails.usuario.nome || 'Não informado'}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Email</label>
                            <p className="text-base text-light font-medium">{userDetails.usuario.email}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Telefone</label>
                            <p className="text-base text-light">{userDetails.usuario.telefone || 'Não informado'}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Data de Nascimento</label>
                            <p className="text-base text-light">
                              {userDetails.usuario.dataNascimento 
                                ? new Date(userDetails.usuario.dataNascimento).toLocaleDateString('pt-BR')
                                : 'Não informado'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status da Conta */}
                      <div className="card-hover p-5">
                        <h4 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Status da Conta
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Tipo de Usuário</label>
                            <div className="mt-1">
                              {userDetails.usuario.role === 'ADMIN' ? (
                                <span className="badge-primary">Administrador</span>
                              ) : (
                                <span className="badge-secondary">Usuário</span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Status do Plano</label>
                            <div className="mt-1">
                              {userDetails.usuario.planoAtivo ? (
                                <span className="badge-success">Ativo</span>
                              ) : (
                                <span className="badge-error">Inativo</span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Plano Contratado</label>
                            <p className="text-base text-light font-medium">{userDetails.usuario.plano || 'Nenhum plano'}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Data do Último Pagamento</label>
                            <p className="text-base text-light">
                              {userDetails.usuario.dataPagamento
                                ? new Date(userDetails.usuario.dataPagamento).toLocaleDateString('pt-BR')
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Informações do Sistema */}
                      <div className="card-hover p-5">
                        <h4 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Informações do Sistema
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Data de Cadastro</label>
                            <p className="text-base text-light font-medium">
                              {new Date(userDetails.usuario.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Última Atualização</label>
                            <p className="text-base text-light font-medium">
                              {new Date(userDetails.usuario.updatedAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {detailsTab === 'onboarding' && (
                    <div className="space-y-6">
                      {userDetails.perfil ? (
                        <>
                          {/* Dados Pessoais e Físicos */}
                          <div className="card-hover p-5">
                            <h4 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Dados Pessoais e Físicos
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Idade</label>
                                <p className="text-base text-light font-medium">{userDetails.perfil.idade ? `${userDetails.perfil.idade} anos` : 'Não informado'}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Sexo</label>
                                <p className="text-base text-light font-medium">{userDetails.perfil.sexo || 'Não informado'}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Altura</label>
                                <p className="text-base text-light font-medium">{userDetails.perfil.altura ? `${userDetails.perfil.altura} cm` : 'Não informado'}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Peso Atual</label>
                                <p className="text-base text-light font-medium">{userDetails.perfil.pesoAtual ? `${userDetails.perfil.pesoAtual} kg` : 'Não informado'}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-light-muted uppercase tracking-wide">% Gordura Corporal</label>
                                <p className="text-base text-light font-medium">{userDetails.perfil.percentualGordura ? `${userDetails.perfil.percentualGordura}%` : 'Não informado'}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Tipo de Corpo</label>
                                <p className="text-base text-light font-medium">{userDetails.perfil.tipoCorpo || 'Não informado'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Dados de Treino */}
                          <div className="card-hover p-5">
                            <h4 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              Dados de Treino
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Experiência</label>
                                <p className="text-base text-light font-medium">{userDetails.perfil.experiencia || 'Não informado'}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Objetivo Principal</label>
                                <p className="text-base text-light font-medium">{userDetails.perfil.objetivo || 'Não informado'}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Frequência Semanal</label>
                                <p className="text-base text-light font-medium">{userDetails.perfil.frequencia ? `${userDetails.perfil.frequencia} vezes/semana` : 'Não informado'}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Tempo Disponível</label>
                                <p className="text-base text-light font-medium">{userDetails.perfil.tempoDisponivel ? `${userDetails.perfil.tempoDisponivel} minutos` : 'Não informado'}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Local de Treino</label>
                                <p className="text-base text-light font-medium">{userDetails.perfil.localTreino || 'Não informado'}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-light-muted uppercase tracking-wide">RPE Médio</label>
                                <p className="text-base text-light font-medium">{userDetails.perfil.rpeMedio || 'Não informado'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Informações Adicionais */}
                          {(userDetails.perfil.lesoes.length > 0 || 
                            userDetails.perfil.preferencias.length > 0 || 
                            userDetails.perfil.problemasAnteriores.length > 0 || 
                            userDetails.perfil.objetivosAdicionais.length > 0) && (
                            <div className="card-hover p-5">
                              <h4 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Informações Adicionais
                              </h4>
                              <div className="space-y-4">
                                {userDetails.perfil.lesoes.length > 0 && (
                                  <div>
                                    <label className="text-xs font-medium text-light-muted uppercase tracking-wide mb-2 block">Lesões</label>
                                    <div className="flex flex-wrap gap-2">
                                      {userDetails.perfil.lesoes.map((lesao, idx) => (
                                        <span key={idx} className="badge-warning">{lesao}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {userDetails.perfil.preferencias.length > 0 && (
                                  <div>
                                    <label className="text-xs font-medium text-light-muted uppercase tracking-wide mb-2 block">Preferências</label>
                                    <div className="flex flex-wrap gap-2">
                                      {userDetails.perfil.preferencias.map((pref, idx) => (
                                        <span key={idx} className="badge-primary">{pref}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {userDetails.perfil.problemasAnteriores.length > 0 && (
                                  <div>
                                    <label className="text-xs font-medium text-light-muted uppercase tracking-wide mb-2 block">Problemas Anteriores</label>
                                    <div className="flex flex-wrap gap-2">
                                      {userDetails.perfil.problemasAnteriores.map((prob, idx) => (
                                        <span key={idx} className="badge-error">{prob}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {userDetails.perfil.objetivosAdicionais.length > 0 && (
                                  <div>
                                    <label className="text-xs font-medium text-light-muted uppercase tracking-wide mb-2 block">Objetivos Adicionais</label>
                                    <div className="flex flex-wrap gap-2">
                                      {userDetails.perfil.objetivosAdicionais.map((obj, idx) => (
                                        <span key={idx} className="badge-success">{obj}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-12 text-light-muted">
                          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p className="text-lg">Perfil não encontrado</p>
                          <p className="text-sm">Este usuário ainda não completou o onboarding</p>
                        </div>
                      )}
                    </div>
                  )}

                  {detailsTab === 'treinos' && (
                    <div className="space-y-6">
                      {/* Estatísticas */}
                      <div className="card-hover p-5">
                        <h4 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Estatísticas de Treinos
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-light-muted uppercase tracking-wide">Total</p>
                            <p className="text-2xl font-bold text-primary">{userDetails.estatisticas.totalTreinos}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-light-muted uppercase tracking-wide">Concluídos</p>
                            <p className="text-2xl font-bold text-success">{userDetails.estatisticas.treinosConcluidos}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-light-muted uppercase tracking-wide">Pendentes</p>
                            <p className="text-2xl font-bold text-warning">{userDetails.estatisticas.treinosPendentes}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-light-muted uppercase tracking-wide">Taxa de Conclusão</p>
                            <p className="text-2xl font-bold text-primary">{userDetails.estatisticas.taxaConclusao}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Próximos Treinos */}
                      {userDetails.treinos.proximos.length > 0 && (
                        <div className="card-hover p-5">
                          <h4 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Próximos Treinos
                          </h4>
                          <div className="space-y-3">
                            {userDetails.treinos.proximos.map((treino) => (
                              <div key={treino.id} className="p-4 bg-dark-lighter rounded-lg border border-grey/20 hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-semibold text-light text-base mb-1">{treino.tipo}</p>
                                    <p className="text-sm text-light-muted mb-2">
                                      {new Date(treino.data).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-light-muted">
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                        {treino.numeroExercicios} exercícios
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {treino.tempoEstimado} min
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    {treino.concluido ? (
                                      <span className="badge-success">Concluído</span>
                                    ) : (
                                      <span className="badge-warning">Pendente</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Treinos Passados */}
                      {userDetails.treinos.passados.length > 0 && (
                        <div className="card-hover p-5">
                          <h4 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Treinos Passados
                          </h4>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {userDetails.treinos.passados.map((treino) => (
                              <div key={treino.id} className="p-4 bg-dark-lighter rounded-lg border border-grey/20 hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-semibold text-light text-base mb-1">{treino.tipo}</p>
                                    <p className="text-sm text-light-muted mb-2">
                                      {new Date(treino.data).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-light-muted">
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                        {treino.numeroExercicios} exercícios
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {treino.tempoEstimado} min
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    {treino.concluido ? (
                                      <span className="badge-success">Concluído</span>
                                    ) : (
                                      <span className="badge-error">Não concluído</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {userDetails.treinos.proximos.length === 0 && userDetails.treinos.passados.length === 0 && (
                        <div className="text-center py-12 text-light-muted">
                          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-lg">Nenhum treino encontrado</p>
                          <p className="text-sm">Este usuário ainda não possui treinos gerados</p>
                        </div>
                      )}
                    </div>
                  )}

                  {detailsTab === 'historico' && (
                    <div className="space-y-6">
                      {/* Estatísticas de Peso */}
                      <div className="card-hover p-5">
                        <h4 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Estatísticas de Peso
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-light-muted uppercase tracking-wide">Peso Inicial</p>
                            <p className="text-2xl font-bold text-primary">
                              {userDetails.estatisticas.pesoInicial ? `${userDetails.estatisticas.pesoInicial} kg` : 'N/A'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-light-muted uppercase tracking-wide">Peso Atual</p>
                            <p className="text-2xl font-bold text-primary">
                              {userDetails.estatisticas.pesoAtual ? `${userDetails.estatisticas.pesoAtual} kg` : 'N/A'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-light-muted uppercase tracking-wide">Variação</p>
                            <p className={`text-2xl font-bold ${
                              userDetails.estatisticas.variacaoPeso !== null
                                ? userDetails.estatisticas.variacaoPeso > 0
                                  ? 'text-success'
                                  : userDetails.estatisticas.variacaoPeso < 0
                                  ? 'text-error'
                                  : 'text-primary'
                                : 'text-light-muted'
                            }`}>
                              {userDetails.estatisticas.variacaoPeso !== null
                                ? `${userDetails.estatisticas.variacaoPeso > 0 ? '+' : ''}${userDetails.estatisticas.variacaoPeso.toFixed(2)} kg`
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Histórico Completo */}
                      {userDetails.historicoPeso.length > 0 ? (
                        <div className="card-hover p-5">
                          <h4 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Histórico Completo de Peso
                          </h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {userDetails.historicoPeso.map((registro, idx) => {
                              const variacao = idx > 0 
                                ? registro.peso - userDetails.historicoPeso[idx - 1].peso
                                : null
                              return (
                                <div key={registro.id} className="p-3 bg-dark-lighter rounded-lg border border-grey/20 hover:border-primary/30 transition-colors">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-semibold text-light text-base">{registro.peso} kg</p>
                                      <p className="text-sm text-light-muted mt-1">
                                        {new Date(registro.data).toLocaleDateString('pt-BR', {
                                          day: '2-digit',
                                          month: 'long',
                                          year: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                    {variacao !== null && (
                                      <span className={`badge ${
                                        variacao > 0 ? 'badge-success' : variacao < 0 ? 'badge-error' : 'badge-secondary'
                                      }`}>
                                        {variacao > 0 ? '+' : ''}{variacao.toFixed(2)} kg
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-light-muted">
                          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-lg">Nenhum registro de peso</p>
                          <p className="text-sm">Este usuário ainda não registrou seu peso</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-light-muted">
                <p>Erro ao carregar detalhes do usuário</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Edição de Exercício */}
      {showEditModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseEditModal}
        >
          <div
            className="bg-dark rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-dark border-b border-grey/30 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-display font-bold text-light">
                {isCreatingExercicio ? 'Criar Exercício' : 'Editar Exercício'}
              </h2>
              <button
                onClick={handleCloseEditModal}
                className="text-light-muted hover:text-light transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingExercicioEdit && !isCreatingExercicio ? (
              <div className="p-12 text-center">
                <div className="spinner h-8 w-8 mx-auto"></div>
                <p className="mt-4 text-light-muted">Carregando exercício...</p>
              </div>
            ) : exercicioEdit ? (
              <form onSubmit={handleSaveExercicio} className="p-6 space-y-6">
                {/* Preview da Demonstração - Exibir no topo do formulário */}
                {!isCreatingExercicio && exercicioEdit.gifUrl && (
                  <div className="mb-6 pb-6 border-b border-grey/30">
                    <label className="block text-sm font-medium text-light mb-3">
                      Visualização do Exercício
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-32 h-32 rounded-lg border border-grey/30 overflow-hidden bg-dark-lighter flex items-center justify-center">
                          <img
                            src={getGifUrl(exercicioEdit.gifUrl) || ''}
                            alt={`Demonstração de execução de ${exercicioEdit.nome || 'Exercício'}`}
                            className="w-full h-full object-contain cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => exercicioEdit && handleShowGifPreview(exercicioEdit)}
                            onError={(e) => {
                              const target = e.currentTarget
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                        <button
                          onClick={() => setShowGifPreview(true)}
                          className="absolute top-2 right-2 btn-secondary text-xs p-1.5 rounded z-10"
                          title="Visualizar em tamanho maior"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </button>
                      </div>
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
                      Nome <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={exercicioEdit.nome || ''}
                      onChange={(e) => setExercicioEdit({ ...exercicioEdit, nome: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Grupo Muscular Principal */}
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Grupo Muscular Principal <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={exercicioEdit.grupoMuscularPrincipal || ''}
                      onChange={(e) => setExercicioEdit({ ...exercicioEdit, grupoMuscularPrincipal: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Selecione...</option>
                      {gruposMusculares.map((grupo) => (
                        <option key={grupo} value={grupo}>
                          {grupo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nível de Dificuldade */}
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Nível de Dificuldade <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={exercicioEdit.nivelDificuldade || ''}
                      onChange={(e) => setExercicioEdit({ ...exercicioEdit, nivelDificuldade: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">Status</label>
                    <select
                      value={exercicioEdit.ativo ? 'true' : 'false'}
                      onChange={(e) => setExercicioEdit({ ...exercicioEdit, ativo: e.target.value === 'true' })}
                      className="input-field"
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                  </div>

                  {/* Carga Inicial Sugerida */}
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Carga Inicial Sugerida (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={exercicioEdit.cargaInicialSugerida || ''}
                      onChange={(e) => setExercicioEdit({ ...exercicioEdit, cargaInicialSugerida: e.target.value ? parseFloat(e.target.value) : null })}
                      className="input-field"
                    />
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
                      value={exercicioEdit.rpeSugerido || ''}
                      onChange={(e) => setExercicioEdit({ ...exercicioEdit, rpeSugerido: e.target.value ? parseInt(e.target.value) : null })}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-light mb-2">Descrição</label>
                  <textarea
                    value={exercicioEdit.descricao || ''}
                    onChange={(e) => setExercicioEdit({ ...exercicioEdit, descricao: e.target.value })}
                    className="input-field"
                    rows={3}
                  />
                </div>

                {/* Execução Técnica */}
                <div>
                  <label className="block text-sm font-medium text-light mb-2">Execução Técnica</label>
                  <textarea
                    value={exercicioEdit.execucaoTecnica || ''}
                    onChange={(e) => setExercicioEdit({ ...exercicioEdit, execucaoTecnica: e.target.value })}
                    className="input-field"
                    rows={4}
                  />
                </div>

                {/* Sinergistas */}
                <div>
                  <label className="block text-sm font-medium text-light mb-2">Sinergistas (um por linha)</label>
                  <textarea
                    value={Array.isArray(exercicioEdit.sinergistas) ? exercicioEdit.sinergistas.join('\n') : ''}
                    onChange={(e) => {
                      const sinergistas = e.target.value.split('\n').filter(s => s.trim())
                      setExercicioEdit({ ...exercicioEdit, sinergistas })
                    }}
                    className="input-field"
                    rows={3}
                    placeholder="Peito&#10;Ombros"
                  />
                </div>

                {/* Erros Comuns */}
                <div>
                  <label className="block text-sm font-medium text-light mb-2">Erros Comuns (um por linha)</label>
                  <textarea
                    value={Array.isArray(exercicioEdit.errosComuns) ? exercicioEdit.errosComuns.join('\n') : ''}
                    onChange={(e) => {
                      const errosComuns = e.target.value.split('\n').filter(e => e.trim())
                      setExercicioEdit({ ...exercicioEdit, errosComuns })
                    }}
                    className="input-field"
                    rows={3}
                    placeholder="Arquear demais as costas&#10;Movimento muito rápido"
                  />
                </div>

                {/* Equipamento Necessário */}
                <div>
                  <label className="block text-sm font-medium text-light mb-2">Equipamento Necessário (um por linha)</label>
                  <textarea
                    value={Array.isArray(exercicioEdit.equipamentoNecessario) ? exercicioEdit.equipamentoNecessario.join('\n') : ''}
                    onChange={(e) => {
                      const equipamentoNecessario = e.target.value.split('\n').filter(e => e.trim())
                      setExercicioEdit({ ...exercicioEdit, equipamentoNecessario })
                    }}
                    className="input-field"
                    rows={3}
                    placeholder="Barra&#10;Anilhas"
                  />
                </div>

                {/* Upload de GIF - Apenas quando há ID (após criação ou em edição) */}
                {selectedExercicioId && (
                  <div className="pt-4 border-t border-grey/30">
                    <label className="block text-sm font-medium text-light mb-3">GIF de Demonstração</label>
                    <UploadGif
                      key={`upload-gif-${selectedExercicioId}-${exercicioEdit.gifUrl || 'no-gif'}`}
                      exercicioId={selectedExercicioId}
                      exercicioNome={exercicioEdit.nome || 'Exercício'}
                      gifUrl={exercicioEdit.gifUrl || null}
                      onUploadSuccess={async () => {
                        console.log('[Admin] onUploadSuccess chamado, recarregando exercício...')
                        // Recarregar dados do exercício após upload para atualizar gifUrl
                        if (selectedExercicioId) {
                          try {
                            const response = await api.get(`/admin/exercicios/${selectedExercicioId}`)
                            console.log('[Admin] Exercício recarregado:', response.data)
                            setExercicioEdit(response.data)
                          } catch (err) {
                            console.error('[Admin] Erro ao recarregar exercício:', err)
                          }
                        }
                        // Recarregar lista de exercícios
                        await carregarExercicios()
                      }}
                    />
                  </div>
                )}

                {/* Botões */}
                <div className="flex justify-end gap-3 pt-4 border-t border-grey/30">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="btn-secondary"
                    disabled={savingExercicio}
                  >
                    {isCreatingExercicio ? 'Cancelar' : 'Fechar'}
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={savingExercicio}
                  >
                    {savingExercicio ? (
                      <>
                        <div className="spinner h-4 w-4"></div>
                        {isCreatingExercicio ? 'Criando...' : 'Salvando...'}
                      </>
                    ) : (
                      isCreatingExercicio ? 'Criar Exercício' : 'Salvar Alterações'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-12 text-center text-light-muted">
                <p>Erro ao carregar exercício</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Preview da Demonstração em Tamanho Maior */}
      {showGifPreview && (exercicioPreview?.gifUrl || exercicioEdit?.gifUrl) && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => {
            setShowGifPreview(false)
            setExercicioPreview(null)
          }}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setShowGifPreview(false)
                setExercicioPreview(null)
              }}
              className="absolute top-4 right-4 btn-secondary p-2 z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={getGifUrl(exercicioPreview?.gifUrl || exercicioEdit?.gifUrl) || ''}
              alt={`Demonstração de execução de ${exercicioPreview?.nome || exercicioEdit?.nome || 'Exercício'}`}
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                console.error('Erro ao carregar demonstração no preview:', getGifUrl(exercicioPreview?.gifUrl || exercicioEdit?.gifUrl))
                const target = e.currentTarget
                target.style.display = 'none'
              }}
            />
            <p className="text-center text-light-muted mt-4">{exercicioPreview?.nome || exercicioEdit?.nome || 'Exercício'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
