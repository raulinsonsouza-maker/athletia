import { useState, useEffect, useRef } from 'react'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import OptimizedImage from './blog/OptimizedImage'

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
  const [activeTab, setActiveTab] = useState<'basico' | 'seo' | 'conteudo' | 'cta' | 'imagem'>('basico')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
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
    setSelectedImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showToast('Arquivo muito grande. Tamanho máximo: 5MB', 'error')
      return
    }

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      showToast('Formato inválido. Use JPG, PNG ou WEBP', 'error')
      return
    }

    setSelectedImageFile(file)
    
    // Criar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
      // Se houver imagem selecionada, usar FormData
      if (selectedImageFile) {
        const formDataToSend = new FormData()
        formDataToSend.append('title', formData.title.trim())
        formDataToSend.append('slug', formData.slug.trim() || generateSlug(formData.title.trim()))
        formDataToSend.append('metaTitle', (formData.metaTitle.trim() || formData.title.trim()))
        formDataToSend.append('metaDescription', (formData.metaDescription.trim() || formData.excerpt.trim()))
        formDataToSend.append('keywords', JSON.stringify(formData.keywords || []))
        formDataToSend.append('author', formData.author.trim())
        formDataToSend.append('category', formData.category.trim())
        formDataToSend.append('excerpt', formData.excerpt.trim())
        formDataToSend.append('content', formData.content || '')
        formDataToSend.append('ctaTitle', formData.ctaTitle.trim() || '')
        formDataToSend.append('ctaDescription', formData.ctaDescription.trim() || '')
        formDataToSend.append('ctaButtonText', formData.ctaButtonText.trim() || '')
        formDataToSend.append('readingTime', String(formData.readingTime || 0))
        formDataToSend.append('published', String(formData.published))
        formDataToSend.append('publishedAt', formData.publishedAt || '')
        formDataToSend.append('featuredImageAlt', formData.featuredImageAlt.trim() || '')
        formDataToSend.append('imagem', selectedImageFile)

        if (isCreating) {
          await api.post('/admin/blog/artigos', formDataToSend)
          showToast('Artigo criado com sucesso', 'success')
        } else {
          await api.put(`/admin/blog/artigos/${artigo!.id}`, formDataToSend)
          showToast('Artigo atualizado com sucesso', 'success')
        }
      } else {
        // Sem imagem, enviar JSON normal
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
      }

      // Limpar imagem selecionada após salvar
      setSelectedImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
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
          {(['basico', 'seo', 'conteudo', 'cta', 'imagem'] as const).map(tab => {
            // Verificar se há erros na tab
            const hasErrors = 
              (tab === 'basico' && (errors.title || errors.slug || errors.excerpt || errors.category || errors.content)) ||
              (tab === 'conteudo' && errors.content);
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap relative ${
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
                {hasErrors && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"></span>
                )}
              </button>
            );
          })}
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
                {/* Preview da imagem atual ou selecionada */}
                {(imagePreview || formData.featuredImage) && (
                  <div>
                    <label className="block text-sm font-medium text-light mb-2">
                      {imagePreview ? 'Preview da Nova Imagem' : 'Imagem de Capa Atual'}
                    </label>
                    <div className="relative w-full max-w-md">
                      <OptimizedImage
                        src={imagePreview || formData.featuredImage || ''}
                        alt={formData.featuredImageAlt || 'Capa do artigo'}
                        className="w-full h-64 object-cover rounded-lg border border-grey/20"
                      />
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full p-2 transition-colors"
                          title="Remover imagem"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Upload de imagem */}
                <div>
                  <label className="block text-sm font-medium text-light mb-2">
                    {formData.featuredImage ? 'Substituir Imagem de Capa' : 'Selecionar Imagem de Capa'}
                  </label>
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageSelect}
                      disabled={saving}
                      className="input-field w-full"
                    />
                    {selectedImageFile && (
                      <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm text-green-400 font-medium">{selectedImageFile.name}</p>
                            <p className="text-xs text-light-muted">
                              {(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB • Pronto para salvar
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-light-muted mt-1">
                    Formatos aceitos: JPG, PNG, WEBP. Tamanho máximo: 5MB
                  </p>
                </div>

                {/* Texto alternativo */}
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
                  <p className="text-xs text-light-muted mt-1">
                    Descreva a imagem para melhorar acessibilidade e SEO
                  </p>
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
              className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {saving ? 'Salvando...' : isCreating ? 'Criar Artigo' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

