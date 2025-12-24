import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import BlogArticleFormModal from '../components/BlogArticleFormModal'
import OptimizedImage from '../components/blog/OptimizedImage'
import AdminHeader from '../components/admin/AdminHeader'
import AdminSidebar from '../components/admin/AdminSidebar'

// Definir título da página no useEffect

interface BlogArticle {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  metaTitle: string
  metaDescription: string
  keywords: string[]
  author: string
  publishedAt: string | null
  readingTime: number
  category: string
  featuredImage: string | null
  featuredImageAlt: string | null
  excerpt: string
  content: string
  ctaTitle: string | null
  ctaDescription: string | null
  ctaButtonText: string | null
  published: boolean
  isFeatured?: boolean
  isPillar?: boolean
  viewsCount?: number
  status?: string
  categoryRelation?: {
    id: string
    name: string
    slug: string
  } | null
  authorRelation?: {
    id: string
    name: string
    role: string | null
  } | null
  createdAt: string
  updatedAt: string
}

export default function AdminBlog() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [artigos, setArtigos] = useState<BlogArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [verificando, setVerificando] = useState(true)
  const [selectedArtigo, setSelectedArtigo] = useState<BlogArticle | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [filterPublished, setFilterPublished] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('adminSidebarOpen')
    return saved ? saved === 'true' : window.innerWidth >= 1024
  })

  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    localStorage.setItem('adminSidebarOpen', String(newState))
  }

  const handleTabChange = (tab: string) => {
    if (tab === 'blog') {
      navigate('/admin/blog')
    } else {
      navigate('/admin')
      // Disparar evento para mudar tab se necessário
      window.dispatchEvent(new CustomEvent('admin:changeTab', { detail: tab }))
    }
  }

  // Definir título da página
  useEffect(() => {
    document.title = 'Gerenciar Blog - Painel Administrativo | AthletIA'
  }, [])

  // Verificar autenticação admin e carregar artigos
  useEffect(() => {
    const verificarAdmin = async () => {
      try {
        await api.get('/admin/estatisticas')
        await carregarArtigos()
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('adminAccessToken')
          localStorage.removeItem('adminRefreshToken')
          localStorage.removeItem('adminUser')
          showToast('Sessão expirada. Faça login novamente.', 'error')
          navigate('/admin/login')
        } else {
          console.error('Administrador não autenticado:', error)
          navigate('/admin/login')
        }
      } finally {
        setVerificando(false)
      }
    }
    verificarAdmin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  useEffect(() => {
    if (!verificando) {
      carregarArtigos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPublished, searchTerm, verificando])

  const carregarArtigos = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filterPublished !== 'all') {
        params.published = filterPublished === 'true'
      }
      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await api.get('/admin/blog/artigos', { params })
      setArtigos(response.data)
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('adminRefreshToken')
        localStorage.removeItem('adminUser')
        showToast('Sessão expirada. Faça login novamente.', 'error')
        navigate('/admin/login')
      } else {
        showToast(error.response?.data?.error || 'Erro ao carregar artigos', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateArtigo = () => {
    setSelectedArtigo(null)
    setIsCreating(true)
    setShowFormModal(true)
  }

  const handleEditArtigo = (artigo: BlogArticle) => {
    setSelectedArtigo(artigo)
    setIsCreating(false)
    setShowFormModal(true)
  }

  const handleDeleteArtigo = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este artigo? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await api.delete(`/admin/blog/artigos/${id}`)
      showToast('Artigo deletado com sucesso', 'success')
      carregarArtigos()
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao deletar artigo', 'error')
    }
  }

  const handleSaveArtigo = () => {
    setShowFormModal(false)
    setSelectedArtigo(null)
    setIsCreating(false)
    carregarArtigos()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não publicado'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (verificando || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark text-white">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <ToastContainer />
      <AdminHeader onMenuToggle={toggleSidebar} sidebarOpen={sidebarOpen} />
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab="blog"
        onTabChange={handleTabChange}
      />
      <main className="ml-0 lg:ml-64 pt-16 min-h-screen">
        <div className="container-custom py-6 md:py-8">

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-light mb-2">
                Gerenciar Blog
              </h1>
              <p className="text-base text-light-muted">
                Crie, edite e gerencie artigos do blog
              </p>
            </div>
            <button
              onClick={handleCreateArtigo}
              className="btn-primary px-6 py-3 text-base font-semibold whitespace-nowrap flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Artigo
            </button>
          </div>
          
          {/* Sub Navigation */}
          <div className="bg-dark border border-grey/30 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/admin/blog')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  window.location.pathname === '/admin/blog'
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-md shadow-primary/10'
                    : 'bg-dark-lighter border border-grey/30 text-light-muted hover:text-light hover:border-grey/50 hover:bg-dark'
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => navigate('/admin/blog/categorias')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  window.location.pathname === '/admin/blog/categorias'
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-md shadow-primary/10'
                    : 'bg-dark-lighter border border-grey/30 text-light-muted hover:text-light hover:border-grey/50 hover:bg-dark'
                }`}
              >
                Categorias
              </button>
              <button
                onClick={() => navigate('/admin/blog/autores')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  window.location.pathname === '/admin/blog/autores'
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-md shadow-primary/10'
                    : 'bg-dark-lighter border border-grey/30 text-light-muted hover:text-light hover:border-grey/50 hover:bg-dark'
                }`}
              >
                Autores
              </button>
              <button
                onClick={() => navigate('/admin/blog/ctas')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  window.location.pathname === '/admin/blog/ctas'
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-md shadow-primary/10'
                    : 'bg-dark-lighter border border-grey/30 text-light-muted hover:text-light hover:border-grey/50 hover:bg-dark'
                }`}
              >
                CTAs
              </button>
              <button
                onClick={() => navigate('/admin/blog/configuracoes')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  window.location.pathname === '/admin/blog/configuracoes'
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-md shadow-primary/10'
                    : 'bg-dark-lighter border border-grey/30 text-light-muted hover:text-light hover:border-grey/50 hover:bg-dark'
                }`}
              >
                Configurações
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-dark border border-grey/30 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-light-muted mb-2">
                  Buscar artigos
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar por título, conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field w-full pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <label className="block text-sm font-medium text-light-muted mb-2">
                  Status
                </label>
                <select
                  value={filterPublished}
                  onChange={(e) => setFilterPublished(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="all">Todos</option>
                  <option value="true">Publicados</option>
                  <option value="false">Rascunhos</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Artigos */}
        {artigos.length === 0 ? (
          <div className="card">
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto mb-4 text-light-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-lg font-medium text-light mb-2">Nenhum artigo encontrado</p>
              <p className="text-light-muted mb-6">Comece criando seu primeiro artigo</p>
              <button
                onClick={handleCreateArtigo}
                className="btn-primary px-6 py-3 flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Criar Primeiro Artigo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {artigos.map((artigo) => (
              <div
                key={artigo.id}
                className="card card-hover group overflow-hidden"
              >
                {artigo.featuredImage && (
                  <div className="w-full h-48 rounded-t-xl mb-4 overflow-hidden bg-dark-lighter relative">
                    <OptimizedImage
                      src={artigo.featuredImage}
                      alt={artigo.featuredImageAlt || artigo.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-sm ${
                          artigo.published
                            ? 'bg-green-500/90 text-white'
                            : 'bg-yellow-500/90 text-white'
                        }`}
                      >
                        {artigo.published ? 'Publicado' : 'Rascunho'}
                      </span>
                      {artigo.isFeatured && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/90 text-white backdrop-blur-sm">
                          ⭐ Destaque
                        </span>
                      )}
                      {artigo.isPillar && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/90 text-white backdrop-blur-sm">
                          📌 Pilar
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="px-1">
                  {!artigo.featuredImage && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                          artigo.published
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {artigo.published ? 'Publicado' : 'Rascunho'}
                      </span>
                      {artigo.isFeatured && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/20 text-primary">
                          ⭐ Destaque
                        </span>
                      )}
                      {artigo.isPillar && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/20 text-purple-400">
                          📌 Pilar
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-dark-lighter text-light-muted border border-grey/30">
                      {artigo.categoryRelation?.name || artigo.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-display font-bold text-light mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {artigo.title}
                  </h3>
                  {artigo.subtitle && (
                    <p className="text-sm text-light-muted mb-3 line-clamp-1">
                      {artigo.subtitle}
                    </p>
                  )}
                  <p className="text-sm text-light-muted mb-4 line-clamp-2 leading-relaxed">
                    {artigo.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-light-muted mb-4 pt-4 border-t border-grey/20">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {artigo.readingTime} min
                    </span>
                    <div className="flex items-center gap-3">
                      {artigo.viewsCount !== undefined && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {artigo.viewsCount}
                        </span>
                      )}
                      <span className="text-grey/60">
                        {formatDate(artigo.publishedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditArtigo(artigo)}
                      className="flex-1 btn-secondary text-sm py-2.5 font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteArtigo(artigo.id)}
                      className="px-4 py-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-red-500/30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline">Deletar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Formulário */}
        {showFormModal && (
          <BlogArticleFormModal
            artigo={selectedArtigo}
            isOpen={showFormModal}
            isCreating={isCreating}
            onClose={() => {
              setShowFormModal(false)
              setSelectedArtigo(null)
              setIsCreating(false)
            }}
            onSave={handleSaveArtigo}
          />
        )}
        </div>
      </main>
    </div>
  )
}

