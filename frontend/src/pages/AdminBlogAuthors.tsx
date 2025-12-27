import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import OptimizedImage from '../components/blog/OptimizedImage'
import AdminHeader from '../components/admin/AdminHeader'
import AdminSidebar from '../components/admin/AdminSidebar'

interface BlogAuthor {
  id: string
  name: string
  role: string | null
  bio: string | null
  avatar: string | null
  externalLink: string | null
  _count?: {
    articles: number
  }
}

export default function AdminBlogAuthors() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [authors, setAuthors] = useState<BlogAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [verificando, setVerificando] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState<BlogAuthor | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    avatar: '',
    externalLink: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
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
    document.title = 'Autores do Blog - Painel Administrativo | AthletIA'
  }, [])

  const carregarAutores = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/blog/autores')
      setAuthors(response.data)
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao carregar autores', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const verificarAdmin = async () => {
      try {
        await api.get('/admin/estatisticas')
        await carregarAutores()
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
  }, [navigate, carregarAutores, showToast])

  const handleCreate = () => {
    setSelectedAuthor(null)
    setIsCreating(true)
    setFormData({
      name: '',
      role: '',
      bio: '',
      avatar: '',
      externalLink: ''
    })
    setSelectedAvatarFile(null)
    setAvatarPreview(null)
    setShowFormModal(true)
  }

  const handleEdit = (author: BlogAuthor) => {
    setSelectedAuthor(author)
    setIsCreating(false)
    setFormData({
      name: author.name,
      role: author.role || '',
      bio: author.bio || '',
      avatar: author.avatar || '',
      externalLink: author.externalLink || ''
    })
    setAvatarPreview(author.avatar || null)
    setSelectedAvatarFile(null)
    setShowFormModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este autor?')) {
      return
    }

    try {
      await api.delete(`/admin/blog/autores/${id}`)
      showToast('Autor deletado com sucesso', 'success')
      carregarAutores()
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao deletar autor', 'error')
    }
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showToast('Arquivo muito grande. Tamanho máximo: 5MB', 'error')
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      showToast('Formato inválido. Use JPG, PNG ou WEBP', 'error')
      return
    }

    setSelectedAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast('Nome é obrigatório', 'error')
      return
    }

    try {
      if (selectedAvatarFile) {
        const formDataToSend = new FormData()
        formDataToSend.append('name', formData.name.trim())
        formDataToSend.append('role', formData.role.trim() || '')
        formDataToSend.append('bio', formData.bio.trim() || '')
        formDataToSend.append('externalLink', formData.externalLink.trim() || '')
        formDataToSend.append('avatar', selectedAvatarFile)

        if (isCreating) {
          await api.post('/admin/blog/autores', formDataToSend)
          showToast('Autor criado com sucesso', 'success')
        } else {
          await api.put(`/admin/blog/autores/${selectedAuthor!.id}`, formDataToSend)
          showToast('Autor atualizado com sucesso', 'success')
        }
      } else {
        const payload: any = {
          name: formData.name.trim(),
          role: formData.role.trim() || null,
          bio: formData.bio.trim() || null,
          externalLink: formData.externalLink.trim() || null
        }
        if (formData.avatar) {
          payload.avatar = formData.avatar
        }

        if (isCreating) {
          await api.post('/admin/blog/autores', payload)
          showToast('Autor criado com sucesso', 'success')
        } else {
          await api.put(`/admin/blog/autores/${selectedAuthor!.id}`, payload)
          showToast('Autor atualizado com sucesso', 'success')
        }
      }
      setShowFormModal(false)
      carregarAutores()
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao salvar autor', 'error')
    }
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
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-light mb-2">
                Gerenciar Autores do Blog
              </h1>
              <p className="text-light-muted">
                Crie e gerencie autores para os artigos do blog
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="btn-primary px-6 py-3 text-base font-semibold"
            >
              + Novo Autor
            </button>
          </div>
        </div>

        {authors.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <p className="text-light-muted mb-4">Nenhum autor encontrado</p>
              <button
                onClick={handleCreate}
                className="btn-primary px-6 py-3"
              >
                Criar Primeiro Autor
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author) => (
              <div key={author.id} className="card">
                {author.avatar && (
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4 mx-auto">
                    <OptimizedImage
                      src={author.avatar}
                      alt={author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="mb-4 text-center">
                  <h3 className="text-xl font-display font-bold text-light mb-1">
                    {author.name}
                  </h3>
                  {author.role && (
                    <p className="text-sm text-primary mb-2">{author.role}</p>
                  )}
                  {author._count && (
                    <p className="text-xs text-light-muted">
                      {author._count.articles} artigo(s)
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(author)}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(author.id)}
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
                  {isCreating ? 'Novo Autor' : 'Editar Autor'}
                </h3>
                <button onClick={() => setShowFormModal(false)} className="btn-secondary p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {(avatarPreview || formData.avatar) && (
                  <div className="flex justify-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary/30">
                      <OptimizedImage
                        src={avatarPreview || formData.avatar || ''}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Nome <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Nome do autor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Especialidade / Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Ex: Personal Trainer, Nutricionista"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="input-field w-full min-h-[100px]"
                    placeholder="Biografia do autor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Avatar
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarSelect}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Link Externo (Opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.externalLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, externalLink: e.target.value }))}
                    className="input-field w-full"
                    placeholder="https://..."
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
        </div>
      </main>
    </div>
  )
}
