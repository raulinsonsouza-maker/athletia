import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTreinoAtual } from '../hooks/useTreinoAtual'
import { useCronometro } from '../hooks/useCronometro'
import { useModal } from '../hooks/useModal'
import { useExercicioMediaChain } from '../hooks/useExercicioMediaChain'
import { IconeCheck, IconeTrofeu, IconeSeta, IconeDumbbell } from '../components/icons/TreinoIcons'
import { TimerBar } from '../components/treino/TimerBar'
import { ExercicioInfo } from '../components/treino/ExercicioInfo'
import { ChecklistModal } from '../components/treino/ChecklistModal'
import { ImagemExpandidaModal } from '../components/treino/ImagemExpandidaModal'
import { useToast } from '../hooks/useToast'

/**
 * Componente principal de treino atual
 * Arquitetura limpa: <200 linhas, responsabilidades separadas
 */
export default function TreinoAtual() {
  const navigate = useNavigate()
  const { ToastContainer } = useToast()
  const [concluindoTreino, setConcluindoTreino] = useState(false)

  // Hooks principais
  const {
    blocoAtivo,
    exercicioAtivo,
    proximoExercicio,
    progresso,
    exercicioAtivoIndex,
    loading,
    podeDesfazer,
    tempoDesfazer,
    irParaProximoExercicio,
    exercicioAnterior,
    selecionarExercicio,
    marcarConcluido,
    desfazer,
    finalizarTreino,
    isExercicioConcluido
  } = useTreinoAtual()

  const cronometro = useCronometro(true)
  const checklistModal = useModal(false)
  const imagemModal = useModal(false)

  // Mídia dos exercícios
  const exercicioMedia = useExercicioMediaChain(exercicioAtivo)
  const proximoMedia = useExercicioMediaChain(proximoExercicio)

  // Handlers
  const handleVoltar = useCallback(() => navigate('/treinos'), [navigate])

  const handleMarcarConcluido = useCallback(() => {
    if (!exercicioAtivo) return
    const concluido = isExercicioConcluido(exercicioAtivo.id)
    marcarConcluido(exercicioAtivo.id, !concluido)
  }, [exercicioAtivo, isExercicioConcluido, marcarConcluido])

  const handleFinalizarTreino = useCallback(async () => {
    setConcluindoTreino(true)
    const sucesso = await finalizarTreino()
    if (sucesso) {
      cronometro.pausar()
      setTimeout(() => navigate('/meu-plano'), 1000)
    }
    setConcluindoTreino(false)
  }, [finalizarTreino, navigate, cronometro])

  const handleAbandonar = useCallback(() => {
    if (window.confirm('Deseja abandonar este treino?')) {
      cronometro.pausar()
      navigate('/treinos')
    }
  }, [navigate, cronometro])

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  // Sem treino
  if (!blocoAtivo || !exercicioAtivo) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <IconeDumbbell />
        </div>
        <p className="text-xl font-semibold mb-2">Nenhum treino encontrado</p>
        <p className="text-white/60 mb-6 text-center">Crie um treino rápido ou aguarde a geração do seu plano.</p>
        <button
          onClick={() => navigate('/treinos')}
          className="bg-primary text-black font-bold px-6 py-3 rounded-full"
        >
          Ir para Treinos
        </button>
      </div>
    )
  }

  const exercicioConcluido = isExercicioConcluido(exercicioAtivo.id)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* TIMER BAR */}
      <TimerBar
        cronometro={cronometro.formatado}
        timerAtivo={cronometro.ativo}
        progressoConcluidos={progresso.concluidos}
        onVoltar={handleVoltar}
        onToggleTimer={cronometro.toggle}
        onToggleChecklist={checklistModal.toggle}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 pt-14 pb-52 px-4 flex flex-col">
        <h1 className="text-3xl font-bold text-center mb-3 mt-2">{exercicioAtivo.nome}</h1>

        {/* DADOS DO EXERCÍCIO */}
        <div className="bg-[#111] rounded-xl border border-white/10 p-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Séries</span>
              <span className="text-lg font-bold">{exercicioAtivo.series}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Repetições</span>
              <span className="text-lg font-bold">{exercicioAtivo.repeticoes}</span>
            </div>
            {exercicioAtivo.carga && (
              <div className="flex flex-col">
                <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Carga</span>
                <span className="text-lg font-bold">{exercicioAtivo.carga}kg</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Grupo</span>
              <span className="text-lg font-bold text-primary">{exercicioAtivo.grupo}</span>
            </div>
          </div>
        </div>

        {/* PRÓXIMO EXERCÍCIO */}
        {proximoExercicio && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Próximo</p>
                <p className="text-sm font-semibold text-white/90">{proximoExercicio.nome}</p>
                <p className="text-xs text-white/50 mt-1">{proximoExercicio.series}x{proximoExercicio.repeticoes}</p>
              </div>
              {proximoMedia.url ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#111] border border-white/10">
                  {proximoMedia.isVideo ? (
                    <video
                      src={proximoMedia.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onError={proximoMedia.handleError}
                    />
                  ) : (
                    <img
                      src={proximoMedia.url}
                      alt={proximoExercicio.nome}
                      className="w-full h-full object-cover"
                      onError={proximoMedia.handleError}
                    />
                  )}
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#111] border border-white/10 flex items-center justify-center">
                  <IconeDumbbell />
                </div>
              )}
            </div>
          </div>
        )}

        {/* MÍDIA DO EXERCÍCIO */}
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={imagemModal.abrir}
            className="w-full max-w-sm h-56 bg-[#111] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center hover:border-primary/50 transition relative group"
          >
            {exercicioMedia.url ? (
              <>
                {exercicioMedia.isVideo ? (
                  <video
                    src={exercicioMedia.url}
                    className="w-full h-full object-contain"
                    muted
                    loop
                    onError={exercicioMedia.handleError}
                  />
                ) : (
                  <img
                    src={exercicioMedia.url}
                    alt={exercicioAtivo.nome}
                    className="w-full h-full object-contain"
                    onError={exercicioMedia.handleError}
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                  <span className="text-xs text-white/70 opacity-0 group-hover:opacity-100 transition">Toque para expandir</span>
                </div>
              </>
            ) : (
              <IconeDumbbell />
            )}
          </button>
        </div>

        {/* INFORMAÇÕES DO EXERCÍCIO */}
        <ExercicioInfo exercicio={exercicioAtivo} />

        {/* NAVEGAÇÃO */}
        <div className="flex items-center justify-center gap-8 mt-4">
          <button
            onClick={exercicioAnterior}
            disabled={exercicioAtivoIndex === 0}
            className="p-4 rounded-full bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/20 active:bg-white/30 transition border border-white/20"
          >
            <IconeSeta direcao="esquerda" />
          </button>
          <span className="text-base font-semibold text-white/80 min-w-[60px] text-center">
            {exercicioAtivoIndex + 1} / {blocoAtivo.exercicios.length}
          </span>
          <button
            onClick={irParaProximoExercicio}
            disabled={exercicioAtivoIndex >= blocoAtivo.exercicios.length - 1}
            className="p-4 rounded-full bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/20 active:bg-white/30 transition border border-white/20"
          >
            <IconeSeta direcao="direita" />
          </button>
        </div>
      </main>

      {/* FOOTER FIXO */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-6 pb-6 px-4">
        {/* PROGRESSO */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-bold text-white">{progresso.concluidos} de {progresso.total} exercícios</span>
            <span className="text-base font-bold text-primary">{progresso.percentual}%</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            {blocoAtivo.exercicios.map((_, idx) => {
              const concluido = isExercicioConcluido(blocoAtivo.exercicios[idx].id)
              return (
                <div
                  key={blocoAtivo.exercicios[idx].id}
                  className={`w-3 h-3 rounded-full transition-all ${
                    concluido 
                      ? 'bg-primary scale-110' 
                      : 'bg-white/20'
                  }`}
                />
              )
            })}
          </div>
        </div>

        {/* DESFAZER */}
        {podeDesfazer && (
          <button
            onClick={desfazer}
            className="w-full mb-2 py-2 rounded-xl bg-white/10 text-white/80 text-sm font-medium hover:bg-white/20 transition"
          >
            Desfazer ({Math.ceil(tempoDesfazer / 1000)}s)
          </button>
        )}

        {/* BOTÃO PRINCIPAL */}
        <button
          onClick={handleMarcarConcluido}
          className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${
            exercicioConcluido 
              ? 'bg-white/10 text-white/70' 
              : 'bg-primary text-black shadow-lg shadow-primary/30'
          }`}
        >
          <IconeCheck />
          <span>{exercicioConcluido ? 'Desmarcar exercício' : 'Concluir exercício'}</span>
        </button>

        {/* FINALIZAR TREINO */}
        {progresso.percentual === 100 && (
          <button
            onClick={handleFinalizarTreino}
            disabled={concluindoTreino}
            className="w-full mt-3 py-4 rounded-2xl bg-green-600 text-white font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <IconeTrofeu />
            {concluindoTreino ? 'Finalizando...' : 'Finalizar Treino'}
          </button>
        )}
      </footer>

      {/* MODAIS */}
      {checklistModal.aberto && blocoAtivo && (
        <ChecklistModal
          bloco={blocoAtivo}
          exercicioAtivoIndex={exercicioAtivoIndex}
          progresso={progresso}
          isExercicioConcluido={isExercicioConcluido}
          onFechar={checklistModal.fechar}
          onSelecionarExercicio={(idx) => {
            selecionarExercicio(idx)
            checklistModal.fechar()
          }}
          onFinalizarTreino={handleFinalizarTreino}
          onAbandonar={handleAbandonar}
          concluindoTreino={concluindoTreino}
        />
      )}

      {imagemModal.aberto && exercicioMedia.url && exercicioAtivo && (
        <ImagemExpandidaModal
          url={exercicioMedia.url}
          isVideo={exercicioMedia.isVideo}
          nomeExercicio={exercicioAtivo.nome}
          onFechar={imagemModal.fechar}
          onError={exercicioMedia.handleError}
        />
      )}

      <ToastContainer />
    </div>
  )
}
