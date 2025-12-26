import { useCallback, useEffect, useMemo, useRef } from 'react'

interface MobileNumberPickerProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
  className?: string
}

const ITEM_HEIGHT = 48
const SCROLL_END_DELAY = 100

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export default function MobileNumberPicker({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  className = ''
}: MobileNumberPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTimeoutRef = useRef<number | null>(null)

  const options = useMemo(() => {
    const values: number[] = []
    const totalSteps = Math.floor((max - min) / step)
    for (let i = 0; i <= totalSteps; i++) {
      const raw = min + i * step
      // Evitar flutuações de ponto flutuante
      const normalized = Number(raw.toFixed(2))
      values.push(normalized)
    }
    if (values[values.length - 1] !== max) {
      values.push(max)
    }
    return values
  }, [min, max, step])

  const scrollToValue = useCallback(
    (targetValue: number, behavior: ScrollBehavior = 'auto') => {
      const container = containerRef.current
      if (!container) return

      const index = options.indexOf(targetValue)
      if (index === -1) return

      container.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior
      })
    },
    [options]
  )

  const handleScrollEnd = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const index = clamp(Math.round(container.scrollTop / ITEM_HEIGHT), 0, options.length - 1)
    const newValue = options[index]
    scrollToValue(newValue, 'smooth')
    if (newValue !== value) {
      onChange(newValue)
    }
  }, [onChange, options, scrollToValue, value])

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current)
    }
    scrollTimeoutRef.current = window.setTimeout(handleScrollEnd, SCROLL_END_DELAY)
  }, [handleScrollEnd])

  // Suporte para scroll da roda do mouse (desktop)
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container) return

    const delta = e.deltaY > 0 ? ITEM_HEIGHT : -ITEM_HEIGHT
    const newScrollTop = container.scrollTop + delta
    
    container.scrollTop = newScrollTop
    handleScroll()
  }, [handleScroll])

  // Suporte para clique duplo para digitar manualmente (implementação futura)
  const handleDoubleClick = useCallback(() => {
    // TODO: Implementar modal/input para digitar valor manualmente
    // Por enquanto, apenas log para não quebrar funcionalidade existente
    console.log('Double click para digitar manualmente - funcionalidade futura')
  }, [])

  useEffect(() => {
    scrollToValue(value)
  }, [scrollToValue, value])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-full h-12 bg-light/5 rounded-full border border-light/10" />
      </div>

      <div className="flex items-center justify-center gap-4">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          className="relative flex-1 h-40 overflow-y-auto hide-scrollbar scroll-smooth snap-y snap-mandatory py-14 cursor-pointer"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 pointer-events-none rounded-full border border-light/20 bg-white/5" />
          <div className="flex flex-col items-center">
            {options.map((option) => {
              const display = Number.isInteger(option) ? option.toString() : option.toFixed(1)
              const isSelected = option === value
              return (
                <div
                  key={option}
                  className={`flex items-center justify-center h-12 snap-center transition-all duration-150 ${
                    isSelected ? 'text-light text-2xl font-bold' : 'text-light-muted text-lg'
                  }`}
                  style={{ minHeight: ITEM_HEIGHT }}
                >
                  {display}
                </div>
              )
            })}
          </div>
        </div>

        {unit && (
          <div className="text-light text-lg font-semibold w-14 text-right">
            {unit}
          </div>
        )}
      </div>
    </div>
  )
}


