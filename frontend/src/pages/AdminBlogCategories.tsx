import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'

interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  introText: string | null
  icon: string | null
  metaTitle: string | null
  metaDescription: string | null
  _count?: {
    articles: number
  }
}

export default function AdminBlogCategories() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [verificando, setVerificando] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    introText: '',
    icon: '',
    metaTitle: '',
    metaDescription: ''
  })

  useEffect(() => {
    document.title = 'Categorias do Blog - Painel Administrativo | AthletIA'
  }, [])

  useEffect(() => {
    const verificarAdmin = async () => {
      try {
        await api.get('/admin/estatisticas')
        await carregarCategorias()
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('adminAccessToken')
          localStorage.removeItem('adminRefreshToken')
          localStorage.removeItem('adminUser')
          showToast('Sessão expirada. Faça login novamente.', 'error')
          navigate('/admin/login')
        } else {
          navigate('/admin/login')
        }
      } finally {
        setVerificando(false)
      }
    }
    verificarAdmin()
  }, [navigate])

  const carregarCategorias = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/blog/categorias')
      setCategories(response.data)
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao carregar categorias', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedCategory(null)
    setIsCreating(true)
    setFormData({
      name: '',
      slug: '',
      description: '',
      introText: '',
      icon: '',
      metaTitle: '',
      metaDescription: ''
    })
    setShowFormModal(true)
  }

  const handleEdit = (category: BlogCategory) => {
    setSelectedCategory(category)
    setIsCreating(false)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      introText: category.introText || '',
      icon: category.icon || '',
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || ''
    })
    setShowFormModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) {
      return
    }

    try {
      await api.delete(`/admin/blog/categorias/${id}`)
      showToast('Categoria deletada com sucesso', 'success')
      carregarCategorias()
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao deletar categoria', 'error')
    }
  }

  const handleSave = async () => {
    try {
      if (isCreating) {
        await api.post('/admin/blog/categorias', formData)
        showToast('Categoria criada com sucesso', 'success')
      } else {
        await api.put(`/admin/blog/categorias/${selectedCategory!.id}`, formData)
        showToast('Categoria atualizada com sucesso', 'success')
      }
      setShowFormModal(false)
      carregarCategorias()
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao salvar categoria', 'error')
    }
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
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
              onClick={() => navigate('/admin/blog')}
              className="btn-secondary flex items-center gap-2"
            >
              Voltar para Blog
            </button>
          </div>
        </div>
      </nav>

      <main className="container-custom section">
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-light mb-2">
                Gerenciar Categorias do Blog
              </h1>
              <p className="text-light-muted">
                Crie e gerencie categorias para organizar os artigos do blog
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="btn-primary px-6 py-3 text-base font-semibold"
            >
              + Nova Categoria
            </button>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <p className="text-light-muted mb-4">Nenhuma categoria encontrada</p>
              <button
                onClick={handleCreate}
                className="btn-primary px-6 py-3"
              >
                Criar Primeira Categoria
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="card">
                <div className="mb-4">
                  <h3 className="text-xl font-display font-bold text-light mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-light-muted mb-2">
                    Slug: <code className="bg-dark px-2 py-1 rounded">{category.slug}</code>
                  </p>
                  {category._count && (
                    <p className="text-xs text-light-muted">
                      {category._count.articles} artigo(s)
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-semibold"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-dark-lighter rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-grey/30">
              <div className="flex items-center justify-between p-6 border-b border-grey/30">
                <h3 className="text-2xl font-display font-bold text-light">
                  {isCreating ? 'Nova Categoria' : 'Editar Categoria'}
                </h3>
                <button onClick={() => setShowFormModal(false)} className="btn-secondary p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Nome <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        name: e.target.value,
                        slug: prev.slug || generateSlug(e.target.value)
                      }))
                    }}
                    className="input-field w-full"
                    placeholder="Ex: Treinos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Slug <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                    className="input-field w-full"
                    placeholder="treinos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Descrição (SEO)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field w-full min-h-[80px]"
                    placeholder="Descrição para SEO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Texto Introdutório (Editorial)
                  </label>
                  <textarea
                    value={formData.introText}
                    onChange={(e) => setFormData(prev => ({ ...prev, introText: e.target.value }))}
                    className="input-field w-full min-h-[100px]"
                    placeholder="Texto que aparecerá na página da categoria"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Ícone (URL ou código)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="input-field w-full"
                    placeholder="URL do ícone ou código"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Meta Title (SEO)
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Título para SEO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Meta Description (SEO)
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    className="input-field w-full min-h-[80px]"
                    placeholder="Descrição para SEO"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 p-6 border-t border-grey/30">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-6 py-2 bg-dark border border-grey/30 rounded-lg text-light hover:bg-dark-lighter transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary px-6 py-2"
                >
                  {isCreating ? 'Criar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
