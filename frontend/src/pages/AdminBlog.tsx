import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import BlogArticleFormModal from '../components/BlogArticleFormModal'
import { resolveApiPath } from '../utils/api-url'

// Definir título da página no useEffect

interface BlogArticle {
  id: string
  slug: string
  title: string
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

  const handleLogout = () => {
    localStorage.removeItem('adminAccessToken')
    localStorage.removeItem('adminRefreshToken')
    localStorage.removeItem('adminUser')
    navigate('/admin/login')
  }

  if (verificando || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando...</p>
        </div>
      </div>
    )
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
                onClick={() => navigate('/admin')}
                className="py-4 px-6 text-sm font-medium border-b-2 border-transparent text-light-muted hover:text-light hover:border-grey/50 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Estatísticas
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="py-4 px-6 text-sm font-medium border-b-2 border-transparent text-light-muted hover:text-light hover:border-grey/50 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Usuários
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="py-4 px-6 text-sm font-medium border-b-2 border-transparent text-light-muted hover:text-light hover:border-grey/50 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Exercícios
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="py-4 px-6 text-sm font-medium border-b-2 border-transparent text-light-muted hover:text-light hover:border-grey/50 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Grupos Musculares
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="py-4 px-6 text-sm font-medium border-b-2 border-transparent text-light-muted hover:text-light hover:border-grey/50 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Imagens de Treino
              </button>
              <button
                onClick={() => navigate('/admin/blog')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  window.location.pathname === '/admin/blog'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-light-muted hover:text-light hover:border-grey/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Blog
              </button>
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-light mb-2">
                Gerenciar Blog
              </h1>
              <p className="text-light-muted">
                Crie, edite e gerencie artigos do blog
              </p>
            </div>
            <button
              onClick={handleCreateArtigo}
              className="btn-primary px-6 py-3 text-base font-semibold"
            >
              + Novo Artigo
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos</option>
              <option value="true">Publicados</option>
              <option value="false">Rascunhos</option>
            </select>
          </div>
        </div>

        {/* Lista de Artigos */}
        {artigos.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <p className="text-light-muted mb-4">Nenhum artigo encontrado</p>
              <button
                onClick={handleCreateArtigo}
                className="btn-primary px-6 py-3"
              >
                Criar Primeiro Artigo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artigos.map((artigo) => (
              <div
                key={artigo.id}
                className="card card-hover"
              >
                {artigo.featuredImage && (
                  <img
                    src={resolveApiPath(artigo.featuredImage) || artigo.featuredImage}
                    alt={artigo.featuredImageAlt || artigo.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (artigo.featuredImage && !artigo.featuredImage.startsWith('http')) {
                        const altPath = artigo.featuredImage.startsWith('/') 
                          ? `/api${artigo.featuredImage}` 
                          : `/api/uploads/blog/${artigo.featuredImage}`
                        target.src = altPath
                      }
                    }}
                  />
                )}
                <div className="mb-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      artigo.published
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {artigo.published ? 'Publicado' : 'Rascunho'}
                  </span>
                  <span className="ml-2 text-xs text-light-muted">
                    {artigo.category}
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-light mb-2 line-clamp-2">
                  {artigo.title}
                </h3>
                <p className="text-sm text-light-muted mb-4 line-clamp-2">
                  {artigo.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-light-muted mb-4">
                  <span>{formatDate(artigo.publishedAt)}</span>
                  <span>{artigo.readingTime} min</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditArtigo(artigo)}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteArtigo(artigo.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-semibold"
                  >
                    Deletar
                  </button>
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
      </main>
    </div>
  )
}

