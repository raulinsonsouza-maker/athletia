import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTreinoAtual } from '../hooks/useTreinoAtual'
import { useModal } from '../hooks/useModal'
import { useExercicioMediaChain } from '../hooks/useExercicioMediaChain'
import { IconeCheck, IconeTrofeu, IconeSeta, IconeDumbbell, IconeVoltar, IconeMenu, IconeFechar } from '../components/icons/TreinoIcons'
import { ExercicioInfo } from '../components/treino/ExercicioInfo'
import { ChecklistModal } from '../components/treino/ChecklistModal'
import { ImagemExpandidaModal } from '../components/treino/ImagemExpandidaModal'
import { useToast } from '../hooks/useToast'
import FirstTrainingComplete from '../components/FirstTrainingComplete'

/**
 * Componente principal de treino atual - Redesenhado
 * Focado em uso na academia com design moderno e inteligente
 */
export default function TreinoAtual() {
  const navigate = useNavigate()
  const { ToastContainer } = useToast()
  const [concluindoTreino, setConcluindoTreino] = useState(false)
  const [showFirstTrainingModal, setShowFirstTrainingModal] = useState(false)
  const [nextTrainingData, setNextTrainingData] = useState<{
    nextTrainingId: string | null
    nextTrainingAvailable: boolean
  } | null>(null)

  // Hooks principais
  const {
    blocoAtivo,
    exercicioAtivo,
    progresso,
    exercicioAtivoIndex,
    loading,
    irParaProximoExercicio,
    exercicioAnterior,
    selecionarExercicio,
    marcarConcluido,
    finalizarTreino,
    isExercicioConcluido
  } = useTreinoAtual()

  const checklistModal = useModal(false)
  const imagemModal = useModal(false)

  // Mídia do exercício
  const exercicioMedia = useExercicioMediaChain(exercicioAtivo)

  // Garantir que a tela sempre abra no topo ao entrar no treino
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  // Debug: verificar se imagemUrl está presente
  useEffect(() => {
    if (exercicioAtivo) {
      console.log('[TreinoAtual] Exercício ativo:', {
        nome: exercicioAtivo.nome,
        imagemUrl: exercicioAtivo.imagemUrl,
        mediaUrl: exercicioMedia.url,
        hasMedia: exercicioMedia.hasMedia
      })
    }
  }, [exercicioAtivo, exercicioMedia.url, exercicioMedia.hasMedia])

  // Handlers
  const handleVoltar = useCallback(() => navigate('/treinos'), [navigate])

  const handleMarcarConcluido = useCallback(() => {
    if (!exercicioAtivo) return
    const concluido = isExercicioConcluido(exercicioAtivo.id)
    marcarConcluido(exercicioAtivo.id, !concluido)
  }, [exercicioAtivo, isExercicioConcluido, marcarConcluido])

  const handleFinalizarTreino = useCallback(async () => {
    if (concluindoTreino) return // Evitar múltiplos cliques
    
    setConcluindoTreino(true)
    try {
      const resultado = await finalizarTreino()
      if (resultado.success) {
        // Se for primeiro treino, mostrar modal
        if (resultado.isFirstTraining && resultado.nextTrainingData) {
          setNextTrainingData(resultado.nextTrainingData)
          setShowFirstTrainingModal(true)
        } else {
          setTimeout(() => navigate('/meu-plano'), 1000)
        }
      }
    } catch (error) {
      console.error('[handleFinalizarTreino] Erro:', error)
    } finally {
      setConcluindoTreino(false)
    }
  }, [finalizarTreino, navigate, concluindoTreino])

  const handleAbandonar = useCallback(() => {
    if (window.confirm('Deseja abandonar este treino?')) {
      navigate('/treinos')
    }
  }, [navigate])

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
  const isAlongamentoGeral = exercicioAtivo.nome?.toLowerCase() === 'alongamento geral'.toLowerCase()
  const alongamentoVideoUrl = 'https://www.youtube.com/embed/HtJv4Gv5HTQ'
  const hasMedia = isAlongamentoGeral || !!exercicioMedia.url

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* HEADER FIXO */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={handleVoltar} 
            className="p-2 -ml-2 text-white/80 hover:text-white transition rounded-lg hover:bg-white/10"
          >
            <IconeVoltar />
          </button>
          
          <button 
            onClick={checklistModal.toggle}
            className="p-2 -mr-2 text-white/80 hover:text-white transition rounded-lg hover:bg-white/10 relative"
          >
            <IconeMenu />
            {progresso.concluidos > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-xs rounded-full flex items-center justify-center font-bold">
                {progresso.concluidos}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL - Layout Moderno */}
      <main className="flex-1 pt-16 pb-28 px-4 md:px-6 lg:px-8">
        {/* BARRA DE PROGRESSO SUPERIOR (UNIFICADA) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-white/60">
              Exercício {exercicioAtivoIndex + 1} de {blocoAtivo.exercicios.length}
            </span>
            <span className="text-xs font-bold text-primary">{progresso.percentual}%</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center mt-1">
            {blocoAtivo.exercicios.map((ex, idx) => {
              const concluido = isExercicioConcluido(ex.id)
              const ativo = idx === exercicioAtivoIndex
              return (
                <div
                  key={ex.id}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    ativo
                      ? 'bg-primary scale-y-110'
                      : concluido 
                        ? 'bg-primary/60' 
                        : 'bg-white/10'
                  }`}
                />
              )
            })}
          </div>
        </div>

        {/* TÍTULO DO EXERCÍCIO */}
        <h1 className="text-xl md:text-3xl font-bold text-center mb-3 md:mb-4 leading-tight">
          {exercicioAtivo.nome}
        </h1>

        {/* LAYOUT GRID MODERNO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl mx-auto">
          {/* COLUNA ESQUERDA: MÍDIA EM DESTAQUE */}
          <div className="space-y-3">
            {/* GIF/VIDEO GRANDE */}
            <div className="relative">
              <button
                onClick={imagemModal.abrir}
                disabled={!hasMedia}
                className="w-full aspect-[3/2] md:aspect-[4/3] bg-[#111] rounded-xl overflow-hidden border-2 border-white/10 hover:border-primary/50 transition-all relative group disabled:cursor-default"
              >
                {hasMedia ? (
                  <>
                    {isAlongamentoGeral ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-full h-full aspect-video">
                          <iframe
                            src={`${alongamentoVideoUrl}?rel=0`}
                            title="Alongamento Geral"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ) : exercicioMedia.isVideo ? (
                      <video
                        src={exercicioMedia.url!}
                        className="w-full h-full object-contain"
                        muted
                        loop
                        autoPlay
                        playsInline
                        onError={exercicioMedia.handleError}
                      />
                    ) : (
                      <img
                        src={exercicioMedia.url!}
                        alt={exercicioAtivo.nome}
                        className="w-full h-full object-contain"
                        onError={exercicioMedia.handleError}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                      <span className="text-sm text-white/70 opacity-0 group-hover:opacity-100 transition px-4 py-2 bg-black/60 rounded-full backdrop-blur-sm">
                        Toque para expandir
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <IconeDumbbell />
                    <span className="text-white/40 text-sm mt-4">Sem mídia disponível</span>
                  </div>
                )}
              </button>
            </div>

          </div>

          {/* COLUNA DIREITA: INFORMAÇÕES */}
          <div className="space-y-3">
            {/* NAVEGAÇÃO ENTRE EXERCÍCIOS */}
            <div className="flex items-center justify-between gap-3 bg-[#111] rounded-xl border border-white/10 p-3">
              <button
                onClick={exercicioAnterior}
                disabled={exercicioAtivoIndex === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 active:bg-white/15 transition border border-white/10 disabled:border-transparent"
              >
                <IconeSeta direcao="esquerda" />
                <span className="text-xs font-medium">Anterior</span>
              </button>
              
              <div className="flex-1 text-center">
                <div className="text-[10px] text-white/50 mb-0.5">Progresso</div>
                <div className="text-sm font-bold">
                  {exercicioAtivoIndex + 1} / {blocoAtivo.exercicios.length}
                </div>
              </div>
              
              <button
                onClick={irParaProximoExercicio}
                disabled={exercicioAtivoIndex >= blocoAtivo.exercicios.length - 1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 active:bg-white/15 transition border border-white/10 disabled:border-transparent"
              >
                <span className="text-xs font-medium">Próximo</span>
                <IconeSeta direcao="direita" />
              </button>
            </div>

            {/* INFORMAÇÕES DO EXERCÍCIO */}
            <ExercicioInfo exercicio={exercicioAtivo} />
          </div>
        </div>
      </main>

      {/* FOOTER FIXO MODERNO */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent pt-6 pb-6 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* DESFAZER - REMOVIDO conforme solicitação do usuário */}

          {/* BOTÃO PRINCIPAL */}
          <button
            onClick={handleMarcarConcluido}
            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg ${
              exercicioConcluido 
                ? 'bg-white/10 text-white/70 border border-white/20' 
                : 'bg-gradient-to-r from-primary to-primary/90 text-black shadow-primary/30'
            }`}
          >
            <IconeCheck />
            <span>{exercicioConcluido ? 'Exercício concluído' : 'Concluir exercício'}</span>
          </button>

          {/* FINALIZAR TREINO */}
          {progresso.percentual === 100 && (
            <button
              onClick={handleFinalizarTreino}
              disabled={concluindoTreino}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-green-500/20"
            >
              <IconeTrofeu />
              {concluindoTreino ? 'Finalizando...' : 'Finalizar Treino'}
            </button>
          )}
        </div>
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

      {imagemModal.aberto && exercicioAtivo && isAlongamentoGeral && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          onClick={imagemModal.fechar}
        >
          <div
            className="relative w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={imagemModal.fechar}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition z-10"
            >
              <IconeFechar />
            </button>
            <div className="w-full h-auto rounded-xl max-h-[90vh] overflow-hidden aspect-video">
              <iframe
                src={`${alongamentoVideoUrl}?rel=0`}
                title={exercicioAtivo.nome}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <p className="text-center text-white/80 mt-4">{exercicioAtivo.nome}</p>
          </div>
        </div>
      )}

      {imagemModal.aberto && exercicioAtivo && !isAlongamentoGeral && exercicioMedia.url && (
        <ImagemExpandidaModal
          url={exercicioMedia.url}
          isVideo={exercicioMedia.isVideo}
          nomeExercicio={exercicioAtivo.nome}
          onFechar={imagemModal.fechar}
          onError={exercicioMedia.handleError}
        />
      )}

      <ToastContainer />
      <FirstTrainingComplete
        isOpen={showFirstTrainingModal}
        nextTrainingId={nextTrainingData?.nextTrainingId || null}
        nextTrainingAvailable={nextTrainingData?.nextTrainingAvailable || false}
        onContinue={() => {
          setShowFirstTrainingModal(false)
          setNextTrainingData(null)
        }}
      />
    </div>
  )
}
