import { useState } from 'react'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface Screenshot {
  image: string
  alt: string
}

// Usando as novas imagens SVG (7-11)
const screenshots: Screenshot[] = [
  {
    image: '/images/app-preview/novas/7.svg',
    alt: 'Interface do AthletIA - Screenshot 1'
  },
  {
    image: '/images/app-preview/novas/8.svg',
    alt: 'Interface do AthletIA - Screenshot 2'
  },
  {
    image: '/images/app-preview/novas/9.svg',
    alt: 'Interface do AthletIA - Screenshot 3'
  },
  {
    image: '/images/app-preview/novas/10.svg',
    alt: 'Interface do AthletIA - Screenshot 4'
  },
  {
    image: '/images/app-preview/novas/11.svg',
    alt: 'Interface do AthletIA - Screenshot 5'
  }
]

export default function ScreenshotsSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <>
      <section
        ref={ref as React.RefObject<HTMLElement>}
        className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-dark-lighter/50 via-dark to-dark-lighter/50 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4">
              Veja o{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                AthletIA em ação
              </span>
            </h2>
            <p className="text-xl text-light-muted max-w-3xl mx-auto">
              Explore diferentes telas e funcionalidades do aplicativo
            </p>
          </div>

          {/* Grid estilo Productive - mais espaçado e limpo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {screenshots.map((screenshot, index) => (
              <div
                key={index}
                className={`group relative transition-all duration-500 hover:scale-105 cursor-pointer ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => setSelectedImage(screenshot.image)}
              >
                <div className="relative rounded-3xl overflow-hidden bg-dark-lighter/30 p-4 backdrop-blur-sm border border-grey/10 hover:border-primary/30 transition-all duration-300">
                  <img
                    src={screenshot.image}
                    alt={screenshot.alt}
                    className="w-full h-auto drop-shadow-xl group-hover:drop-shadow-2xl transition-all duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback para screenshot-2.webp se SVG não existir
                      const target = e.target as HTMLImageElement
                      target.src = '/images/app-preview/screenshot-2.webp'
                    }}
                  />
                  
                  {/* Overlay sutil no hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <div className="flex items-center gap-2 text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      <span className="text-sm font-semibold">Ver em tela cheia</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-primary transition-colors z-10"
              aria-label="Fechar"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="rounded-3xl overflow-hidden border-4 border-primary/30 bg-dark-lighter/50 p-4">
              <img
                src={selectedImage}
                alt="Screenshot em tela cheia"
                className="w-full h-auto max-h-[90vh] object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
