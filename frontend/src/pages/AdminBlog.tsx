import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import BlogArticleFormModal from '../components/BlogArticleFormModal'

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
  const { showToast } = useToast()
  const [artigos, setArtigos] = useState<BlogArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArtigo, setSelectedArtigo] = useState<BlogArticle | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [filterPublished, setFilterPublished] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Verificar autenticação admin e carregar artigos
  useEffect(() => {
    const adminToken = localStorage.getItem('adminAccessToken')
    if (!adminToken) {
      navigate('/admin/login')
      return
    }
    carregarArtigos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, filterPublished, searchTerm])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark text-light p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-light mb-2">
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
                className="w-full px-4 py-2 bg-dark-lighter border border-grey/30 rounded-lg text-light placeholder-light-muted focus:outline-none focus:border-primary"
              />
            </div>
            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
              className="px-4 py-2 bg-dark-lighter border border-grey/30 rounded-lg text-light focus:outline-none focus:border-primary"
            >
              <option value="all">Todos</option>
              <option value="true">Publicados</option>
              <option value="false">Rascunhos</option>
            </select>
          </div>
        </div>

        {/* Lista de Artigos */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-light-muted">Carregando artigos...</p>
          </div>
        ) : artigos.length === 0 ? (
          <div className="text-center py-12 bg-dark-lighter rounded-lg border border-grey/20">
            <p className="text-light-muted mb-4">Nenhum artigo encontrado</p>
            <button
              onClick={handleCreateArtigo}
              className="btn-primary px-6 py-3"
            >
              Criar Primeiro Artigo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artigos.map((artigo) => (
              <div
                key={artigo.id}
                className="bg-dark-lighter rounded-lg border border-grey/20 p-6 hover:border-primary/50 transition-colors"
              >
                {artigo.featuredImage && (
                  <img
                    src={artigo.featuredImage}
                    alt={artigo.featuredImageAlt || artigo.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
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
                    className="flex-1 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-semibold"
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
      </div>
    </div>
  )
}

