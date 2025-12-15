import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'

interface BlogSettings {
  id: string
  heroPostId: string | null
  featuredCount: number
  categoriesDisplay: string[]
  globalCtaId: string | null
  blogIntroText: string | null
  globalMetaTitle: string | null
  globalMetaDescription: string | null
  heroPost?: {
    id: string
    title: string
    slug: string
  } | null
  globalCta?: {
    id: string
    name: string
    type: string
  } | null
}

interface BlogArticle {
  id: string
  title: string
  slug: string
}

interface BlogCategory {
  id: string
  name: string
  slug: string
}

interface BlogCTA {
  id: string
  name: string
  type: string
}

export default function AdminBlogSettings() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [loading, setLoading] = useState(true)
  const [verificando, setVerificando] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<BlogSettings | null>(null)
  const [articles, setArticles] = useState<BlogArticle[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [ctas, setCtas] = useState<BlogCTA[]>([])
  const [formData, setFormData] = useState({
    heroPostId: '',
    featuredCount: 3,
    categoriesDisplay: [] as string[],
    globalCtaId: '',
    blogIntroText: '',
    globalMetaTitle: '',
    globalMetaDescription: ''
  })

  useEffect(() => {
    document.title = 'Configurações do Blog - Painel Administrativo | AthletIA'
  }, [])

  useEffect(() => {
    const carregarDados = async () => {
      try {
        await api.get('/admin/estatisticas')
        await Promise.all([
          carregarSettings(),
          carregarArtigos(),
          carregarCategorias(),
          carregarCTAs()
        ])
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
        setLoading(false)
      }
    }
    carregarDados()
  }, [navigate])

  const carregarSettings = async () => {
    try {
      const response = await api.get('/admin/blog/configuracoes')
      const data = response.data
      setSettings(data)
      setFormData({
        heroPostId: data.heroPostId || '',
        featuredCount: data.featuredCount || 3,
        categoriesDisplay: data.categoriesDisplay || [],
        globalCtaId: data.globalCtaId || '',
        blogIntroText: data.blogIntroText || '',
        globalMetaTitle: data.globalMetaTitle || '',
        globalMetaDescription: data.globalMetaDescription || ''
      })
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao carregar configurações', 'error')
    }
  }

  const carregarArtigos = async () => {
    try {
      const response = await api.get('/admin/blog/artigos?published=true')
      setArticles(response.data)
    } catch (error: any) {
      console.error('Erro ao carregar artigos:', error)
    }
  }

  const carregarCategorias = async () => {
    try {
      const response = await api.get('/admin/blog/categorias')
      setCategories(response.data)
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const carregarCTAs = async () => {
    try {
      const response = await api.get('/admin/blog/ctas')
      setCtas(response.data)
    } catch (error: any) {
      console.error('Erro ao carregar CTAs:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: any = {
        heroPostId: formData.heroPostId || null,
        featuredCount: formData.featuredCount,
        categoriesDisplay: formData.categoriesDisplay,
        globalCtaId: formData.globalCtaId || null,
        blogIntroText: formData.blogIntroText.trim() || null,
        globalMetaTitle: formData.globalMetaTitle.trim() || null,
        globalMetaDescription: formData.globalMetaDescription.trim() || null
      }

      await api.put('/admin/blog/configuracoes', payload)
      showToast('Configurações salvas com sucesso', 'success')
      await carregarSettings()
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao salvar configurações', 'error')
    } finally {
      setSaving(false)
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
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-light mb-2">
              Configurações do Blog
            </h1>
            <p className="text-light-muted">
              Configure as opções globais do blog
            </p>
          </div>
        </div>

        <div className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-light mb-2">
              Post Hero Principal
            </label>
            <select
              value={formData.heroPostId}
              onChange={(e) => setFormData(prev => ({ ...prev, heroPostId: e.target.value }))}
              className="input-field w-full"
            >
              <option value="">Nenhum</option>
              {articles.map(article => (
                <option key={article.id} value={article.id}>
                  {article.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-light-muted mt-1">
              Post que aparecerá em destaque no hero da home do blog
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-light mb-2">
              Quantidade de Destaques
            </label>
            <input
              type="number"
              value={formData.featuredCount}
              onChange={(e) => setFormData(prev => ({ ...prev, featuredCount: parseInt(e.target.value) || 3 }))}
              className="input-field w-full"
              min="1"
              max="10"
            />
            <p className="text-xs text-light-muted mt-1">
              Quantos posts em destaque aparecerão na home
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-light mb-2">
              Categorias Exibidas na Home
            </label>
            <select
              multiple
              value={formData.categoriesDisplay}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value)
                setFormData(prev => ({ ...prev, categoriesDisplay: selected }))
              }}
              className="input-field w-full min-h-[150px]"
              size={5}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-light-muted mt-1">
              Segure Ctrl/Cmd para selecionar múltiplas categorias
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-light mb-2">
              CTA Global Padrão
            </label>
            <select
              value={formData.globalCtaId}
              onChange={(e) => setFormData(prev => ({ ...prev, globalCtaId: e.target.value }))}
              className="input-field w-full"
            >
              <option value="">Nenhum</option>
              {ctas.map(cta => (
                <option key={cta.id} value={cta.id}>
                  {cta.name} ({cta.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-light mb-2">
              Texto Editorial do Blog
            </label>
            <textarea
              value={formData.blogIntroText}
              onChange={(e) => setFormData(prev => ({ ...prev, blogIntroText: e.target.value }))}
              className="input-field w-full min-h-[100px]"
              placeholder="Texto introdutório que aparecerá na home do blog"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light mb-2">
              Meta Title Global (SEO)
            </label>
            <input
              type="text"
              value={formData.globalMetaTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, globalMetaTitle: e.target.value }))}
              className="input-field w-full"
              placeholder="Título SEO global do blog"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light mb-2">
              Meta Description Global (SEO)
            </label>
            <textarea
              value={formData.globalMetaDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, globalMetaDescription: e.target.value }))}
              className="input-field w-full min-h-[80px]"
              placeholder="Descrição SEO global do blog"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-grey/30">
            <button
              onClick={() => navigate('/admin/blog')}
              className="px-6 py-2 bg-dark border border-grey/30 rounded-lg text-light hover:bg-dark-lighter transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
