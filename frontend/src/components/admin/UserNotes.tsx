import { useState } from 'react'

interface Note {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  tags?: string[]
}

interface UserNotesProps {
  userId: string
  notes?: Note[]
  onAddNote?: (content: string, tags?: string[]) => Promise<void>
  onEditNote?: (noteId: string, content: string, tags?: string[]) => Promise<void>
  onDeleteNote?: (noteId: string) => Promise<void>
}

export default function UserNotes({
  userId: _userId,
  notes = [],
  onAddNote,
  onEditNote,
  onDeleteNote,
}: UserNotesProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteTags, setNewNoteTags] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [editingTags, setEditingTags] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddNote = async () => {
    if (!newNoteContent.trim() || !onAddNote) return

    setIsSubmitting(true)
    try {
      const tags = newNoteTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
      await onAddNote(newNoteContent, tags)
      setNewNoteContent('')
      setNewNoteTags('')
      setIsAdding(false)
    } catch (error) {
      console.error('Erro ao adicionar nota:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditNote = async (noteId: string) => {
    if (!editingContent.trim() || !onEditNote) return

    setIsSubmitting(true)
    try {
      const tags = editingTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
      await onEditNote(noteId, editingContent, tags)
      setEditingNoteId(null)
      setEditingContent('')
      setEditingTags('')
    } catch (error) {
      console.error('Erro ao editar nota:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!onDeleteNote || !confirm('Tem certeza que deseja excluir esta nota?')) return

    try {
      await onDeleteNote(noteId)
    } catch (error) {
      console.error('Erro ao excluir nota:', error)
    }
  }

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id)
    setEditingContent(note.content)
    setEditingTags(note.tags?.join(', ') || '')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-light">Notas</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-light-muted">{notes.length} nota(s)</span>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nova Nota
            </button>
          )}
        </div>
      </div>

      {/* Formulário de nova nota */}
      {isAdding && (
        <div className="bg-dark-lighter border border-grey/30 rounded-lg p-4 space-y-3">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Digite sua nota aqui..."
            className="input-field w-full min-h-[100px] resize-none"
            autoFocus
          />
          <input
            type="text"
            value={newNoteTags}
            onChange={(e) => setNewNoteTags(e.target.value)}
            placeholder="Tags (separadas por vírgula): follow-up, importante, etc."
            className="input-field w-full"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNote}
              disabled={!newNoteContent.trim() || isSubmitting}
              className="btn-primary text-sm"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Nota'}
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewNoteContent('')
                setNewNoteTags('')
              }}
              className="btn-secondary text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de notas */}
      {notes.length === 0 && !isAdding ? (
        <div className="text-center py-8 text-light-muted">
          <p>Nenhuma nota registrada ainda.</p>
          <p className="text-xs mt-2">Adicione notas para acompanhar interações importantes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-dark-lighter border border-grey/30 rounded-lg p-4"
            >
              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="input-field w-full min-h-[100px] resize-none"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editingTags}
                    onChange={(e) => setEditingTags(e.target.value)}
                    placeholder="Tags (separadas por vírgula)"
                    className="input-field w-full"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditNote(note.id)}
                      disabled={!editingContent.trim() || isSubmitting}
                      className="btn-primary text-sm"
                    >
                      {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingNoteId(null)
                        setEditingContent('')
                        setEditingTags('')
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-light whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => startEditing(note)}
                        className="p-1.5 rounded hover:bg-white/10 text-light-muted hover:text-light transition-colors"
                        title="Editar nota"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 rounded hover:bg-error/10 text-light-muted hover:text-error transition-colors"
                        title="Excluir nota"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {note.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs bg-primary/20 text-primary border border-primary/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-light-muted">
                    <span>Criada em {formatDate(note.createdAt)}</span>
                    {note.updatedAt && note.updatedAt !== note.createdAt && (
                      <span>Editada em {formatDate(note.updatedAt)}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

