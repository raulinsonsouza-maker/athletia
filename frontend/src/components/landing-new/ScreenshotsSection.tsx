import { useState } from 'react'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface Screenshot {
  image: string
  alt: string
}

const screenshots: Screenshot[] = [
  {
    image: '/images/lp-new/gallery/gallery-progresso-2.webp',
    alt: 'Tela de progresso avançado do AthletIA'
  },
  {
    image: '/images/lp-new/gallery/gallery-perfil-peso.webp',
    alt: 'Perfil com histórico de peso e evolução'
  },
  {
    image: '/images/lp-new/gallery/gallery-progresso-forca.webp',
    alt: 'Progressão de força por grupo muscular'
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {screenshots.map((screenshot, index) => (
              <div
                key={index}
                className={`group relative rounded-2xl overflow-hidden border border-grey/20 hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 cursor-pointer ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
                onClick={() => setSelectedImage(screenshot.image)}
              >
                <div className="aspect-[9/19.5] bg-gradient-to-br from-dark-lighter to-dark flex items-center justify-center relative overflow-hidden">
                  {screenshot.image && screenshot.image.startsWith('/images/') ? (
                    <img
                      src={screenshot.image}
                      alt={screenshot.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center text-light-muted">
                              <div class="text-center">
                                <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p class="text-xs">Screenshot em breve</p>
                              </div>
                            </div>
                          `
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-light-muted">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs">Screenshot em breve</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay no hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
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
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-primary transition-colors"
              aria-label="Fechar"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="rounded-2xl overflow-hidden border-4 border-primary/30">
              <img
                src={selectedImage}
                alt="Screenshot em tela cheia"
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

