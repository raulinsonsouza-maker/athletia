import { useState, useEffect } from 'react'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import { resolveApiPath } from '../utils/api-url'

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

interface BlogArticleFormModalProps {
  artigo: BlogArticle | null
  isOpen: boolean
  isCreating: boolean
  onClose: () => void
  onSave: () => void
}

export default function BlogArticleFormModal({
  artigo,
  isOpen,
  isCreating,
  onClose,
  onSave
}: BlogArticleFormModalProps) {
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [activeTab, setActiveTab] = useState<'basico' | 'seo' | 'conteudo' | 'cta' | 'imagem'>('basico')
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [] as string[],
    author: 'Equipe AthletIA',
    category: 'Geral',
    excerpt: '',
    content: '',
    ctaTitle: '',
    ctaDescription: '',
    ctaButtonText: '',
    readingTime: 0,
    published: false,
    publishedAt: '',
    featuredImage: null as string | null,
    featuredImageAlt: ''
  })

  const [keywordsInput, setKeywordsInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Gerar slug a partir do título
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Carregar dados do artigo quando modal abrir
  useEffect(() => {
    if (isOpen && artigo) {
      setFormData({
        title: artigo.title || '',
        slug: artigo.slug || '',
        metaTitle: artigo.metaTitle || '',
        metaDescription: artigo.metaDescription || '',
        keywords: Array.isArray(artigo.keywords) ? artigo.keywords : [],
        author: artigo.author || 'Equipe AthletIA',
        category: artigo.category || 'Geral',
        excerpt: artigo.excerpt || '',
        content: artigo.content || '',
        ctaTitle: artigo.ctaTitle || '',
        ctaDescription: artigo.ctaDescription || '',
        ctaButtonText: artigo.ctaButtonText || '',
        readingTime: artigo.readingTime || 0,
        published: artigo.published || false,
        publishedAt: artigo.publishedAt ? new Date(artigo.publishedAt).toISOString().split('T')[0] : '',
        featuredImage: artigo.featuredImage || null,
        featuredImageAlt: artigo.featuredImageAlt || ''
      })
      setKeywordsInput(Array.isArray(artigo.keywords) ? artigo.keywords.join(', ') : '')
    } else if (isOpen && isCreating) {
      // Resetar para criação
      setFormData({
        title: '',
        slug: '',
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        author: 'Equipe AthletIA',
        category: 'Geral',
        excerpt: '',
        content: '',
        ctaTitle: '',
        ctaDescription: '',
        ctaButtonText: '',
        readingTime: 0,
        published: false,
        publishedAt: '',
        featuredImage: null,
        featuredImageAlt: ''
      })
      setKeywordsInput('')
      setActiveTab('basico')
    }
    setErrors({})
  }, [isOpen, artigo, isCreating])

  // Auto-gerar slug quando título mudar
  useEffect(() => {
    if (isCreating && formData.title && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))
    }
  }, [formData.title, isCreating])

  // Auto-gerar meta title se vazio
  useEffect(() => {
    if (formData.title && !formData.metaTitle) {
      setFormData(prev => ({ ...prev, metaTitle: prev.title }))
    }
  }, [formData.title])

  const handleKeywordsChange = (value: string) => {
    setKeywordsInput(value)
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0)
    setFormData(prev => ({ ...prev, keywords }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !artigo?.id) {
      showToast('Selecione um arquivo e salve o artigo primeiro', 'error')
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('imagem', file)

      const response = await api.post(`/admin/blog/artigos/${artigo.id}/imagem`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const imageUrl = response.data.imagemUrl || response.data.artigo.featuredImage
      setFormData(prev => ({
        ...prev,
        featuredImage: imageUrl
      }))
      showToast('Imagem de capa atualizada com sucesso', 'success')
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao fazer upload da imagem', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validação
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug é obrigatório'
    }
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Resumo é obrigatório'
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório'
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Categoria é obrigatória'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showToast('Preencha todos os campos obrigatórios', 'error')
      return
    }

    setSaving(true)
    try {
      const payload: any = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        metaTitle: formData.metaTitle.trim() || formData.title.trim(),
        metaDescription: formData.metaDescription.trim() || formData.excerpt.trim(),
        keywords: formData.keywords,
        author: formData.author.trim(),
        category: formData.category.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content,
        ctaTitle: formData.ctaTitle.trim() || null,
        ctaDescription: formData.ctaDescription.trim() || null,
        ctaButtonText: formData.ctaButtonText.trim() || null,
        readingTime: formData.readingTime || 0,
        published: formData.published,
        publishedAt: formData.publishedAt || null,
        featuredImage: formData.featuredImage,
        featuredImageAlt: formData.featuredImageAlt.trim() || null
      }

      if (isCreating) {
        await api.post('/admin/blog/artigos', payload)
        showToast('Artigo criado com sucesso', 'success')
      } else {
        await api.put(`/admin/blog/artigos/${artigo!.id}`, payload)
        showToast('Artigo atualizado com sucesso', 'success')
      }

      onSave()
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Erro ao salvar artigo'
      showToast(errorMsg, 'error')
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message })
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const categories = [
    'Geral',
    'Iniciantes',
    'Emagrecimento',
    'Hipertrofia',
    'Saúde',
    'Nutrição',
    'Motivação',
    'Técnicas',
    'Equipamentos'
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-dark-lighter rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-grey/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-grey/30">
          <h3 className="text-2xl font-display font-bold text-light">
            {isCreating ? 'Novo Artigo' : 'Editar Artigo'}
          </h3>
          <button onClick={onClose} className="btn-secondary p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-grey/30 overflow-x-auto">
          {(['basico', 'seo', 'conteudo', 'cta', 'imagem'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-light-muted hover:text-light'
              }`}
            >
              {tab === 'basico' && 'Básico'}
              {tab === 'seo' && 'SEO'}
              {tab === 'conteudo' && 'Conteúdo'}
              {tab === 'cta' && 'CTA'}
              {tab === 'imagem' && 'Imagem'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Tab Básico */}
            {activeTab === 'basico' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Título do Artigo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`input-field w-full ${errors.title ? 'border-red-400' : ''}`}
                    placeholder="Ex: Guia Completo de Treino para Iniciantes"
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Slug (URL) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className={`input-field w-full ${errors.slug ? 'border-red-400' : ''}`}
                    placeholder="guia-completo-treino-iniciantes"
                  />
                  {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug}</p>}
                  <p className="text-xs text-light-muted mt-1">
                    URL amigável: /blog/{formData.slug || 'slug-do-artigo'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Categoria <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className={`input-field w-full ${errors.category ? 'border-red-400' : ''}`}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Autor
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      className="input-field w-full"
                      placeholder="Equipe AthletIA"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Resumo (Excerpt) <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    className={`input-field w-full min-h-[100px] ${errors.excerpt ? 'border-red-400' : ''}`}
                    placeholder="Breve descrição do artigo que aparecerá na listagem..."
                  />
                  {errors.excerpt && <p className="text-red-400 text-xs mt-1">{errors.excerpt}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Tempo de Leitura (minutos)
                    </label>
                    <input
                      type="number"
                      value={formData.readingTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, readingTime: parseInt(e.target.value) || 0 }))}
                      className="input-field w-full"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Data de Publicação
                    </label>
                    <input
                      type="date"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-light">Publicar artigo</span>
                  </label>
                </div>
              </div>
            )}

            {/* Tab SEO */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Meta Title (Título SEO)
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Título otimizado para SEO (50-60 caracteres)"
                    maxLength={60}
                  />
                  <p className="text-xs text-light-muted mt-1">
                    {formData.metaTitle.length}/60 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Meta Description (Descrição SEO)
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    className="input-field w-full min-h-[100px]"
                    placeholder="Descrição otimizada para SEO (150-160 caracteres)"
                    maxLength={160}
                  />
                  <p className="text-xs text-light-muted mt-1">
                    {formData.metaDescription.length}/160 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Palavras-chave (Keywords)
                  </label>
                  <input
                    type="text"
                    value={keywordsInput}
                    onChange={(e) => handleKeywordsChange(e.target.value)}
                    className="input-field w-full"
                    placeholder="treino, fitness, emagrecimento, hipertrofia (separadas por vírgula)"
                  />
                  {formData.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab Conteúdo */}
            {activeTab === 'conteudo' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Conteúdo do Artigo <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className={`input-field w-full min-h-[400px] font-mono text-sm ${errors.content ? 'border-red-400' : ''}`}
                    placeholder="Digite o conteúdo do artigo em HTML ou Markdown..."
                  />
                  {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content}</p>}
                  <p className="text-xs text-light-muted mt-1">
                    Use HTML ou Markdown para formatar o conteúdo. O conteúdo será renderizado no blog.
                  </p>
                </div>
              </div>
            )}

            {/* Tab CTA */}
            {activeTab === 'cta' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Título do CTA
                  </label>
                  <input
                    type="text"
                    value={formData.ctaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, ctaTitle: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Ex: Treino Personalizado para Iniciantes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Descrição do CTA
                  </label>
                  <textarea
                    value={formData.ctaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, ctaDescription: e.target.value }))}
                    className="input-field w-full min-h-[100px]"
                    placeholder="Descrição do call-to-action que aparecerá no final do artigo..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Texto do Botão CTA
                  </label>
                  <input
                    type="text"
                    value={formData.ctaButtonText}
                    onChange={(e) => setFormData(prev => ({ ...prev, ctaButtonText: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Ex: Criar meu treino agora"
                  />
                </div>
              </div>
            )}

            {/* Tab Imagem */}
            {activeTab === 'imagem' && (
              <div className="space-y-4">
                {formData.featuredImage && (
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Imagem de Capa Atual
                    </label>
                    <img
                      src={resolveApiPath(formData.featuredImage) || formData.featuredImage || ''}
                      alt={formData.featuredImageAlt || 'Capa do artigo'}
                      className="w-full max-w-md h-64 object-cover rounded-lg mb-4 border border-grey/20"
                      onError={(e) => {
                        console.error('Erro ao carregar imagem:', formData.featuredImage)
                        const target = e.target as HTMLImageElement
                        // Tentar com caminho alternativo se falhar
                        if (formData.featuredImage && !formData.featuredImage.startsWith('http')) {
                          const altPath = formData.featuredImage.startsWith('/') 
                            ? `/api${formData.featuredImage}` 
                            : `/api/uploads/blog/${formData.featuredImage}`
                          target.src = altPath
                        }
                      }}
                    />
                  </div>
                )}

                {artigo?.id && (
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      Upload de Nova Imagem de Capa
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="input-field w-full"
                    />
                    {uploadingImage && (
                      <p className="text-sm text-light-muted mt-2">Fazendo upload...</p>
                    )}
                    <p className="text-xs text-light-muted mt-1">
                      Formatos aceitos: JPG, PNG, WEBP. Tamanho máximo: 5MB
                    </p>
                  </div>
                )}

                {!artigo?.id && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                    <p className="text-sm text-yellow-400">
                      Salve o artigo primeiro para fazer upload da imagem de capa.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    Texto Alternativo da Imagem (Alt Text)
                  </label>
                  <input
                    type="text"
                    value={formData.featuredImageAlt}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImageAlt: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Descrição da imagem para acessibilidade e SEO"
                  />
                </div>
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-sm text-red-400">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-6 border-t border-grey/30">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-dark border border-grey/30 rounded-lg text-light hover:bg-dark-lighter transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : isCreating ? 'Criar Artigo' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

