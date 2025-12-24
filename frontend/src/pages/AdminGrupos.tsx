import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import { grupoMuscularAdminService, GrupoMuscularVisual } from '../services/grupo-muscular-admin.service'

const formInicial = {
  nome: '',
  descricao: '',
  imagemUrl: '',
  ativo: true,
  ordem: 0
}

export default function AdminGrupos() {
  const navigate = useNavigate()
  const { ToastContainer, showToast } = useToast()
  const [verificando, setVerificando] = useState(true)
  const [grupos, setGrupos] = useState<GrupoMuscularVisual[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState(formInicial)
  const [salvando, setSalvando] = useState(false)
  const [uploadingImagem, setUploadingImagem] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const verificarAdmin = async () => {
      try {
        await api.get('/admin/estatisticas')
        await carregarGrupos()
      } catch (error) {
        console.error('Administrador não autenticado:', error)
        navigate('/admin/login')
      } finally {
        setVerificando(false)
      }
    }
    verificarAdmin()
  }, [navigate])

  const carregarGrupos = async () => {
    try {
      setLoading(true)
      const lista = await grupoMuscularAdminService.listar()
      setGrupos(lista)
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
      showToast('Não foi possível carregar os grupos musculares.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!formData.nome.trim()) {
      showToast('Defina um nome para o grupo.', 'error')
      return
    }

    try {
      setSalvando(true)
      if (editingId) {
        await grupoMuscularAdminService.atualizar(editingId, formData)
        showToast('Grupo atualizado com sucesso!', 'success')
      } else {
        await grupoMuscularAdminService.criar(formData)
        showToast('Grupo criado com sucesso!', 'success')
      }
      setFormData(formInicial)
      setEditingId(null)
      await carregarGrupos()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar o grupo muscular'
      showToast(message, 'error')
    } finally {
      setSalvando(false)
    }
  }

  const handleEditar = (grupo: GrupoMuscularVisual) => {
    setEditingId(grupo.id)
    setFormData({
      nome: grupo.nome,
      descricao: grupo.descricao || '',
      imagemUrl: grupo.imagemUrl || '',
      ativo: grupo.ativo,
      ordem: grupo.ordem || 0
    })
  }

  const handleNovo = () => {
    setEditingId(null)
    setFormData(formInicial)
  }

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Confirma remover este grupo?')) return
    try {
      await grupoMuscularAdminService.remover(id)
      showToast('Grupo removido.', 'success')
      if (editingId === id) {
        handleNovo()
      }
      await carregarGrupos()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover grupo'
      showToast(message, 'error')
    }
  }

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark text-white">
        <p>Validando credenciais...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <ToastContainer />
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Administração</p>
          <h1 className="text-2xl font-semibold">Grupos musculares</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin')} className="px-4 py-2 rounded-full border border-white/20 text-white/80">
            Voltar ao painel
          </button>
          <button onClick={handleNovo} className="px-4 py-2 rounded-full bg-primary text-dark font-semibold">
            {editingId ? 'Novo grupo' : 'Limpar'}
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">Carregando grupos...</div>
            ) : grupos.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
                Nenhum grupo cadastrado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grupos.map((grupo) => (
                  <div
                    key={grupo.id}
                    className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden flex flex-col"
                  >
                    <div className="h-36 relative">
                      {grupo.imagemUrl ? (
                        <img src={grupo.imagemUrl} alt={grupo.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 via-white/5 to-dark" />
                      )}
                      <span
                        className={`absolute top-3 right-3 px-3 py-1 text-xs rounded-full ${
                          grupo.ativo ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {grupo.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Grupo</p>
                        <h2 className="text-lg font-semibold">{grupo.nome}</h2>
                        {grupo.descricao && <p className="text-sm text-white/70 mt-1">{grupo.descricao}</p>}
                      </div>
                      <div className="text-xs text-white/50">Slug: {grupo.slug}</div>
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => handleEditar(grupo)}
                          className="flex-1 py-2 rounded-full border border-white/20 text-white/80 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(grupo.id)}
                          className="flex-1 py-2 rounded-full border border-red-400/50 text-red-300 text-sm"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                {editingId ? 'Editar grupo' : 'Novo grupo'}
              </p>
              <h3 className="text-lg font-semibold">{editingId ? 'Atualize os dados' : 'Adicione um novo alvo'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="text-sm text-white/70 block space-y-2">
                <span>Nome</span>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                  className="w-full rounded-2xl bg-dark border border-white/10 px-4 py-2 focus:ring-2 focus:ring-primary/40 outline-none"
                  placeholder="Ex: Peito"
                />
              </label>
              <label className="text-sm text-white/70 block space-y-2">
                <span>Descrição</span>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                  className="w-full rounded-2xl bg-dark border border-white/10 px-4 py-2 h-20 resize-none focus:ring-2 focus:ring-primary/40 outline-none"
                  placeholder="Breve descrição opcional"
                />
              </label>
              <label className="text-sm text-white/70 block space-y-2">
                <span>Imagem (URL)</span>
                <input
                  type="url"
                  value={formData.imagemUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, imagemUrl: e.target.value }))}
                  className="w-full rounded-2xl bg-dark border border-white/10 px-4 py-2 focus:ring-2 focus:ring-primary/40 outline-none"
                  placeholder="https://"
                />
                <span className="text-xs text-white/40">
                  Você pode informar uma URL direta ou enviar um arquivo logo abaixo.
                </span>
              </label>
              
              <label className="text-sm text-white/70 block space-y-2">
                <span>Upload da imagem</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingImagem}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    if (!editingId) {
                      showToast('Salve o grupo antes de enviar uma imagem.', 'error')
                      e.target.value = ''
                      return
                    }

                    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
                    if (!validTypes.includes(file.type)) {
                      showToast('Use JPG, PNG ou WEBP.', 'error')
                      e.target.value = ''
                      return
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      showToast('Arquivo muito grande. Tamanho máximo: 5MB', 'error')
                      e.target.value = ''
                      return
                    }

                    try {
                      setUploadingImagem(true)
                      const form = new FormData()
                      form.append('imagem', file)

                      console.log('[Upload] Iniciando upload de imagem:', {
                        grupoId: editingId,
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type
                      })

                      const response = await api.post(`/admin/grupos-musculares/${editingId}/imagem`, form)
                      
                      console.log('[Upload] Resposta do servidor:', response.data)
                      
                      const grupoAtualizado = response.data.grupo as GrupoMuscularVisual
                      
                      setFormData((prev) => ({
                        ...prev,
                        imagemUrl: grupoAtualizado.imagemUrl || prev.imagemUrl
                      }))

                      await carregarGrupos()
                      showToast('Imagem enviada com sucesso!', 'success')
                    } catch (error: any) {
                      console.error('[Upload] Erro ao fazer upload da imagem do grupo:', error)
                      console.error('[Upload] Detalhes do erro:', {
                        status: error.response?.status,
                        data: error.response?.data,
                        message: error.message
                      })
                      const message =
                        error.response?.data?.error ||
                        error.response?.data?.message ||
                        'Erro ao enviar imagem do grupo muscular'
                      showToast(message, 'error')
                    } finally {
                      setUploadingImagem(false)
                      e.target.value = ''
                    }
                  }}
                  className="w-full rounded-2xl bg-dark border border-dashed border-white/15 px-4 py-2 cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primary/90 file:text-dark file:text-xs"
                />
                <span className="text-xs text-white/40">
                  Formatos aceitos: JPG, PNG, WEBP • Tamanho máximo: 5MB.
                </span>
              </label>
              <label className="text-sm text-white/70 block space-y-2">
                <span>Ordem</span>
                <input
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ordem: Number(e.target.value) }))}
                  className="w-full rounded-2xl bg-dark border border-white/10 px-4 py-2 focus:ring-2 focus:ring-primary/40 outline-none"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ativo: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/20 bg-dark"
                />
                Grupo ativo
              </label>
              <button
                type="submit"
                disabled={salvando}
                className="w-full py-3 rounded-full bg-primary text-dark font-semibold disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : editingId ? 'Atualizar grupo' : 'Criar grupo'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}

