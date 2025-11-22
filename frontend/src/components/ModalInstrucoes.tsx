import { useState } from 'react'

interface Exercicio {
  id: string
  nome: string
  descricao: string | null
  execucaoTecnica: string | null
  errosComuns: string[]
  gifUrl: string | null
  imagemUrl: string | null
  equipamentoNecessario: string[]
}

interface ModalInstrucoesProps {
  exercicio: Exercicio
  onClose: () => void
  formatarEquipamentos?: (equipamentos: string[]) => JSX.Element | null
}

export default function ModalInstrucoes({
  exercicio,
  onClose,
  formatarEquipamentos
}: ModalInstrucoesProps) {
  const [imagemErro, setImagemErro] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-primary/30">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-dark z-10 pb-4 border-b border-grey/20">
          <h3 className="text-2xl font-display font-bold text-light">Como Fazer</h3>
          <button
            onClick={onClose}
            className="text-light-muted hover:text-light transition-colors p-2"
            aria-label="Fechar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nome do Exercício */}
        <h4 className="text-xl font-bold text-light mb-4">{exercicio.nome}</h4>

        {/* Imagem/GIF Grande */}
        <div className="w-full mb-6 rounded-xl overflow-hidden bg-dark-lighter border-2 border-primary/20 flex items-center justify-center min-h-[200px] max-h-[500px]">
          {exercicio.gifUrl && !imagemErro ? (
            <img
              src={exercicio.gifUrl}
              alt={exercicio.nome}
              className="w-full h-auto max-h-[500px] object-contain"
              onError={() => setImagemErro(true)}
            />
          ) : exercicio.imagemUrl && !imagemErro ? (
            <img
              src={exercicio.imagemUrl}
              alt={exercicio.nome}
              className="w-full h-auto max-h-[500px] object-contain"
              onError={() => setImagemErro(true)}
            />
          ) : (
            <div className="w-full min-h-[200px] flex items-center justify-center bg-dark-lighter">
              <svg className="w-24 h-24 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Descrição */}
        {exercicio.descricao && (
          <div className="mb-6">
            <h5 className="text-lg font-bold text-light mb-2">Descrição</h5>
            <p className="text-light-muted leading-relaxed">{exercicio.descricao}</p>
          </div>
        )}

        {/* Execução Técnica */}
        {exercicio.execucaoTecnica && (
          <div className="mb-6">
            <h5 className="text-lg font-bold text-light mb-2">Execução Técnica</h5>
            <div className="text-light-muted leading-relaxed whitespace-pre-line">
              {exercicio.execucaoTecnica}
            </div>
          </div>
        )}

        {/* Erros Comuns */}
        {exercicio.errosComuns && exercicio.errosComuns.length > 0 && (
          <div className="mb-6">
            <h5 className="text-lg font-bold text-warning mb-2">Erros Comuns</h5>
            <ul className="space-y-2">
              {exercicio.errosComuns.map((erro, index) => (
                <li key={index} className="flex items-start gap-2 text-light-muted">
                  <svg className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{erro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Equipamentos */}
        {exercicio.equipamentoNecessario && exercicio.equipamentoNecessario.length > 0 && (
          <div className="mb-6">
            <h5 className="text-lg font-bold text-light mb-2">Equipamentos Necessários</h5>
            {formatarEquipamentos ? (
              formatarEquipamentos(exercicio.equipamentoNecessario)
            ) : (
              <div className="flex flex-wrap gap-2">
                {exercicio.equipamentoNecessario.map((eq, index) => (
                  <span key={index} className="badge-primary">{eq}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Botão Fechar Grande */}
        <button
          onClick={onClose}
          className="w-full h-14 md:h-16 bg-primary text-white rounded-xl font-bold text-lg md:text-xl hover:bg-primary/90 transition-all duration-200 shadow-lg active:scale-95"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}

