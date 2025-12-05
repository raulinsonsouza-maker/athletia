import fs from 'fs'
import path from 'path'

interface StructuredKnowledge {
  fontes?: Array<{
    capitulos?: Array<{
      numero?: string
      conteudo?: string
    }>
  }>
  conceitos?: Record<
    string,
    Array<{
      termo: string
      contexto: string
    }>
  >
}

interface IntervaloNumerico {
  min: number
  max: number
}

interface VolumeGuideline {
  exerciciosRange: IntervaloNumerico
  seriesRange: IntervaloNumerico
  repeticoesRange: IntervaloNumerico
  frequenciaRange: IntervaloNumerico
  contexto?: string
}

interface ObjetivoGuideline {
  seriesRange: IntervaloNumerico
  repeticoesRange: IntervaloNumerico
  descansoSegundos: IntervaloNumerico
  contexto?: string
}

const KNOWLEDGE_FILE = 'ai/conhecimento_estruturado.json'

let knowledgeCache: StructuredKnowledge | null = null
let volumeGuidelineCache: VolumeGuideline | null = null
const objetivoGuidelineCache = new Map<string, ObjetivoGuideline>()

function resolveKnowledgePath() {
  const candidatePaths = [
    path.resolve(process.cwd(), KNOWLEDGE_FILE),
    path.resolve(process.cwd(), '..', KNOWLEDGE_FILE),
    path.resolve(__dirname, '..', '..', KNOWLEDGE_FILE),
    path.resolve(__dirname, '..', KNOWLEDGE_FILE), // Add dist/ai check
    path.resolve(__dirname, '../../ai', 'conhecimento_estruturado.json') // Explicit fallback
  ]

  console.log('[Knowledge] Buscando arquivo em:', candidatePaths);

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      console.log('[Knowledge] Arquivo encontrado em:', candidate);
      return candidate
    }
  }

  const errorMsg = `Arquivo de conhecimento estruturado não encontrado. Verifique se ai/conhecimento_estruturado.json existe. Caminhos tentados: ${candidatePaths.join(', ')}`;
  console.error(errorMsg);
  throw new Error(errorMsg)
}

function loadRawKnowledge(): StructuredKnowledge {
  if (knowledgeCache) {
    return knowledgeCache
  }

  const filePath = resolveKnowledgePath()
  const raw = fs.readFileSync(filePath, 'utf-8')
  const parsed: StructuredKnowledge = JSON.parse(raw)
  knowledgeCache = parsed
  return parsed
}

function normalizarTexto(input?: string | null) {
  return (input || '').replace(/\s+/g, ' ').trim()
}

function extrairIntervaloRegex(texto: string, regex: RegExp): IntervaloNumerico | null {
  const match = texto.match(regex)
  if (!match) return null

  const min = Number(match[1])
  const max = Number(match[2] || match[1])

  if (Number.isNaN(min) || Number.isNaN(max)) return null

  return {
    min: Math.min(min, max),
    max: Math.max(min, max)
  }
}

function localizarCapitulo(chave: string): string | null {
  const knowledge = loadRawKnowledge()
  const normalized = chave.toLowerCase()
  const fontes = knowledge.fontes || []

  for (const fonte of fontes) {
    for (const cap of fonte.capitulos || []) {
      const conteudo = cap.conteudo || ''
      if (conteudo.toLowerCase().includes(normalized)) {
        return conteudo
      }
    }
  }

  const conceitos = knowledge.conceitos || {}
  for (const lista of Object.values(conceitos)) {
    for (const item of lista || []) {
      if (item.contexto?.toLowerCase().includes(normalized)) {
        return item.contexto
      }
    }
  }

  return null
}

function carregarVolumeBase(): VolumeGuideline {
  if (volumeGuidelineCache) {
    return volumeGuidelineCache
  }

  const capAlternado = localizarCapitulo('divisão de treino alternado por segmento')
  const texto = normalizarTexto(capAlternado || '')

  const exerciciosRange =
    extrairIntervaloRegex(texto, /(\d+)\s*a\s*(\d+)\s+exerc/i) || { min: 6, max: 12 }
  const seriesRange =
    extrairIntervaloRegex(texto, /(\d+)\s*a\s*(\d+)\s*s[ée]ries/i) || { min: 2, max: 3 }
  const repeticoesRange =
    extrairIntervaloRegex(texto, /(\d+)\s*a\s*(\d+)\s*repet/i) || { min: 10, max: 12 }
  const frequenciaRange =
    extrairIntervaloRegex(texto, /frequ[êe]ncia.*?(\d+)\s*a\s*(\d+)/i) || { min: 2, max: 3 }

  volumeGuidelineCache = {
    exerciciosRange,
    seriesRange,
    repeticoesRange,
    frequenciaRange,
    contexto: texto
  }

  return volumeGuidelineCache
}

function ajustarIntervalo({ min, max }: IntervaloNumerico, fator: number): IntervaloNumerico {
  const ajustadoMin = Math.max(1, Math.round(min * fator))
  const ajustadoMax = Math.max(ajustadoMin + 1, Math.round(max * fator))
  return {
    min: ajustadoMin,
    max: ajustadoMax
  }
}

function minutosParaSegundos(intervalo?: IntervaloNumerico | null): IntervaloNumerico {
  if (!intervalo) {
    return { min: 60, max: 90 }
  }
  return {
    min: Math.round(intervalo.min * 60),
    max: Math.round(intervalo.max * 60)
  }
}

function carregarGuidelineObjetivo(objetivo: string): ObjetivoGuideline {
  const chave = objetivo.toLowerCase()
  if (objetivoGuidelineCache.has(chave)) {
    return objetivoGuidelineCache.get(chave)!
  }

  const contextoCru =
    localizarCapitulo(objetivo) ||
    localizarCapitulo(`fase ${objetivo}`) ||
    localizarCapitulo(`Treinamento ${objetivo}`)

  const texto = normalizarTexto(contextoCru || '')

  const seriesRange =
    extrairIntervaloRegex(texto, /(\d+)\s*[-–]\s*(\d+)\s*s[ée]ries/i) ||
    extrairIntervaloRegex(texto, /(\d+)\s*a\s*(\d+)\s*s[ée]ries/i) || { min: 3, max: 4 }
  const repeticoesRange =
    extrairIntervaloRegex(texto, /(\d+)\s*[-–]\s*(\d+)\s*repet/i) ||
    extrairIntervaloRegex(texto, /(\d+)\s*a\s*(\d+)\s*repet/i) || { min: 8, max: 12 }
  const descansoRange =
    extrairIntervaloRegex(texto, /(\d+)\s*[-–]\s*(\d+)\s*min/i) ||
    extrairIntervaloRegex(texto, /(\d+)\s*a\s*(\d+)\s*min/i) || { min: 1, max: 2 }

  const guideline: ObjetivoGuideline = {
    seriesRange,
    repeticoesRange,
    descansoSegundos: minutosParaSegundos(descansoRange),
    contexto: texto
  }

  objetivoGuidelineCache.set(chave, guideline)
  return guideline
}

export function getVolumeGuideline(frequencia?: number): VolumeGuideline {
  const base = carregarVolumeBase()
  const freq = frequencia || Math.round((base.frequenciaRange.min + base.frequenciaRange.max) / 2)
  const baseMedia = (base.frequenciaRange.min + base.frequenciaRange.max) / 2
  const fator = Math.max(0.5, Math.min(1.2, baseMedia / freq))

  return {
    exerciciosRange: ajustarIntervalo(base.exerciciosRange, fator),
    seriesRange: base.seriesRange,
    repeticoesRange: base.repeticoesRange,
    frequenciaRange: base.frequenciaRange,
    contexto: base.contexto
  }
}

export function getObjectiveParameters(
  objetivo: string,
  experiencia: string,
  rpePreferido?: number | null
) {
  const guideline = carregarGuidelineObjetivo(objetivo)
  const experienciaLower = (experiencia || 'Intermediário').toLowerCase()

  const series =
    experienciaLower === 'avançado'
      ? guideline.seriesRange.max
      : experienciaLower === 'iniciante'
        ? guideline.seriesRange.min
        : Math.round((guideline.seriesRange.min + guideline.seriesRange.max) / 2)

  const repeticoes = `${guideline.repeticoesRange.min}-${guideline.repeticoesRange.max}`

  const descansoMedio =
    (guideline.descansoSegundos.min + guideline.descansoSegundos.max) / 2 || 90

  const objetivosRpe: Record<string, number> = {
    força: 8,
    hipertrofia: 7,
    emagrecimento: 6,
    condicionamento: 6,
    resistência: 6
  }

  const rpeBase = objetivosRpe[objetivo.toLowerCase()] ?? 7

  return {
    series,
    repeticoes,
    rpe: rpePreferido || rpeBase,
    descanso: Math.round(descansoMedio)
  }
}


