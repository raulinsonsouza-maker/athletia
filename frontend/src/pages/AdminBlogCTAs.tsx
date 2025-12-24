import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import AdminHeader from '../components/admin/AdminHeader'
import AdminSidebar from '../components/admin/AdminSidebar'

interface BlogCTA {
  id: string
  name: string
  type: string
  title: string
  description: string
  buttonText: string
  link: string
  style: string | null
  _count?: {
    articles: number
  }
}

export default function AdminBlogCTAs() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [ctas, setCtas] = useState<BlogCTA[]>([])
  const [loading, setLoading] = useState(true)
  const [verificando, setVerificando] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedCTA, setSelectedCTA] = useState<BlogCTA | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'cadastro',
    title: '',
    description: '',
    buttonText: '',
    link: '',
    style: ''
  })
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
    document.title = 'CTAs do Blog - Painel Administrativo | AthletIA'
  }, [])

  useEffect(() => {
    const verificarAdmin = async () => {
      try {
        await api.get('/admin/estatisticas')
        await carregarCTAs()
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

  const carregarCTAs = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/blog/ctas')
      setCtas(response.data)
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao carregar CTAs', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedCTA(null)
    setIsCreating(true)
    setFormData({
      name: '',
      type: 'cadastro',
      title: '',
      description: '',
      buttonText: '',
      link: '',
      style: ''
    })
    setShowFormModal(true)
  }

  const handleEdit = (cta: BlogCTA) => {
    setSelectedCTA(cta)
    setIsCreating(false)
    setFormData({
      name: cta.name,
      type: cta.type,
      title: cta.title,
      description: cta.description,
      buttonText: cta.buttonText,
      link: cta.link,
      style: cta.style || ''
    })
    setShowFormModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este CTA?')) {
      return
    }

    try {
      await api.delete(`/admin/blog/ctas/${id}`)
      showToast('CTA deletado com sucesso', 'success')
      carregarCTAs()
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao deletar CTA', 'error')
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.title.trim() || !formData.buttonText.trim() || !formData.link.trim()) {
      showToast('Preencha todos os campos obrigatórios', 'error')
      return
    }

    try {
      const payload: any = {
        name: formData.name.trim(),
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim() || '',
        buttonText: formData.buttonText.trim(),
        link: formData.link.trim(),
        style: formData.style.trim() || null
      }

      if (isCreating) {
        await api.post('/admin/blog/ctas', payload)
        showToast('CTA criado com sucesso', 'success')
      } else {
        await api.put(`/admin/blog/ctas/${selectedCTA!.id}`, payload)
        showToast('CTA atualizado com sucesso', 'success')
      }
      setShowFormModal(false)
      carregarCTAs()
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao salvar CTA', 'error')
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
                Gerenciar CTAs do Blog
              </h1>
              <p className="text-light-muted">
                Crie e gerencie CTAs reutilizáveis para os artigos
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="btn-primary px-6 py-3 text-base font-semibold"
            >
              + Novo CTA
            </button>
          </div>
        </div>

        {ctas.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <p className="text-light-muted mb-4">Nenhum CTA encontrado</p>
              <button
                onClick={handleCreate}
                className="btn-primary px-6 py-3"
              >
                Criar Primeiro CTA
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ctas.map((cta) => (
              <div key={cta.id} className="card">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-display font-bold text-light">
                      {cta.name}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                      {cta.type}
                    </span>
                  </div>
                  <p className="text-sm text-light font-medium mb-1">{cta.title}</p>
                  <p className="text-sm text-light-muted mb-2 line-clamp-2">{cta.description}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-light-muted">Link:</span>
                    <code className="text-xs bg-dark px-2 py-1 rounded">{cta.link}</code>
                  </div>
                  {cta._count && (
                    <p className="text-xs text-light-muted">
                      {cta._count.articles} artigo(s) usando
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cta)}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cta.id)}
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
                  {isCreating ? 'Novo CTA' : 'Editar CTA'}
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
                    Nome Interno <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Ex: CTA Cadastro Principal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Tipo <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="input-field w-full"
                  >
                    <option value="cadastro">Cadastro AthletIA</option>
                    <option value="criar_treino">Criar Treino</option>
                    <option value="conhecer_plataforma">Conhecer Plataforma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Título <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Título do CTA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Descrição <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field w-full min-h-[100px]"
                    placeholder="Descrição do CTA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Texto do Botão <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Ex: Criar meu treino agora"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Link <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    className="input-field w-full"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Estilo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.style}
                    onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Estilo visual do CTA"
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
