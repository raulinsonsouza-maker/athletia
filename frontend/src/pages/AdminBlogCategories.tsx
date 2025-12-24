import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import AdminHeader from '../components/admin/AdminHeader'
import AdminSidebar from '../components/admin/AdminSidebar'

interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  introText: string | null
  icon: string | null
  featuredImage: string | null
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
    featuredImage: null as string | null,
    metaTitle: '',
    metaDescription: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
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
      window.dispatchEvent(new CustomEvent('admin:changeTab', { detail: tab }))
    }
  }

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
      featuredImage: null,
      metaTitle: '',
      metaDescription: ''
    })
    setSelectedImageFile(null)
    setImagePreview(null)
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
      featuredImage: category.featuredImage || null,
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || ''
    })
    setSelectedImageFile(null)
    setImagePreview(category.featuredImage || null)
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

  const handleImageSelect = (file: File) => {
    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      showToast('Apenas imagens JPG, PNG ou WEBP são permitidas', 'error')
      return
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showToast('Imagem muito grande. Tamanho máximo: 5MB', 'error')
      return
    }

    setSelectedImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const handleSave = async () => {
    try {
      setUploadingImage(true)
      
      // Se houver imagem selecionada, usar FormData
      if (selectedImageFile) {
        const formDataToSend = new FormData()
        formDataToSend.append('name', formData.name.trim())
        formDataToSend.append('slug', formData.slug.trim())
        formDataToSend.append('description', formData.description.trim() || '')
        formDataToSend.append('introText', formData.introText.trim() || '')
        formDataToSend.append('icon', formData.icon.trim() || '')
        formDataToSend.append('metaTitle', formData.metaTitle.trim() || '')
        formDataToSend.append('metaDescription', formData.metaDescription.trim() || '')
        formDataToSend.append('imagem', selectedImageFile)

        if (isCreating) {
          await api.post('/admin/blog/categorias', formDataToSend)
          showToast('Categoria criada com sucesso', 'success')
        } else {
          await api.put(`/admin/blog/categorias/${selectedCategory!.id}`, formDataToSend)
          showToast('Categoria atualizada com sucesso', 'success')
        }
      } else {
        // Sem imagem, enviar JSON normal
        const payload: any = {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim() || null,
          introText: formData.introText.trim() || null,
          icon: formData.icon.trim() || null,
          featuredImage: formData.featuredImage || null,
          metaTitle: formData.metaTitle.trim() || null,
          metaDescription: formData.metaDescription.trim() || null
        }

        if (isCreating) {
          await api.post('/admin/blog/categorias', payload)
          showToast('Categoria criada com sucesso', 'success')
        } else {
          await api.put(`/admin/blog/categorias/${selectedCategory!.id}`, payload)
          showToast('Categoria atualizada com sucesso', 'success')
        }
      }

      setSelectedImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setShowFormModal(false)
      carregarCategorias()
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao salvar categoria', 'error')
    } finally {
      setUploadingImage(false)
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
        {/* Tabs Navigation - Improved with horizontal scroll on mobile */}
        <div className="mb-6 bg-dark border border-grey/30 rounded-xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <nav className="flex min-w-max md:min-w-0">
              <button
                onClick={() => navigate('/admin')}
                className="py-4 px-4 md:px-6 text-sm font-medium border-b-2 border-transparent text-light-muted hover:text-light hover:border-grey/50 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">Estatísticas</span>
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="py-4 px-4 md:px-6 text-sm font-medium border-b-2 border-transparent text-light-muted hover:text-light hover:border-grey/50 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="hidden sm:inline">Usuários</span>
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="py-4 px-4 md:px-6 text-sm font-medium border-b-2 border-transparent text-light-muted hover:text-light hover:border-grey/50 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden sm:inline">Exercícios</span>
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="py-4 px-4 md:px-6 text-sm font-medium border-b-2 border-transparent text-light-muted hover:text-light hover:border-grey/50 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="hidden lg:inline">Grupos Musculares</span>
                <span className="lg:hidden">Grupos</span>
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="py-4 px-4 md:px-6 text-sm font-medium border-b-2 border-transparent text-light-muted hover:text-light hover:border-grey/50 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden lg:inline">Imagens de Treino</span>
                <span className="lg:hidden">Imagens</span>
              </button>
              <button
                onClick={() => navigate('/admin/blog')}
                className={`py-4 px-4 md:px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  window.location.pathname.startsWith('/admin/blog')
                    ? 'border-primary text-primary'
                    : 'border-transparent text-light-muted hover:text-light hover:border-grey/50'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Blog
              </button>
            </nav>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-light mb-2">
                Gerenciar Categorias
              </h1>
              <p className="text-base text-light-muted">
                Crie e gerencie categorias para organizar os artigos do blog
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="btn-primary px-6 py-3 text-base font-semibold whitespace-nowrap flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Categoria
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="bg-dark border border-grey/30 rounded-xl p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/admin/blog')}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all bg-dark-lighter border border-grey/30 text-light-muted hover:text-light hover:border-grey/50 hover:bg-dark"
              >
                Posts
              </button>
              <button
                onClick={() => navigate('/admin/blog/categorias')}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all bg-primary/20 text-primary border border-primary/30 shadow-md shadow-primary/10"
              >
                Categorias
              </button>
              <button
                onClick={() => navigate('/admin/blog/autores')}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all bg-dark-lighter border border-grey/30 text-light-muted hover:text-light hover:border-grey/50 hover:bg-dark"
              >
                Autores
              </button>
              <button
                onClick={() => navigate('/admin/blog/ctas')}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all bg-dark-lighter border border-grey/30 text-light-muted hover:text-light hover:border-grey/50 hover:bg-dark"
              >
                CTAs
              </button>
              <button
                onClick={() => navigate('/admin/blog/configuracoes')}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all bg-dark-lighter border border-grey/30 text-light-muted hover:text-light hover:border-grey/50 hover:bg-dark"
              >
                Configurações
              </button>
            </div>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="card">
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto mb-4 text-light-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-lg font-medium text-light mb-2">Nenhuma categoria encontrada</p>
              <p className="text-light-muted mb-6">Comece criando sua primeira categoria</p>
              <button
                onClick={handleCreate}
                className="btn-primary px-6 py-3 flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Criar Primeira Categoria
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="card card-hover group">
                {category.featuredImage && (
                  <div className="mb-4 -mx-6 -mt-6 rounded-t-lg overflow-hidden">
                    <img
                      src={category.featuredImage}
                      alt={category.name}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-xl font-display font-bold text-light mb-3 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <div className="mb-3">
                    <p className="text-xs text-light-muted mb-1">Slug:</p>
                    <code className="inline-block bg-dark-lighter px-2.5 py-1 rounded-md text-sm text-light-muted border border-grey/30">
                      {category.slug}
                    </code>
                  </div>
                  {category._count && (
                    <div className="flex items-center gap-2 text-sm text-light-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {category._count.articles} artigo{category._count.articles !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4 border-t border-grey/20">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 btn-secondary text-sm py-2.5 font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="px-4 py-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-red-500/30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="hidden sm:inline">Deletar</span>
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

                {/* Upload de Imagem */}
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Imagem Destacada
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
                      isDragging
                        ? 'border-primary bg-primary/10'
                        : 'border-grey/30 hover:border-primary/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImageFile(null)
                            setImagePreview(formData.featuredImage || null)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-4 text-light-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-light-muted mb-2">
                          Arraste uma imagem aqui ou clique para selecionar
                        </p>
                        <p className="text-xs text-light-muted">
                          JPG, PNG ou WEBP (máx. 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleImageSelect(file)
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 w-full btn-secondary py-2 text-sm"
                    >
                      {imagePreview ? 'Trocar Imagem' : 'Selecionar Imagem'}
                    </button>
                  </div>
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
                  disabled={uploadingImage}
                  className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? 'Salvando...' : isCreating ? 'Criar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  )
}
