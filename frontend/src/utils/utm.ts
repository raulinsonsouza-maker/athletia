const UTM_STORAGE_KEY = 'athletia_utm'

export type UtmParams = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
}

function limpar(valor: string | null): string | undefined {
  if (!valor) return undefined
  const t = valor.trim()
  return t || undefined
}

/** Captura UTMs da URL e persiste na sessão (não sobrescreve se já houver). */
export function capturarUtmDaUrl(search: string = typeof window !== 'undefined' ? window.location.search : ''): UtmParams {
  const params = new URLSearchParams(search)
  const atual: UtmParams = {
    utm_source: limpar(params.get('utm_source')),
    utm_medium: limpar(params.get('utm_medium')),
    utm_campaign: limpar(params.get('utm_campaign')),
    utm_content: limpar(params.get('utm_content')),
    utm_term: limpar(params.get('utm_term')),
    gclid: limpar(params.get('gclid'))
  }

  const temNovo = Object.values(atual).some(Boolean)
  if (!temNovo) return lerUtm()

  try {
    const existente = lerUtm()
    const mesclado = { ...existente, ...Object.fromEntries(Object.entries(atual).filter(([, v]) => v)) }
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(mesclado))
    return mesclado
  } catch {
    return atual
  }
}

export function lerUtm(): UtmParams {
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function dispararGtag(eventName: string, params: Record<string, unknown> = {}) {
  try {
    if (typeof window === 'undefined' || !(window as any).gtag) return
    ;(window as any).gtag('event', eventName, params)
  } catch {
    // gtag opcional
  }
}
