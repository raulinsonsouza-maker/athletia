import { memo } from 'react'
import { IconeFechar } from '../icons/TreinoIcons'

interface ImagemExpandidaModalProps {
  url: string
  isVideo: boolean
  nomeExercicio: string
  onFechar: () => void
  onError: () => void
}

export const ImagemExpandidaModal = memo(({
  url,
  isVideo,
  nomeExercicio,
  onFechar,
  onError
}: ImagemExpandidaModalProps) => (
  <div 
    className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
    onClick={onFechar}
  >
    <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onFechar}
        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition z-10"
      >
        <IconeFechar />
      </button>
      {isVideo ? (
        <video
          src={url}
          className="w-full h-auto rounded-xl max-h-[90vh] object-contain"
          controls
          autoPlay
          loop
          onError={onError}
        />
      ) : (
        <img
          src={url}
          alt={`Demonstração de execução de ${nomeExercicio}`}
          className="w-full h-auto rounded-xl max-h-[90vh] object-contain"
          onError={onError}
        />
      )}
      <p className="text-center text-white/80 mt-4">{nomeExercicio}</p>
    </div>
  </div>
))
ImagemExpandidaModal.displayName = 'ImagemExpandidaModal'

