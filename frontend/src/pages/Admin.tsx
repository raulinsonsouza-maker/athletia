import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import ExerciciosAdminList from '../components/ExerciciosAdminList'
import ExercicioFormModal from '../components/ExercicioFormModal'
import GruposMuscularesAdminList from '../components/GruposMuscularesAdminList'
import GrupoMuscularFormModal from '../components/GrupoMuscularFormModal'
import { grupoMuscularAdminService, GrupoMuscularVisual } from '../services/grupo-muscular-admin.service'
import TreinoImagensAdmin from '../components/TreinoImagensAdmin'
import AdminWhatsApp from './AdminWhatsApp'
import { testarEmailRemarketing, estenderTrial, converterManual, encerrarTrial } from '../services/admin.service'
import { BarChart } from '../components/ChartWrapper'


interface User {
  id: string
  email: string
  nome: string | null
  telefone?: string | null
  role: string
  plano?: string | null
  planoAtivo?: boolean
  dataPagamento?: string | null
  dataExpiracao?: string | null
  ativo?: boolean
  createdAt: string
  updatedAt?: string
  perfil?: {
    objetivo: string | null
    experiencia: string | null
    pesoAtual: number | null
  }
  estagioTrial?: 'D1' | 'D2' | 'D3' | 'EXPIrado' | 'PLANO_ATIVO' | 'SEM_ACESSO'
  vencimentoTexto?: string
  diasRestantes?: number
  perfilCompleto?: boolean
  ultimoAcesso?: string | null
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
    dataExpiracao: string | null
    senhaHash?: string | null
    ativo?: boolean
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
  cadastros?: {
    hoje: number
    estaSemana: number
    esteMes: number
    crescimentoPercentual: number
    porDia: Array<{ data: string, quantidade: number }>
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
  const [activeTab, setActiveTab] = useState<'usuarios' | 'exercicios' | 'estatisticas' | 'grupos' | 'imagens' | 'whatsapp'>('estatisticas')
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [resumoUsuarios, setResumoUsuarios] = useState<{
    total: number
    trialsAtivosHoje: number
    trialsD3: number
    trialsExpirados24h: number
    assinantesAtivos: number
  } | null>(null)
  const [, setLoadingResumo] = useState(false)
  const [search, setSearch] = useState('')
  const [filtros, setFiltros] = useState({
    tipoAcesso: [] as string[],
    estagioTrial: [] as string[],
    vencimento: '',
    perfil: '',
    ultimoAcesso: '',
    dataCadastroInicio: '',
    dataCadastroFim: ''
  })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [exercicios, setExercicios] = useState<any[]>([])
  const [gruposMusculares, setGruposMusculares] = useState<string[]>([])
  const [loadingExercicios, setLoadingExercicios] = useState(false)
  const [errorExercicios, setErrorExercicios] = useState<string | null>(null)
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
    telefone: '',
    dataNascimento: '',
    role: 'USER' as 'USER' | 'ADMIN',
    onboarding: {
      idade: '',
      sexo: '',
      tipoCorpo: '',
      altura: '',
      pesoAtual: '',
      percentualGordura: '',
      aguaDiaria: '',
      experiencia: '',
      objetivo: '',
      frequenciaSemanal: '',
      tempoDisponivel: '',
      localTreino: '',
      lesoes: [] as string[],
      preferencias: [] as string[],
      problemasAnteriores: [] as string[],
      objetivosAdicionais: [] as string[],
      rpePreferido: ''
    }
  })
  const [showOnboardingSection, setShowOnboardingSection] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [, setSelectedUserId] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [detailsTab, setDetailsTab] = useState<'basicas' | 'onboarding' | 'treinos' | 'historico'>('basicas')
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedExercicioId, setSelectedExercicioId] = useState<string | null>(null)
  const [exercicioEdit, setExercicioEdit] = useState<any>(null)
  const [loadingExercicioEdit, setLoadingExercicioEdit] = useState(false)
  const [isCreatingExercicio, setIsCreatingExercicio] = useState(false)

  // Estados para Grupos Musculares
  const [gruposList, setGruposList] = useState<GrupoMuscularVisual[]>([])
  const [loadingGrupos, setLoadingGrupos] = useState(false)
  const [showGrupoModal, setShowGrupoModal] = useState(false)
  const [selectedGrupoId, setSelectedGrupoId] = useState<string | null>(null)
  const [mostrarDesabilitados, setMostrarDesabilitados] = useState(false)
  const [showSimularPagamentoModal, setShowSimularPagamentoModal] = useState(false)
  const [planoSimulacao, setPlanoSimulacao] = useState<'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL'>('MENSAL')
  const [simulandoPagamento, setSimulandoPagamento] = useState(false)
  const [showRedefinirSenhaModal, setShowRedefinirSenhaModal] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [redefinindoSenha, setRedefinindoSenha] = useState(false)
  const [showTestarEmailModal, setShowTestarEmailModal] = useState(false)
  const [tipoEmailTeste, setTipoEmailTeste] = useState<'10min' | '24h' | '48h'>('10min')
  const [enviandoEmailTeste, setEnviandoEmailTeste] = useState(false)
  const [menuAcoesAberto, setMenuAcoesAberto] = useState<string | null>(null)
  const [processandoAcao, setProcessandoAcao] = useState<string | null>(null)

  useEffect(() => {
    verificarAdmin()
  }, [])

  // Fechar menu de ações ao clicar fora
  useEffect(() => {
    if (!menuAcoesAberto) return
    
    const handleClickOutside = () => {
      setMenuAcoesAberto(null)
    }
    
    // Pequeno delay para não fechar imediatamente ao abrir
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 100)
    
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [menuAcoesAberto])

  useEffect(() => {
    if (activeTab === 'usuarios') {
      carregarResumoUsuarios()
    }
    if (activeTab === 'usuarios') {
      carregarUsuarios()
    } else if (activeTab === 'estatisticas') {
      carregarEstatisticas()
    } else if (activeTab === 'exercicios') {
      carregarExercicios()
    } else if (activeTab === 'grupos') {
      carregarGruposMusculares()
    }
    // Imagens carrega seus próprios dados
  }, [activeTab, search, mostrarDesabilitados])

  const carregarGruposMusculares = async () => {
    setLoadingGrupos(true)
    try {
      const grupos = await grupoMuscularAdminService.listar()
      setGruposList(grupos)
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
      showToast('Erro ao carregar grupos musculares', 'error')
    } finally {
      setLoadingGrupos(false)
    }
  }

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
      if (import.meta.env.DEV) {
        console.error('Erro ao verificar admin:', error)
      }

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

  const carregarResumoUsuarios = async () => {
    setLoadingResumo(true)
    try {
      const response = await api.get('/admin/usuarios/resumo')
      setResumoUsuarios(response.data)
    } catch (error: any) {
      console.error('Erro ao carregar resumo de usuários:', error)
    } finally {
      setLoadingResumo(false)
    }
  }

  const carregarUsuarios = async () => {
    setLoadingUsuarios(true)
    setErrorUsuarios(null)

    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (mostrarDesabilitados) params.append('incluirDesabilitados', 'true')
      if (filtros.tipoAcesso.length > 0) {
        filtros.tipoAcesso.forEach(tipo => params.append('tipoAcesso', tipo))
      }
      if (filtros.estagioTrial.length > 0) {
        filtros.estagioTrial.forEach(estagio => params.append('estagioTrial', estagio))
      }
      if (filtros.vencimento) params.append('vencimento', filtros.vencimento)
      if (filtros.perfil) params.append('perfil', filtros.perfil)
      if (filtros.ultimoAcesso) params.append('ultimoAcesso', filtros.ultimoAcesso)
      if (filtros.dataCadastroInicio) params.append('dataCadastroInicio', filtros.dataCadastroInicio)
      if (filtros.dataCadastroFim) params.append('dataCadastroFim', filtros.dataCadastroFim)
      // Passar um limite alto para listar todos os usuários
      params.append('limit', '10000')
      const queryString = params.toString()
      const url = `/admin/usuarios${queryString ? `?${queryString}` : ''}`
      const response = await api.get(url)
      setUsuarios(response.data.usuarios || [])
      setTotalUsuarios(response.data.paginacao?.total || 0)

      if (response.data.usuarios && response.data.usuarios.length === 0 && search) {
        setErrorUsuarios(`Nenhum usuário encontrado para "${search}"`)
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Erro ao carregar usuários:', error)
      }

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

      // Validar e garantir que todos os exercícios tenham ID válido
      const exerciciosValidados = todosExercicios.map((ex: any) => {
        if (!ex.id || typeof ex.id !== 'string') {
          console.warn('[carregarExercicios] Exercício sem ID válido encontrado:', ex)
          return null
        }
        
        // Verificar se o ID parece ser um UUID válido
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ex.id)
        if (!isUuid) {
          console.warn(`[carregarExercicios] Exercício "${ex.nome}" tem ID que não é UUID: "${ex.id}". O backend tentará buscar por nome.`)
        }
        
        return ex
      }).filter((ex: any) => ex !== null)

      // Log para debug - mostrar alguns IDs para verificar
      if (import.meta.env.DEV && exerciciosValidados.length > 0) {
        console.log('[carregarExercicios] Exemplos de IDs recebidos:', exerciciosValidados.slice(0, 5).map((ex: any) => ({ nome: ex.nome, id: ex.id, isUuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ex.id) })))
      }

      setExercicios(exerciciosValidados)
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Erro ao carregar exercícios:', error)
      }

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
      if (import.meta.env.DEV) {
        console.error('Erro ao carregar estatísticas:', error)
      }

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
      if (import.meta.env.DEV) {
        console.error('Erro ao carregar detalhes do usuário:', error)
      }
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




  const handleCreateExercicio = () => {
    setIsCreatingExercicio(true)
    setSelectedExercicioId(null)
    setExercicioEdit(null)
    setShowEditModal(true)
  }

  const handleEditExercicio = async (exercicioId: string) => {
    // Validar se exercicioId é um UUID válido ou string válida
    if (!exercicioId || typeof exercicioId !== 'string' || exercicioId.trim() === '') {
      console.error('ID do exercício inválido:', exercicioId)
      showToast('ID do exercício inválido', 'error')
      return
    }

    setIsCreatingExercicio(false)
    setSelectedExercicioId(exercicioId)
    setShowEditModal(true)
    setLoadingExercicioEdit(true)
    setExercicioEdit(null)

    try {
      // Encoder o ID para evitar problemas com caracteres especiais
      const encodedId = encodeURIComponent(exercicioId.trim())
      
      // Log para debug (apenas em desenvolvimento)
      if (import.meta.env.DEV) {
        console.log('[handleEditExercicio] Buscando exercício com ID:', exercicioId, 'Encoded:', encodedId)
      }
      
      const response = await api.get(`/admin/exercicios/${encodedId}`)
      
      if (!response.data || !response.data.id) {
        console.error('[handleEditExercicio] Dados inválidos retornados:', response.data)
        throw new Error('Dados do exercício inválidos retornados do servidor')
      }
      
      setExercicioEdit(response.data)
    } catch (error: any) {
      console.error('[handleEditExercicio] Erro ao carregar exercício:', {
        exercicioId,
        status: error.response?.status,
        error: error.response?.data,
        message: error.message
      })
      
      let errorMessage = 'Erro ao carregar exercício'
      if (error.response?.status === 404) {
        errorMessage = `Exercício não encontrado (ID: ${exercicioId})`
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      showToast(errorMessage, 'error')
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



  const handleCriarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const payload: any = {
        email: formData.email,
        senha: formData.senha,
        nome: formData.nome,
        role: formData.role
      }
      
      if (formData.telefone) payload.telefone = formData.telefone
      if (formData.dataNascimento) payload.dataNascimento = formData.dataNascimento
      
      // Incluir onboarding apenas se a seção foi preenchida
      if (showOnboardingSection && Object.values(formData.onboarding).some(v => 
        (Array.isArray(v) ? v.length > 0 : v !== '' && v !== null)
      )) {
        payload.onboarding = formData.onboarding
      }
      
      await api.post('/admin/usuarios', payload)
      setShowCreateModal(false)
      setFormData({
        email: '',
        senha: '',
        nome: '',
        telefone: '',
        dataNascimento: '',
        role: 'USER',
        onboarding: {
          idade: '',
          sexo: '',
          tipoCorpo: '',
          altura: '',
          pesoAtual: '',
          percentualGordura: '',
          aguaDiaria: '',
          experiencia: '',
          objetivo: '',
          frequenciaSemanal: '',
          tempoDisponivel: '',
          localTreino: '',
          lesoes: [],
          preferencias: [],
          problemasAnteriores: [],
          objetivosAdicionais: [],
          rpePreferido: ''
        }
      })
      setShowOnboardingSection(false)
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
        {/* Tabs */}
        <div className="card mb-6">
          <div className="border-b border-grey/30">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('estatisticas')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'estatisticas'
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
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'usuarios'
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
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'exercicios'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-light-muted hover:text-light hover:border-grey/50'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Exercícios
              </button>
              <button
                onClick={() => setActiveTab('grupos')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'grupos'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-light-muted hover:text-light hover:border-grey/50'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Grupos Musculares
              </button>
              <button
                onClick={() => setActiveTab('imagens')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'imagens'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-light-muted hover:text-light hover:border-grey/50'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Imagens de Treino
              </button>
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'whatsapp'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-light-muted hover:text-light hover:border-grey/50'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                WhatsApp
              </button>
              <div className="relative group">
                <button
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    window.location.pathname.startsWith('/admin/blog')
                      ? 'border-primary text-primary'
                      : 'border-transparent text-light-muted hover:text-light hover:border-grey/50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Blog
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-dark-lighter border border-grey/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => navigate('/admin/blog')}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                        window.location.pathname === '/admin/blog'
                          ? 'bg-primary/20 text-primary'
                          : 'text-light-muted hover:bg-dark hover:text-light'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Posts
                    </button>
                    <button
                      onClick={() => navigate('/admin/blog/categorias')}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                        window.location.pathname === '/admin/blog/categorias'
                          ? 'bg-primary/20 text-primary'
                          : 'text-light-muted hover:bg-dark hover:text-light'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Categorias
                    </button>
                    <button
                      onClick={() => navigate('/admin/blog/autores')}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                        window.location.pathname === '/admin/blog/autores'
                          ? 'bg-primary/20 text-primary'
                          : 'text-light-muted hover:bg-dark hover:text-light'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Autores
                    </button>
                    <button
                      onClick={() => navigate('/admin/blog/ctas')}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                        window.location.pathname === '/admin/blog/ctas'
                          ? 'bg-primary/20 text-primary'
                          : 'text-light-muted hover:bg-dark hover:text-light'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      CTAs
                    </button>
                    <button
                      onClick={() => navigate('/admin/blog/configuracoes')}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                        window.location.pathname === '/admin/blog/configuracoes'
                          ? 'bg-primary/20 text-primary'
                          : 'text-light-muted hover:bg-dark hover:text-light'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configurações
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>

        {activeTab === 'imagens' && <TreinoImagensAdmin />}
        {activeTab === 'whatsapp' && <AdminWhatsApp />}

        {
          activeTab === 'usuarios' && (
            <div className="space-y-6">
              {/* Resumo Estratégico */}
              {resumoUsuarios && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div 
                    className="card-hover p-4 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 cursor-pointer"
                    onClick={() => {
                      setSearch('')
                      carregarUsuarios()
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-light-muted">Total de Usuários</p>
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-primary">{resumoUsuarios.total}</p>
                    <p className="text-xs text-light-muted mt-1">Todos os usuários</p>
                  </div>

                  <div 
                    className="card-hover p-4 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 cursor-pointer"
                    onClick={() => {
                      setFiltros({
                        ...filtros,
                        tipoAcesso: ['TRIAL_ATIVO'],
                        estagioTrial: [],
                        vencimento: ''
                      })
                      setMostrarFiltros(true)
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-light-muted">Trials Ativos Hoje</p>
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-primary">{resumoUsuarios.trialsAtivosHoje}</p>
                    <p className="text-xs text-light-muted mt-1">Em trial hoje</p>
                  </div>

                  <div 
                    className="card-hover p-4 bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30 cursor-pointer"
                    onClick={() => {
                      setFiltros({
                        ...filtros,
                        tipoAcesso: [],
                        estagioTrial: ['D3'],
                        vencimento: ''
                      })
                      setMostrarFiltros(true)
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-light-muted">Trials D3</p>
                      <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-warning">{resumoUsuarios.trialsD3}</p>
                    <p className="text-xs text-light-muted mt-1">Último dia - urgente</p>
                  </div>

                  <div 
                    className="card-hover p-4 bg-gradient-to-br from-error/20 to-error/5 border border-error/30 cursor-pointer"
                    onClick={() => {
                      setFiltros({
                        ...filtros,
                        tipoAcesso: ['TRIAL_EXPIRADO'],
                        estagioTrial: [],
                        vencimento: 'EXPIRADO'
                      })
                      setMostrarFiltros(true)
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-light-muted">Trials Expirados</p>
                      <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-error">{resumoUsuarios.trialsExpirados24h}</p>
                    <p className="text-xs text-light-muted mt-1">Últimas 24h</p>
                  </div>

                  <div 
                    className="card-hover p-4 bg-gradient-to-br from-success/20 to-success/5 border border-success/30 cursor-pointer"
                    onClick={() => {
                      setFiltros({
                        ...filtros,
                        tipoAcesso: ['PLANO_ATIVO'],
                        estagioTrial: [],
                        vencimento: ''
                      })
                      setMostrarFiltros(true)
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-light-muted">Assinantes Ativos</p>
                      <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-success">{resumoUsuarios.assinantesAtivos}</p>
                    <p className="text-xs text-light-muted mt-1">Com plano ativo</p>
                  </div>
                </div>
              )}

              {/* Filtros Inteligentes */}
              <div className="card mb-6">
                <button
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className="w-full flex items-center justify-between p-4 hover:bg-dark-lighter rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="font-semibold text-light">Filtros Inteligentes</span>
                    {(filtros.tipoAcesso.length > 0 || filtros.estagioTrial.length > 0 || filtros.vencimento || filtros.perfil || filtros.ultimoAcesso || filtros.dataCadastroInicio || filtros.dataCadastroFim) && (
                      <span className="badge-primary text-xs">{[
                        filtros.tipoAcesso.length,
                        filtros.estagioTrial.length,
                        filtros.vencimento ? 1 : 0,
                        filtros.perfil ? 1 : 0,
                        filtros.ultimoAcesso ? 1 : 0,
                        (filtros.dataCadastroInicio || filtros.dataCadastroFim) ? 1 : 0
                      ].reduce((a, b) => a + b, 0)} ativo(s)</span>
                    )}
                  </div>
                  <svg 
                    className={`w-5 h-5 text-light-muted transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mostrarFiltros && (
                  <div className="p-4 pt-0 space-y-4 border-t border-grey/30 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Tipo de Acesso */}
                      <div>
                        <label className="block text-sm font-medium text-light mb-2">Tipo de Acesso</label>
                        <div className="space-y-2">
                          {['TRIAL_ATIVO', 'TRIAL_EXPIRADO', 'PLANO_ATIVO', 'SEM_ACESSO'].map(tipo => (
                            <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filtros.tipoAcesso.includes(tipo)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFiltros({ ...filtros, tipoAcesso: [...filtros.tipoAcesso, tipo] })
                                  } else {
                                    setFiltros({ ...filtros, tipoAcesso: filtros.tipoAcesso.filter(t => t !== tipo) })
                                  }
                                }}
                                className="w-4 h-4 rounded border-grey/30 bg-dark-lighter text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-light-muted">
                                {tipo === 'TRIAL_ATIVO' ? 'Trial Ativo' : 
                                 tipo === 'TRIAL_EXPIRADO' ? 'Trial Expirado' :
                                 tipo === 'PLANO_ATIVO' ? 'Plano Ativo' : 'Sem Acesso'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Estágio do Trial */}
                      <div>
                        <label className="block text-sm font-medium text-light mb-2">Estágio do Trial</label>
                        <div className="space-y-2">
                          {['D1', 'D2', 'D3'].map(estagio => (
                            <label key={estagio} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filtros.estagioTrial.includes(estagio)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFiltros({ ...filtros, estagioTrial: [...filtros.estagioTrial, estagio] })
                                  } else {
                                    setFiltros({ ...filtros, estagioTrial: filtros.estagioTrial.filter(e => e !== estagio) })
                                  }
                                }}
                                className="w-4 h-4 rounded border-grey/30 bg-dark-lighter text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-light-muted">Trial {estagio}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Vencimento */}
                      <div>
                        <label className="block text-sm font-medium text-light mb-2">Vencimento</label>
                        <div className="space-y-2">
                          {[
                            { value: '', label: 'Todos' },
                            { value: 'HOJE', label: 'Vence hoje' },
                            { value: 'AMANHA', label: 'Vence amanhã' },
                            { value: 'EXPIRADO', label: 'Já expirado' }
                          ].map(opcao => (
                            <label key={opcao.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="vencimento"
                                value={opcao.value}
                                checked={filtros.vencimento === opcao.value}
                                onChange={(e) => setFiltros({ ...filtros, vencimento: e.target.value })}
                                className="w-4 h-4 border-grey/30 bg-dark-lighter text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-light-muted">{opcao.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Perfil */}
                      <div>
                        <label className="block text-sm font-medium text-light mb-2">Perfil</label>
                        <div className="space-y-2">
                          {[
                            { value: '', label: 'Todos' },
                            { value: 'COMPLETO', label: 'Completo' },
                            { value: 'INCOMPLETO', label: 'Incompleto' }
                          ].map(opcao => (
                            <label key={opcao.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="perfil"
                                value={opcao.value}
                                checked={filtros.perfil === opcao.value}
                                onChange={(e) => setFiltros({ ...filtros, perfil: e.target.value })}
                                className="w-4 h-4 border-grey/30 bg-dark-lighter text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-light-muted">{opcao.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Último Acesso */}
                      <div>
                        <label className="block text-sm font-medium text-light mb-2">Último Acesso</label>
                        <select
                          value={filtros.ultimoAcesso}
                          onChange={(e) => setFiltros({ ...filtros, ultimoAcesso: e.target.value })}
                          className="input-field w-full"
                        >
                          <option value="">Todos</option>
                          <option value="NUNCA">Nunca acessou</option>
                          <option value="MAIS_3_DIAS">Mais de 3 dias</option>
                          <option value="MAIS_7_DIAS">Mais de 7 dias</option>
                        </select>
                      </div>

                      {/* Data de Cadastro */}
                      <div>
                        <label className="block text-sm font-medium text-light mb-2">Data de Cadastro</label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={filtros.dataCadastroInicio}
                              onChange={(e) => setFiltros({ ...filtros, dataCadastroInicio: e.target.value })}
                              className="input-field flex-1"
                              placeholder="De"
                            />
                            <input
                              type="date"
                              value={filtros.dataCadastroFim}
                              onChange={(e) => setFiltros({ ...filtros, dataCadastroFim: e.target.value })}
                              className="input-field flex-1"
                              placeholder="Até"
                            />
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => {
                                const hoje = new Date().toISOString().split('T')[0]
                                setFiltros({ ...filtros, dataCadastroInicio: hoje, dataCadastroFim: hoje })
                              }}
                              className="btn-secondary text-xs px-2 py-1"
                            >
                              Hoje
                            </button>
                            <button
                              onClick={() => {
                                const hoje = new Date()
                                const seteDias = new Date(hoje)
                                seteDias.setDate(hoje.getDate() - 7)
                                setFiltros({ 
                                  ...filtros, 
                                  dataCadastroInicio: seteDias.toISOString().split('T')[0],
                                  dataCadastroFim: hoje.toISOString().split('T')[0]
                                })
                              }}
                              className="btn-secondary text-xs px-2 py-1"
                            >
                              7 dias
                            </button>
                            <button
                              onClick={() => {
                                const hoje = new Date()
                                const trintaDias = new Date(hoje)
                                trintaDias.setDate(hoje.getDate() - 30)
                                setFiltros({ 
                                  ...filtros, 
                                  dataCadastroInicio: trintaDias.toISOString().split('T')[0],
                                  dataCadastroFim: hoje.toISOString().split('T')[0]
                                })
                              }}
                              className="btn-secondary text-xs px-2 py-1"
                            >
                              30 dias
                            </button>
                            <button
                              onClick={() => setFiltros({ ...filtros, dataCadastroInicio: '', dataCadastroFim: '' })}
                              className="btn-secondary text-xs px-2 py-1"
                            >
                              Limpar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-grey/30">
                      <button
                        onClick={() => {
                          setFiltros({
                            tipoAcesso: [],
                            estagioTrial: [],
                            vencimento: '',
                            perfil: '',
                            ultimoAcesso: '',
                            dataCadastroInicio: '',
                            dataCadastroFim: ''
                          })
                        }}
                        className="btn-secondary text-sm"
                      >
                        Limpar Filtros
                      </button>
                      <button
                        onClick={() => {
                          carregarUsuarios()
                        }}
                        className="btn-primary text-sm"
                      >
                        Aplicar Filtros
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Busca */}
              {/* Header com Busca, Filtros e Ações */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div className="flex-1 w-full md:max-w-md">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field w-full"
                    placeholder="Buscar por email ou nome..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mostrarDesabilitados}
                      onChange={(e) => setMostrarDesabilitados(e.target.checked)}
                      className="w-4 h-4 rounded border-grey/30 bg-dark-lighter text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-light-muted">Mostrar desabilitados</span>
                  </label>
                  
                  <div className="flex items-center gap-2 bg-dark-lighter p-1 rounded-lg border border-grey/30">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-2 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-primary text-dark' : 'text-light-muted hover:text-light'}`}
                      title="Cards"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-dark' : 'text-light-muted hover:text-light'}`}
                      title="Lista"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-primary text-dark' : 'text-light-muted hover:text-light'}`}
                      title="Tabela"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7-4h14M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Novo Usuário
                  </button>
                </div>
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
                  {totalUsuarios > 0 && (
                    <div className="mb-4 text-sm text-light-muted">
                      {totalUsuarios} {totalUsuarios === 1 ? 'usuário encontrado' : 'usuários encontrados'}
                    </div>
                  )}

                  {/* Visualização em Cards - Atualizada */}
                  {viewMode === 'cards' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {usuarios.map((user: any) => {
                        const estagio = user.estagioTrial || (user.planoAtivo ? 'PLANO_ATIVO' : 'SEM_ACESSO')
                        const vencimentoTexto = user.vencimentoTexto || '-'
                        const perfilCompleto = user.perfilCompleto !== undefined ? user.perfilCompleto : !!user.perfil
                        const ultimoAcesso = user.ultimoAcesso ? new Date(user.ultimoAcesso) : null
                        
                        let engajamentoTexto = 'Nunca acessou'
                        if (ultimoAcesso) {
                          const agora = new Date()
                          const diffMs = agora.getTime() - ultimoAcesso.getTime()
                          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                          if (diffDays === 0) engajamentoTexto = 'Hoje'
                          else if (diffDays === 1) engajamentoTexto = 'Ontem'
                          else if (diffDays < 7) engajamentoTexto = `Há ${diffDays} dias`
                          else engajamentoTexto = ultimoAcesso.toLocaleDateString('pt-BR')
                        }

                        const getBadgeColor = (estagio: string) => {
                          if (estagio === 'D3') return 'badge-warning'
                          if (estagio === 'D1' || estagio === 'D2') return 'badge-secondary'
                          if (estagio === 'EXPIrado') return 'badge-error'
                          if (estagio === 'PLANO_ATIVO') return 'badge-success'
                          return 'badge-secondary'
                        }

                        const getEstagioLabel = (estagio: string) => {
                          if (estagio === 'D1') return 'Trial D1'
                          if (estagio === 'D2') return 'Trial D2'
                          if (estagio === 'D3') return 'Trial D3'
                          if (estagio === 'EXPIrado') return 'Trial Expirado'
                          if (estagio === 'PLANO_ATIVO') return 'Plano Ativo'
                          return 'Sem Acesso'
                        }

                        return (
                          <div
                            key={user.id}
                            onClick={() => handleShowDetails(user.id)}
                            className={`card-hover cursor-pointer transition-all ${estagio === 'D3' ? 'border-l-4 border-warning bg-warning/5' : ''}`}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-light mb-1">
                                    {user.nome || 'Sem nome'}
                                  </h3>
                                  <p className="text-light-muted text-sm truncate">{user.email}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className={`${getBadgeColor(estagio)} text-xs`}>
                                  {getEstagioLabel(estagio)}
                                </span>
                                {perfilCompleto ? (
                                  <span className="badge-success text-xs">Perfil Completo</span>
                                ) : (
                                  <span className="badge-warning text-xs">Perfil Incompleto</span>
                                )}
                                {user.ativo === false && (
                                  <span className="badge-error text-xs">Desabilitado</span>
                                )}
                              </div>

                              <div className="space-y-1 mb-3 text-xs">
                                <p className="text-light-muted">
                                  <span className="font-medium">Vencimento:</span> {vencimentoTexto}
                                </p>
                                <p className={ultimoAcesso ? 'text-light-muted' : 'text-error font-medium'}>
                                  <span className="font-medium">Último acesso:</span> {engajamentoTexto}
                                </p>
                              </div>

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
                        )
                      })}
                    </div>
                  )}

                  {/* Visualização em Lista Compacta - Atualizada */}
                  {viewMode === 'list' && (
                    <div className="space-y-2">
                      {usuarios.map((user: any) => {
                        const estagio = user.estagioTrial || (user.planoAtivo ? 'PLANO_ATIVO' : 'SEM_ACESSO')
                        const vencimentoTexto = user.vencimentoTexto || '-'
                        const perfilCompleto = user.perfilCompleto !== undefined ? user.perfilCompleto : !!user.perfil
                        const ultimoAcesso = user.ultimoAcesso ? new Date(user.ultimoAcesso) : null
                        
                        let engajamentoTexto = 'Nunca acessou'
                        if (ultimoAcesso) {
                          const agora = new Date()
                          const diffMs = agora.getTime() - ultimoAcesso.getTime()
                          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                          if (diffDays === 0) engajamentoTexto = 'Hoje'
                          else if (diffDays === 1) engajamentoTexto = 'Ontem'
                          else if (diffDays < 7) engajamentoTexto = `Há ${diffDays} dias`
                          else engajamentoTexto = ultimoAcesso.toLocaleDateString('pt-BR')
                        }

                        const getBadgeColor = (estagio: string) => {
                          if (estagio === 'D3') return 'badge-warning'
                          if (estagio === 'D1' || estagio === 'D2') return 'badge-secondary'
                          if (estagio === 'EXPIrado') return 'badge-error'
                          if (estagio === 'PLANO_ATIVO') return 'badge-success'
                          return 'badge-secondary'
                        }

                        const getEstagioLabel = (estagio: string) => {
                          if (estagio === 'D1') return 'Trial D1'
                          if (estagio === 'D2') return 'Trial D2'
                          if (estagio === 'D3') return 'Trial D3'
                          if (estagio === 'EXPIrado') return 'Trial Expirado'
                          if (estagio === 'PLANO_ATIVO') return 'Plano Ativo'
                          return 'Sem Acesso'
                        }

                        return (
                          <div
                            key={user.id}
                            className={`card-hover cursor-pointer p-4 flex items-center justify-between hover:bg-dark-lighter transition-colors ${estagio === 'D3' ? 'bg-warning/5 border-l-4 border-warning' : ''}`}
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-light truncate">
                                  {user.nome || 'Sem nome'}
                                </h3>
                                <p className="text-light-muted text-sm truncate">{user.email}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <p className="text-light-muted text-xs">
                                    Cadastrado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                  </p>
                                  <span className="text-light-muted">•</span>
                                  <p className={`text-xs ${ultimoAcesso ? 'text-light-muted' : 'text-error font-medium'}`}>
                                    {engajamentoTexto}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 items-center">
                                <span className={`${getBadgeColor(estagio)} text-xs`}>
                                  {getEstagioLabel(estagio)}
                                </span>
                                <span className="text-xs text-light-muted">{vencimentoTexto}</span>
                                {perfilCompleto ? (
                                  <span className="badge-success text-xs">Perfil Completo</span>
                                ) : (
                                  <span className="badge-warning text-xs">Perfil Incompleto</span>
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
                        )
                      })}
                    </div>
                  )}

                  {/* Visualização em Tabela - Reestruturada */}
                  {viewMode === 'table' && (
                    <div className="overflow-x-auto -mx-4 px-4">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-grey/30">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Usuário</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Acesso</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Vencimento</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Engajamento</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Perfil</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Cadastro</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-light-muted">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usuarios.map((user: any) => {
                            const estagio = user.estagioTrial || (user.planoAtivo ? 'PLANO_ATIVO' : 'SEM_ACESSO')
                            const vencimentoTexto = user.vencimentoTexto || '-'
                            const perfilCompleto = user.perfilCompleto !== undefined ? user.perfilCompleto : !!user.perfil
                            const ultimoAcesso = user.ultimoAcesso ? new Date(user.ultimoAcesso) : null
                            
                            // Calcular dias desde último acesso
                            let engajamentoTexto = 'Nunca acessou'
                            if (ultimoAcesso) {
                              const agora = new Date()
                              const diffMs = agora.getTime() - ultimoAcesso.getTime()
                              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                              if (diffDays === 0) {
                                engajamentoTexto = 'Hoje'
                              } else if (diffDays === 1) {
                                engajamentoTexto = 'Ontem'
                              } else if (diffDays < 7) {
                                engajamentoTexto = `Há ${diffDays} dias`
                              } else {
                                engajamentoTexto = ultimoAcesso.toLocaleDateString('pt-BR')
                              }
                            }

                            // Cores do badge de acesso
                            const getBadgeColor = (estagio: string) => {
                              if (estagio === 'D3') return 'badge-warning'
                              if (estagio === 'D1' || estagio === 'D2') return 'badge-secondary'
                              if (estagio === 'EXPIrado') return 'badge-error'
                              if (estagio === 'PLANO_ATIVO') return 'badge-success'
                              return 'badge-secondary'
                            }

                            const getEstagioLabel = (estagio: string) => {
                              if (estagio === 'D1') return 'Trial D1'
                              if (estagio === 'D2') return 'Trial D2'
                              if (estagio === 'D3') return 'Trial D3'
                              if (estagio === 'EXPIrado') return 'Trial Expirado'
                              if (estagio === 'PLANO_ATIVO') return 'Plano Ativo'
                              return 'Sem Acesso'
                            }

                            return (
                              <tr
                                key={user.id}
                                className={`border-b border-grey/10 hover:bg-dark-lighter transition-colors ${estagio === 'D3' ? 'bg-warning/5' : ''}`}
                              >
                                <td className="py-3 px-4">
                                  <div>
                                    <p className="text-sm font-medium text-light">{user.nome || 'Sem nome'}</p>
                                    <p className="text-xs text-light-muted truncate max-w-xs">{user.email}</p>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`${getBadgeColor(estagio)} text-xs`}>
                                    {getEstagioLabel(estagio)}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <p className="text-sm text-light">{vencimentoTexto}</p>
                                </td>
                                <td className="py-3 px-4">
                                  {ultimoAcesso ? (
                                    <p className="text-sm text-light-muted">{engajamentoTexto}</p>
                                  ) : (
                                    <p className="text-sm text-error font-medium">{engajamentoTexto}</p>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {perfilCompleto ? (
                                    <span className="badge-success text-xs">Completo</span>
                                  ) : (
                                    <span className="badge-warning text-xs">Incompleto</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <p className="text-sm text-light-muted">
                                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                  </p>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setMenuAcoesAberto(menuAcoesAberto === user.id ? null : user.id)
                                      }}
                                      className="btn-secondary text-xs flex items-center gap-1"
                                      disabled={processandoAcao === user.id}
                                    >
                                      {processandoAcao === user.id ? (
                                        <>
                                          <div className="spinner h-3 w-3"></div>
                                          Processando...
                                        </>
                                      ) : (
                                        <>
                                          Ações
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </>
                                      )}
                                    </button>
                                    
                                    {menuAcoesAberto === user.id && (
                                      <div className="absolute right-0 mt-1 w-48 bg-dark-lighter border border-grey/30 rounded-lg shadow-lg z-10">
                                        <div className="py-1">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setMenuAcoesAberto(null)
                                              handleShowDetails(user.id)
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-light hover:bg-dark transition-colors flex items-center gap-2"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Ver Detalhes
                                          </button>
                                          
                                          {estagio !== 'PLANO_ATIVO' && estagio !== 'EXPIrado' && estagio !== 'SEM_ACESSO' && (
                                            <>
                                              <button
                                                onClick={async (e) => {
                                                  e.stopPropagation()
                                                  if (confirm('Deseja estender o trial por mais 1 dia?')) {
                                                    setProcessandoAcao(user.id)
                                                    try {
                                                      await estenderTrial(user.id)
                                                      showToast('Trial estendido com sucesso', 'success')
                                                      await carregarUsuarios()
                                                      await carregarResumoUsuarios()
                                                    } catch (error: any) {
                                                      showToast(error.response?.data?.error || 'Erro ao estender trial', 'error')
                                                    } finally {
                                                      setProcessandoAcao(null)
                                                      setMenuAcoesAberto(null)
                                                    }
                                                  }
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-light hover:bg-dark transition-colors flex items-center gap-2"
                                              >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Estender Trial (1 dia)
                                              </button>
                                              
                                              <button
                                                onClick={async (e) => {
                                                  e.stopPropagation()
                                                  const plano = prompt('Digite o plano (MENSAL, TRIMESTRAL ou SEMESTRAL):', 'MENSAL')
                                                  if (plano && ['MENSAL', 'TRIMESTRAL', 'SEMESTRAL'].includes(plano.toUpperCase())) {
                                                    setProcessandoAcao(user.id)
                                                    try {
                                                      await converterManual(user.id, plano.toUpperCase() as 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL')
                                                      showToast('Usuário convertido para plano ativo', 'success')
                                                      await carregarUsuarios()
                                                      await carregarResumoUsuarios()
                                                    } catch (error: any) {
                                                      showToast(error.response?.data?.error || 'Erro ao converter', 'error')
                                                    } finally {
                                                      setProcessandoAcao(null)
                                                      setMenuAcoesAberto(null)
                                                    }
                                                  }
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-light hover:bg-dark transition-colors flex items-center gap-2"
                                              >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Converter Manualmente
                                              </button>
                                              
                                              <button
                                                onClick={async (e) => {
                                                  e.stopPropagation()
                                                  if (confirm('Deseja encerrar o trial antecipadamente?')) {
                                                    setProcessandoAcao(user.id)
                                                    try {
                                                      await encerrarTrial(user.id)
                                                      showToast('Trial encerrado com sucesso', 'success')
                                                      await carregarUsuarios()
                                                      await carregarResumoUsuarios()
                                                    } catch (error: any) {
                                                      showToast(error.response?.data?.error || 'Erro ao encerrar trial', 'error')
                                                    } finally {
                                                      setProcessandoAcao(null)
                                                      setMenuAcoesAberto(null)
                                                    }
                                                  }
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-dark transition-colors flex items-center gap-2"
                                              >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Encerrar Trial
                                              </button>
                                            </>
                                          )}
                                          
                                          <div className="border-t border-grey/30 my-1"></div>
                                          
                                          <button
                                            onClick={async (e) => {
                                              e.stopPropagation()
                                              if (confirm('Deseja desativar este usuário?')) {
                                                setProcessandoAcao(user.id)
                                                try {
                                                  await api.delete(`/admin/usuarios/${user.id}`)
                                                  showToast('Usuário desativado com sucesso', 'success')
                                                  await carregarUsuarios()
                                                  await carregarResumoUsuarios()
                                                } catch (error: any) {
                                                  showToast(error.response?.data?.error || 'Erro ao desativar usuário', 'error')
                                                } finally {
                                                  setProcessandoAcao(null)
                                                  setMenuAcoesAberto(null)
                                                }
                                              }
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-error hover:bg-dark transition-colors flex items-center gap-2"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                            Desativar Usuário
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
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
          )
        }

        {
          activeTab === 'exercicios' && (
            <div className="card">
              <ExerciciosAdminList
                exercicios={exercicios}
                loading={loadingExercicios}
                error={errorExercicios}
                gruposMusculares={gruposMusculares}
                onEdit={handleEditExercicio}
                onCreate={handleCreateExercicio}
                onRetry={carregarExercicios}
              />
            </div>
          )
        }

        {
          activeTab === 'grupos' && (
            <div className="card">
              <GruposMuscularesAdminList
                grupos={gruposList}
                loading={loadingGrupos}
                onEdit={(grupo) => {
                  setSelectedGrupoId(grupo.id)
                  setShowGrupoModal(true)
                }}
                onCreate={() => {
                  setSelectedGrupoId(null)
                  setShowGrupoModal(true)
                }}
                onDelete={async (id) => {
                  if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
                    try {
                      await grupoMuscularAdminService.remover(id)
                      showToast('Grupo removido com sucesso', 'success')
                      carregarGruposMusculares()
                    } catch (error) {
                      showToast('Erro ao remover grupo', 'error')
                    }
                  }
                }}
              />
            </div>
          )
        }

        {
          activeTab === 'estatisticas' && (
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

                  {/* Cadastros de Usuários */}
                  {(() => {
                    const cadastros = estatisticas.cadastros || {
                      hoje: 0,
                      estaSemana: 0,
                      esteMes: 0,
                      crescimentoPercentual: 0,
                      porDia: [] as Array<{ data: string, quantidade: number }>
                    };

                    return (
                      <div className="card">
                        <h2 className="text-2xl font-display font-bold text-light mb-6 flex items-center gap-2">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Cadastros de Usuários
                        </h2>
                        
                        {/* Cards de Métricas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="card-hover p-4 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-light-muted">Cadastros Hoje</p>
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-3xl font-bold text-primary">{cadastros.hoje}</p>
                            <p className="text-xs text-light-muted mt-1">Novos usuários hoje</p>
                          </div>
                          
                          <div className="card-hover p-4 bg-gradient-to-br from-success/20 to-success/5 border border-success/30">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-light-muted">Esta Semana</p>
                              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <p className="text-3xl font-bold text-success">{cadastros.estaSemana}</p>
                            <p className="text-xs text-light-muted mt-1">Desde segunda-feira</p>
                          </div>
                          
                          <div className="card-hover p-4 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-light-muted">Este Mês</p>
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-3xl font-bold text-primary">{cadastros.esteMes}</p>
                            <p className="text-xs text-light-muted mt-1">Mês atual</p>
                          </div>
                          
                          <div className={`card-hover p-4 bg-gradient-to-br ${
                            cadastros.crescimentoPercentual >= 0 
                              ? 'from-success/20 to-success/5 border border-success/30' 
                              : 'from-error/20 to-error/5 border border-error/30'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-light-muted">Crescimento</p>
                              <svg className={`w-5 h-5 ${cadastros.crescimentoPercentual >= 0 ? 'text-success' : 'text-error'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {cadastros.crescimentoPercentual >= 0 ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                )}
                              </svg>
                            </div>
                            <p className={`text-3xl font-bold ${cadastros.crescimentoPercentual >= 0 ? 'text-success' : 'text-error'}`}>
                              {cadastros.crescimentoPercentual >= 0 ? '+' : ''}{cadastros.crescimentoPercentual.toFixed(1)}%
                            </p>
                            <p className="text-xs text-light-muted mt-1">vs. mês anterior</p>
                          </div>
                        </div>

                        {/* Gráfico de Cadastros Diários */}
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold text-light mb-4">Cadastros por Dia (Últimos 30 dias)</h3>
                          <div className="bg-dark-lighter rounded-lg p-6 border border-grey/30 shadow-lg" style={{ height: '400px' }}>
                            {cadastros.porDia && cadastros.porDia.length > 0 ? (
                              <BarChart
                                data={{
                                  labels: cadastros.porDia.map(item => {
                                    const dataObj = new Date(item.data + 'T00:00:00')
                                    return dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                                  }),
                                  datasets: [
                                    {
                                      label: 'Cadastros',
                                      data: cadastros.porDia.map(item => item.quantidade),
                                      backgroundColor: cadastros.porDia.map(item => {
                                        // Gradiente baseado no valor (mais alto = mais vibrante)
                                        const max = Math.max(...cadastros.porDia.map(d => d.quantidade), 1)
                                        const intensity = max > 0 ? item.quantidade / max : 0
                                        // Gradiente de laranja (primary) com intensidade variável
                                        return `rgba(255, 152, 0, ${0.4 + intensity * 0.6})`
                                      }),
                                      borderColor: 'rgb(255, 152, 0)',
                                      borderWidth: 2,
                                    }
                                  ]
                                }}
                                title="Evolução de Cadastros Diários"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-light-muted">
                                <p>Nenhum dado disponível</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

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
                          <p className="text-xs text-light-muted mt-1">Onboarding / Pagamento</p>
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
          )
        }
      </main>

      {/* Modal de Detalhes do Usuário */}
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
                  <div className="flex items-center gap-2">
                    {userDetails.usuario.ativo === false && (
                      <button
                        onClick={async () => {
                          try {
                            await api.post(`/admin/usuarios/${userDetails.usuario.id}/reativar`)
                            showToast('Usuário reativado com sucesso!', 'success')
                            await carregarUsuarios()
                            await carregarDetalhesUsuario(userDetails.usuario.id)
                          } catch (error: any) {
                            showToast(error.response?.data?.error || 'Erro ao reativar usuário', 'error')
                          }
                        }}
                        className="btn-success text-sm"
                      >
                        Reativar Usuário
                      </button>
                    )}
                    {userDetails.usuario.ativo !== false && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Tem certeza que deseja desabilitar este usuário? Ele não aparecerá mais na listagem padrão.')) {
                            try {
                              await api.delete(`/admin/usuarios/${userDetails.usuario.id}`)
                              showToast('Usuário desabilitado com sucesso!', 'success')
                              await carregarUsuarios()
                              handleCloseDetails()
                            } catch (error: any) {
                              showToast(error.response?.data?.error || 'Erro ao desabilitar usuário', 'error')
                            }
                          }
                        }}
                        className="btn-error text-sm"
                      >
                        Desabilitar Usuário
                      </button>
                    )}
                    <button
                      onClick={handleCloseDetails}
                      className="btn-secondary p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
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
                          className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${detailsTab === tab
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
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Senha (Hash)</label>
                            <div className="flex items-center gap-3">
                              <p className="text-base text-light font-mono text-sm">
                                {userDetails.usuario.senhaHash || 'Não disponível'}
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setShowRedefinirSenhaModal(true)}
                                  className="btn-primary text-xs px-3 py-1.5"
                                >
                                  Redefinir Senha
                                </button>
                                <button
                                  onClick={() => setShowTestarEmailModal(true)}
                                  className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  Testar E-mail
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-light-muted mt-1">
                              A senha está armazenada como hash (criptografada) por segurança. Use o botão acima para redefinir.
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
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-light-muted uppercase tracking-wide">Data de Expiração do Plano</label>
                            <div className="mt-1">
                              {userDetails.usuario.dataExpiracao ? (
                                (() => {
                                  const dataExpiracao = new Date(userDetails.usuario.dataExpiracao)
                                  const agora = new Date()
                                  const diferencaDias = Math.ceil((dataExpiracao.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
                                  const expirado = diferencaDias < 0
                                  const proximoExpirar = diferencaDias >= 0 && diferencaDias <= 3
                                  
                                  return (
                                    <div className="flex items-center gap-2">
                                      <p className={`text-base font-medium ${expirado ? 'text-error' : proximoExpirar ? 'text-warning' : 'text-light'}`}>
                                        {dataExpiracao.toLocaleDateString('pt-BR')}
                                      </p>
                                      {expirado && <span className="badge-error text-xs">Expirado</span>}
                                      {proximoExpirar && !expirado && <span className="badge-warning text-xs">Expira em {diferencaDias} {diferencaDias === 1 ? 'dia' : 'dias'}</span>}
                                    </div>
                                  )
                                })()
                              ) : (
                                <p className="text-base text-light-muted">N/A</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Botão para Simular Pagamento */}
                        <div className="mt-6 pt-6 border-t border-grey/30">
                          <button
                            onClick={() => setShowSimularPagamentoModal(true)}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Simular Pagamento (Teste)
                          </button>
                          <p className="text-xs text-light-muted mt-2 text-center">
                            Use para testar envio de e-mail de boas-vindas sem transação real
                          </p>
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
                            <p className={`text-2xl font-bold ${userDetails.estatisticas.variacaoPeso !== null
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
                                      <span className={`badge ${variacao > 0 ? 'badge-success' : variacao < 0 ? 'badge-error' : 'badge-secondary'
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

      {/* Modal de Criação de Usuário */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-primary/30">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-grey/30">
              <h3 className="text-xl font-display font-bold text-light">Novo Usuário</h3>
              <button onClick={() => {
                setShowCreateModal(false)
                setFormData({
                  email: '',
                  senha: '',
                  nome: '',
                  telefone: '',
                  dataNascimento: '',
                  role: 'USER',
                  onboarding: {
                    idade: '',
                    sexo: '',
                    tipoCorpo: '',
                    altura: '',
                    pesoAtual: '',
                    percentualGordura: '',
                    aguaDiaria: '',
                    experiencia: '',
                    objetivo: '',
                    frequenciaSemanal: '',
                    tempoDisponivel: '',
                    localTreino: '',
                    lesoes: [],
                    preferencias: [],
                    problemasAnteriores: [],
                    objetivosAdicionais: [],
                    rpePreferido: ''
                  }
                })
                setShowOnboardingSection(false)
              }} className="btn-secondary p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCriarUsuario} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-light border-b border-grey/30 pb-2">Informações Básicas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">Nome *</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="input-field w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="input-field w-full"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">Data de Nascimento</label>
                    <input
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">Senha *</label>
                    <input
                      type="password"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      className="input-field w-full"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">Tipo de Acesso</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
                      className="input-field w-full"
                    >
                      <option value="USER">Usuário</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dados do Onboarding */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-grey/30 pb-2">
                  <h4 className="text-lg font-semibold text-light">Dados do Onboarding</h4>
                  <button
                    type="button"
                    onClick={() => setShowOnboardingSection(!showOnboardingSection)}
                    className="btn-secondary text-sm"
                  >
                    {showOnboardingSection ? 'Ocultar' : 'Mostrar'} Dados do Onboarding
                  </button>
                </div>
                
                {showOnboardingSection && (
                  <div className="space-y-4 pt-4">
                    {/* Dados Físicos */}
                    <div className="space-y-4 p-4 bg-dark-lighter rounded-lg">
                      <h5 className="text-md font-semibold text-light mb-3">Dados Físicos</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-light mb-2">Idade</label>
                          <input
                            type="number"
                            value={formData.onboarding.idade}
                            onChange={(e) => setFormData({
                              ...formData,
                              onboarding: { ...formData.onboarding, idade: e.target.value }
                            })}
                            className="input-field w-full"
                            min="1"
                            max="120"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-light mb-2">Sexo</label>
                          <select
                            value={formData.onboarding.sexo}
                            onChange={(e) => setFormData({
                              ...formData,
                              onboarding: { ...formData.onboarding, sexo: e.target.value }
                            })}
                            className="input-field w-full"
                          >
                            <option value="">Selecione</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-light mb-2">Altura (cm)</label>
                          <input
                            type="number"
                            value={formData.onboarding.altura}
                            onChange={(e) => setFormData({
                              ...formData,
                              onboarding: { ...formData.onboarding, altura: e.target.value }
                            })}
                            className="input-field w-full"
                            min="50"
                            max="250"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-light mb-2">Peso Atual (kg)</label>
                          <input
                            type="number"
                            value={formData.onboarding.pesoAtual}
                            onChange={(e) => setFormData({
                              ...formData,
                              onboarding: { ...formData.onboarding, pesoAtual: e.target.value }
                            })}
                            className="input-field w-full"
                            min="1"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-light mb-2">% Gordura Corporal</label>
                          <input
                            type="number"
                            value={formData.onboarding.percentualGordura}
                            onChange={(e) => setFormData({
                              ...formData,
                              onboarding: { ...formData.onboarding, percentualGordura: e.target.value }
                            })}
                            className="input-field w-full"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-light mb-2">Água Diária (L)</label>
                          <input
                            type="text"
                            value={formData.onboarding.aguaDiaria}
                            onChange={(e) => setFormData({
                              ...formData,
                              onboarding: { ...formData.onboarding, aguaDiaria: e.target.value }
                            })}
                            className="input-field w-full"
                            placeholder="Ex: 2.5L"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dados de Treino */}
                    <div className="space-y-4 p-4 bg-dark-lighter rounded-lg">
                      <h5 className="text-md font-semibold text-light mb-3">Dados de Treino</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-light mb-2">Experiência</label>
                          <select
                            value={formData.onboarding.experiencia}
                            onChange={(e) => setFormData({
                              ...formData,
                              onboarding: { ...formData.onboarding, experiencia: e.target.value }
                            })}
                            className="input-field w-full"
                          >
                            <option value="">Selecione</option>
                            <option value="Iniciante">Iniciante</option>
                            <option value="Intermediário">Intermediário</option>
                            <option value="Avançado">Avançado</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-light mb-2">Objetivo</label>
                          <select
                            value={formData.onboarding.objetivo}
                            onChange={(e) => setFormData({
                              ...formData,
                              onboarding: { ...formData.onboarding, objetivo: e.target.value }
                            })}
                            className="input-field w-full"
                          >
                            <option value="">Selecione</option>
                            <option value="Emagrecimento">Emagrecimento</option>
                            <option value="Hipertrofia">Hipertrofia</option>
                            <option value="Força">Força</option>
                            <option value="Condicionamento">Condicionamento</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-light mb-2">Frequência Semanal</label>
                          <input
                            type="number"
                            value={formData.onboarding.frequenciaSemanal}
                            onChange={(e) => setFormData({
                              ...formData,
                              onboarding: { ...formData.onboarding, frequenciaSemanal: e.target.value }
                            })}
                            className="input-field w-full"
                            min="1"
                            max="7"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-light mb-2">Tempo Disponível (min)</label>
                          <input
                            type="number"
                            value={formData.onboarding.tempoDisponivel}
                            onChange={(e) => setFormData({
                              ...formData,
                              onboarding: { ...formData.onboarding, tempoDisponivel: e.target.value }
                            })}
                            className="input-field w-full"
                            min="15"
                            step="15"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-light mb-2">Local de Treino</label>
                          <select
                            value={formData.onboarding.localTreino}
                            onChange={(e) => setFormData({
                              ...formData,
                              onboarding: { ...formData.onboarding, localTreino: e.target.value }
                            })}
                            className="input-field w-full"
                          >
                            <option value="">Selecione</option>
                            <option value="Casa">Casa</option>
                            <option value="Academia">Academia</option>
                            <option value="Misto">Misto</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-light mb-2">RPE Preferido</label>
                          <input
                            type="number"
                            value={formData.onboarding.rpePreferido}
                            onChange={(e) => setFormData({
                              ...formData,
                              onboarding: { ...formData.onboarding, rpePreferido: e.target.value }
                            })}
                            className="input-field w-full"
                            min="1"
                            max="10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-grey/30">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      email: '',
                      senha: '',
                      nome: '',
                      telefone: '',
                      dataNascimento: '',
                      role: 'USER',
                      onboarding: {
                        idade: '',
                        sexo: '',
                        tipoCorpo: '',
                        altura: '',
                        pesoAtual: '',
                        percentualGordura: '',
                        aguaDiaria: '',
                        experiencia: '',
                        objetivo: '',
                        frequenciaSemanal: '',
                        tempoDisponivel: '',
                        localTreino: '',
                        lesoes: [],
                        preferencias: [],
                        problemasAnteriores: [],
                        objetivosAdicionais: [],
                        rpePreferido: ''
                      }
                    })
                    setShowOnboardingSection(false)
                  }} 
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Criando...' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cadastro/Edição de Exercício */}
      <ExercicioFormModal
        exercicio={loadingExercicioEdit ? null : exercicioEdit}
        isOpen={showEditModal}
        isCreating={isCreatingExercicio}
        gruposMusculares={gruposMusculares}
        onClose={handleCloseEditModal}
        onSave={async (savedExercicio) => {
          await carregarExercicios()
          // Se criou um exercício, atualizar estado para modo edição
          if (savedExercicio && isCreatingExercicio) {
            setSelectedExercicioId(savedExercicio.id)
            setExercicioEdit(savedExercicio)
            setIsCreatingExercicio(false)
          } else if (savedExercicio && !isCreatingExercicio) {
            // Atualizar exercício editado
            setExercicioEdit(savedExercicio)
            if (savedExercicio.id && savedExercicio.id !== selectedExercicioId) {
              setSelectedExercicioId(savedExercicio.id)
            }
          }
        }}
      />

      {/* Modal de Grupo Muscular */}
      <GrupoMuscularFormModal
        isOpen={showGrupoModal}
        onClose={() => setShowGrupoModal(false)}
        grupoId={selectedGrupoId}
        onSave={() => {
          setShowGrupoModal(false)
          carregarGruposMusculares()
        }}
        onSuccess={() => {
          setShowGrupoModal(false)
          carregarGruposMusculares()
        }}
      />

      {/* Modal de Simular Pagamento */}
      {showSimularPagamentoModal && userDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full animate-scale-in border border-primary/30">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-grey/30">
              <h3 className="text-xl font-display font-bold text-light">Simular Pagamento</h3>
              <button 
                onClick={() => setShowSimularPagamentoModal(false)} 
                className="btn-secondary p-2"
                disabled={simulandoPagamento}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                <p className="text-sm text-warning font-medium mb-2">⚠️ Ação de Teste</p>
                <p className="text-sm text-light-muted">
                  Esta ação irá simular um pagamento completo, ativando o plano do usuário e enviando o e-mail de boas-vindas. 
                  Use apenas para testes em produção.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-light mb-2">Usuário</label>
                <div className="bg-dark-lighter p-3 rounded-lg">
                  <p className="text-light font-medium">{userDetails.usuario.nome || 'Sem nome'}</p>
                  <p className="text-light-muted text-sm">{userDetails.usuario.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-light mb-2">Plano *</label>
                <select
                  value={planoSimulacao}
                  onChange={(e) => setPlanoSimulacao(e.target.value as 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL')}
                  className="input-field w-full"
                  disabled={simulandoPagamento}
                >
                  <option value="MENSAL">Mensal</option>
                  <option value="TRIMESTRAL">Trimestral</option>
                  <option value="SEMESTRAL">Semestral</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-grey/30">
                <button 
                  type="button" 
                  onClick={() => setShowSimularPagamentoModal(false)} 
                  className="btn-secondary"
                  disabled={simulandoPagamento}
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                    if (!userDetails) return;
                    
                    setSimulandoPagamento(true);
                    try {
                      const response = await api.post(`/admin/usuarios/${userDetails.usuario.id}/simular-pagamento`, {
                        plano: planoSimulacao
                      });
                      
                      if (response.data.success) {
                        const emailSent = response.data.result?.emailSent;
                        const emailError = response.data.result?.emailError;
                        
                        if (emailSent) {
                          showToast('Pagamento simulado com sucesso! E-mail de boas-vindas enviado.', 'success');
                        } else {
                          showToast(
                            `Pagamento simulado, mas e-mail não foi enviado. Erro: ${emailError || 'Desconhecido'}`,
                            'error'
                          );
                          console.error('Erro no envio de e-mail:', emailError);
                        }
                        
                        setShowSimularPagamentoModal(false);
                        // Recarregar detalhes do usuário
                        await carregarDetalhesUsuario(userDetails.usuario.id);
                        // Recarregar lista de usuários
                        await carregarUsuarios();
                      } else {
                        const errorMsg = response.data.error || 'Erro ao simular pagamento';
                        showToast(errorMsg, 'error');
                        if (response.data.configError) {
                          console.error('Erro de configuração:', errorMsg);
                        }
                      }
                    } catch (error: any) {
                      console.error('Erro ao simular pagamento:', error);
                      showToast(error.response?.data?.error || 'Erro ao simular pagamento', 'error');
                    } finally {
                      setSimulandoPagamento(false);
                    }
                  }}
                  className="btn-primary"
                  disabled={simulandoPagamento}
                >
                  {simulandoPagamento ? (
                    <span className="flex items-center gap-2">
                      <div className="spinner h-4 w-4"></div>
                      Processando...
                    </span>
                  ) : (
                    'Confirmar e Enviar E-mail'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Redefinir Senha */}
      {showRedefinirSenhaModal && userDetails && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowRedefinirSenhaModal(false)}
        >
          <div
            className="card max-w-md w-full animate-scale-in border border-primary/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-grey/30">
              <h3 className="text-xl font-display font-bold text-light">
                Redefinir Senha do Usuário
              </h3>
              <button
                onClick={() => setShowRedefinirSenhaModal(false)}
                className="btn-secondary p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-light-muted mb-2">
                  Usuário: <span className="text-light font-medium">{userDetails.usuario.email}</span>
                </p>
                <p className="text-xs text-light-muted mb-4">
                  A nova senha deve ter no mínimo 8 caracteres, com pelo menos uma letra e um número.
                </p>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-light">Nova Senha</span>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-card border border-grey/30 rounded-lg text-light focus:ring-primary focus:border-primary outline-none"
                  placeholder="Digite a nova senha"
                  disabled={redefinindoSenha}
                />
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowRedefinirSenhaModal(false)
                    setNovaSenha('')
                  }}
                  className="btn-secondary flex-1"
                  disabled={redefinindoSenha}
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (!novaSenha || novaSenha.length < 8) {
                      showToast('A senha deve ter no mínimo 8 caracteres', 'error')
                      return
                    }

                    if (!/[a-zA-Z]/.test(novaSenha) || !/[0-9]/.test(novaSenha)) {
                      showToast('A senha deve conter pelo menos uma letra e um número', 'error')
                      return
                    }

                    setRedefinindoSenha(true)
                    try {
                      // Trim da senha antes de enviar
                      const senhaLimpa = novaSenha.trim()
                      await api.post(`/admin/usuarios/${userDetails.usuario.id}/redefinir-senha`, {
                        novaSenha: senhaLimpa
                      })
                      showToast('Senha redefinida com sucesso!', 'success')
                      setShowRedefinirSenhaModal(false)
                      setNovaSenha('')
                      // Recarregar detalhes do usuário
                      await carregarDetalhesUsuario(userDetails.usuario.id)
                    } catch (error: any) {
                      console.error('Erro ao redefinir senha:', error)
                      showToast(error.response?.data?.error || 'Erro ao redefinir senha', 'error')
                    } finally {
                      setRedefinindoSenha(false)
                    }
                  }}
                  className="btn-primary flex-1"
                  disabled={redefinindoSenha || !novaSenha}
                >
                  {redefinindoSenha ? 'Redefinindo...' : 'Redefinir Senha'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Testar E-mail de Remarketing */}
      {showTestarEmailModal && userDetails && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowTestarEmailModal(false)}
        >
          <div
            className="card max-w-md w-full animate-scale-in border border-primary/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-grey/30">
              <h3 className="text-xl font-display font-bold text-light">
                Testar E-mail de Remarketing
              </h3>
              <button
                onClick={() => setShowTestarEmailModal(false)}
                className="btn-secondary p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-light-muted mb-2">
                  Usuário: <span className="text-light font-medium">{userDetails.usuario.email}</span>
                </p>
                <p className="text-xs text-light-muted mb-4">
                  Selecione qual tipo de e-mail de remarketing deseja enviar para este usuário.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-light">Tipo de E-mail</span>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-dark-card border border-grey/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <input
                        type="radio"
                        name="tipoEmail"
                        value="10min"
                        checked={tipoEmailTeste === '10min'}
                        onChange={(e) => setTipoEmailTeste(e.target.value as '10min' | '24h' | '48h')}
                        className="w-4 h-4 text-primary focus:ring-primary"
                        disabled={enviandoEmailTeste}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-light">E-mail 1 (10 minutos)</div>
                        <div className="text-xs text-light-muted">Seu treino personalizado está quase pronto!</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-dark-card border border-grey/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <input
                        type="radio"
                        name="tipoEmail"
                        value="24h"
                        checked={tipoEmailTeste === '24h'}
                        onChange={(e) => setTipoEmailTeste(e.target.value as '10min' | '24h' | '48h')}
                        className="w-4 h-4 text-primary focus:ring-primary"
                        disabled={enviandoEmailTeste}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-light">E-mail 2 (24 horas)</div>
                        <div className="text-xs text-light-muted">Última chance: Seu treino personalizado te espera</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-dark-card border border-grey/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <input
                        type="radio"
                        name="tipoEmail"
                        value="48h"
                        checked={tipoEmailTeste === '48h'}
                        onChange={(e) => setTipoEmailTeste(e.target.value as '10min' | '24h' | '48h')}
                        className="w-4 h-4 text-primary focus:ring-primary"
                        disabled={enviandoEmailTeste}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-light">E-mail 3 (48 horas)</div>
                        <div className="text-xs text-light-muted">Não deixe seus objetivos para depois</div>
                      </div>
                    </label>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowTestarEmailModal(false)
                    setTipoEmailTeste('10min')
                  }}
                  className="btn-secondary flex-1"
                  disabled={enviandoEmailTeste}
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (!userDetails?.usuario?.id) {
                      showToast('Erro: ID do usuário não encontrado', 'error')
                      return
                    }

                    setEnviandoEmailTeste(true)
                    try {
                      await testarEmailRemarketing(userDetails.usuario.id, tipoEmailTeste)
                      showToast(`E-mail de remarketing (${tipoEmailTeste}) enviado com sucesso!`, 'success')
                      setShowTestarEmailModal(false)
                      setTipoEmailTeste('10min')
                    } catch (error: any) {
                      console.error('Erro ao enviar e-mail de teste:', error)
                      showToast(error.response?.data?.error || error.response?.data?.message || 'Erro ao enviar e-mail de teste', 'error')
                    } finally {
                      setEnviandoEmailTeste(false)
                    }
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={enviandoEmailTeste}
                >
                  {enviandoEmailTeste ? (
                    <>
                      <div className="spinner h-4 w-4"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Enviar E-mail de Teste
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
