import { useState, useEffect } from 'react'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'

interface SystemSettings {
  id: string
  imagemPerfilPadrao: string | null
  imagemLoginPadrao: string | null
}

export default function SistemaImagensAdmin() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<'perfil' | 'login' | null>(null)

  useEffect(() => {
    carregarSettings()
  }, [])

  const carregarSettings = async () => {
    try {
      const response = await api.get('/admin/settings/imagens')
      setSettings(response.data)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      showToast('Erro ao carregar configurações', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (tipo: 'perfil' | 'login', file: File) => {
    if (!file) return

    // Validar tipo e tamanho
    if (!file.type.startsWith('image/')) {
      showToast('Selecione apenas arquivos de imagem', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      showToast('A imagem deve ter no máximo 5MB', 'error')
      return
    }

    setUploading(tipo)
    const formData = new FormData()
    formData.append('imagem', file)

    try {
      const response = await api.post(`/admin/settings/imagens/${tipo}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const novaUrl = response.data.imagemUrl
      setSettings(prev => prev ? {
        ...prev,
        [`imagem${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Padrao` as keyof SystemSettings]: novaUrl
      } : null)
      
      const tipoNome = tipo === 'perfil' ? 'Perfil' : 'Login'
      showToast(`Upload da imagem de ${tipoNome} realizado com sucesso!`, 'success')
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      showToast(error.response?.data?.error || 'Erro ao fazer upload da imagem', 'error')
    } finally {
      setUploading(null)
    }
  }

  const handleRemover = async (tipo: 'perfil' | 'login') => {
    if (!confirm(`Deseja realmente remover a imagem padrão de ${tipo === 'perfil' ? 'Perfil' : 'Login'}?`)) {
      return
    }

    try {
      await api.delete(`/admin/settings/imagens/${tipo}`)
      setSettings(prev => prev ? {
        ...prev,
        [`imagem${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Padrao` as keyof SystemSettings]: null
      } : null)
      
      const tipoNome = tipo === 'perfil' ? 'Perfil' : 'Login'
      showToast(`Imagem de ${tipoNome} removida com sucesso!`, 'success')
    } catch (error: any) {
      console.error('Erro ao remover:', error)
      showToast(error.response?.data?.error || 'Erro ao remover imagem', 'error')
    }
  }

  const getImageUrl = (tipo: 'perfil' | 'login'): string | null => {
    if (!settings) return null
    const key = `imagem${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Padrao` as keyof SystemSettings
    return settings[key] as string | null
  }

  if (loading) {
    return <div className="p-8 text-center text-light-muted">Carregando configurações...</div>
  }

  const imagens = [
    {
      tipo: 'perfil' as const,
      titulo: 'Imagem Padrão do Perfil',
      descricao: 'Imagem que aparece no banner da tela de perfil do usuário'
    },
    {
      tipo: 'login' as const,
      titulo: 'Imagem Padrão do Login',
      descricao: 'Imagem que aparece na tela de login'
    }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-light">Imagens Padrão do Sistema</h2>
          <p className="text-sm text-light-muted mt-1">Configure as imagens padrão exibidas nas telas principais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {imagens.map(({ tipo, titulo, descricao }) => {
          const imagemUrl = getImageUrl(tipo)
          const isUploading = uploading === tipo

          return (
            <div key={tipo} className="card p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-light mb-1">{titulo}</h3>
                <p className="text-sm text-light-muted">{descricao}</p>
              </div>

              {/* Preview da imagem */}
              {imagemUrl && (
                <div className="relative rounded-lg overflow-hidden border border-grey/30 bg-dark-lighter">
                  <img
                    src={imagemUrl}
                    alt={titulo}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {!imagemUrl && (
                <div className="rounded-lg border-2 border-dashed border-grey/30 bg-dark-lighter p-8 text-center">
                  <svg
                    className="w-12 h-12 mx-auto text-light-muted mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-light-muted">Nenhuma imagem definida</p>
                </div>
              )}

              {/* Upload */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(tipo, file)
                    }
                  }}
                  disabled={isUploading}
                  className="hidden"
                  id={`upload-${tipo}`}
                />
                <label
                  htmlFor={`upload-${tipo}`}
                  className="btn-primary w-full text-center cursor-pointer flex items-center justify-center gap-2 block"
                  style={{ pointerEvents: isUploading ? 'none' : 'auto', opacity: isUploading ? 0.6 : 1 }}
                >
                  {isUploading ? (
                    <>
                      <div className="spinner h-4 w-4"></div>
                      Fazendo upload...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {imagemUrl ? 'Alterar Imagem' : 'Fazer Upload'}
                    </>
                  )}
                </label>

                {imagemUrl && (
                  <button
                    onClick={() => handleRemover(tipo)}
                    disabled={isUploading}
                    className="btn-secondary w-full"
                  >
                    Remover Imagem
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

