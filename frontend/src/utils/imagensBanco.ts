/**
 * Utilitário para acessar imagens do banco de imagens
 * As imagens estão localizadas em /opt/athletia/Imagens/Banco no servidor
 * e são servidas através da rota /api/imagens-banco/:nomeArquivo
 */

import { getApiBaseUrl } from './api-url'

/**
 * Valida se uma URL de imagem é válida
 */
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false
  }
  
  // Rejeitar URLs de CDN inválida
  if (url.includes('minha-cdn.com')) {
    return false
  }
  
  return true
}

/**
 * Obtém a URL completa de uma imagem do banco
 * @param nomeArquivo Nome do arquivo da imagem (ex: "treino-cardio.jpg")
 * @returns URL completa para acessar a imagem ou string vazia se inválida
 */
export function getImagemBanco(nomeArquivo: string): string {
  if (!nomeArquivo || !isValidImageUrl(nomeArquivo)) {
    return '';
  }

  // Se já for uma URL completa, validar e retornar
  if (nomeArquivo.startsWith('http://') || nomeArquivo.startsWith('https://')) {
    return isValidImageUrl(nomeArquivo) ? nomeArquivo : '';
  }

  // Obter URL base dinamicamente (para detectar HTTPS em tempo de execução)
  const API_BASE_URL = getApiBaseUrl();

  // Se já começar com /api/, validar e retornar
  if (nomeArquivo.startsWith('/api/')) {
    const fullUrl = `${API_BASE_URL}${nomeArquivo}`;
    return isValidImageUrl(fullUrl) ? fullUrl : '';
  }

  // Construir URL da imagem do banco
  const fullUrl = `${API_BASE_URL}/api/imagens-banco/${nomeArquivo}`;
  return isValidImageUrl(fullUrl) ? fullUrl : '';
}

/**
 * Mapeamento de grupos musculares para nomes de arquivos de imagem do banco
 * Use este mapeamento quando quiser usar imagens específicas do banco para grupos musculares
 */
export const IMAGENS_GRUPOS_BANCO: Record<string, string> = {
  peito: 'peito.jpg',
  costas: 'costas.jpg',
  ombros: 'ombros.jpg',
  biceps: 'biceps.jpg',
  triceps: 'triceps.jpg',
  quadriceps: 'quadriceps.jpg',
  gluteos: 'gluteos.jpg',
  posteriores: 'posteriores.jpg',
  abdomen: 'abdomen.jpg',
  adutores: 'adutores.jpg',
  antebraços: 'antebraços.jpg',
  panturrilhas: 'panturrilhas.jpg'
};

/**
 * Obtém a URL de uma imagem do banco para um grupo muscular específico
 * @param grupoSlug Slug do grupo muscular (ex: "peito", "costas")
 * @returns URL da imagem ou string vazia se não encontrada
 */
export function getImagemGrupoBanco(grupoSlug: string): string {
  const nomeArquivo = IMAGENS_GRUPOS_BANCO[grupoSlug.toLowerCase()];
  if (!nomeArquivo) {
    return '';
  }
  return getImagemBanco(nomeArquivo);
}

/**
 * Imagens padrão do banco para diferentes contextos
 */
export const IMAGENS_PADRAO_BANCO = {
  treino: 'treino-padrao.jpg',
  treinos: 'treinos-padrao.jpg',
  plano: 'plano-padrao.jpg',
  cardio: 'cardio.jpg',
  alongamento: 'alongamento.jpg',
  aquecimento: 'aquecimento.jpg'
};

/**
 * Obtém uma imagem padrão do banco para um contexto específico
 * @param contexto Contexto da imagem (ex: "treino", "treinos", "plano")
 * @returns URL da imagem padrão
 */
export function getImagemPadraoBanco(contexto: keyof typeof IMAGENS_PADRAO_BANCO): string {
  const nomeArquivo = IMAGENS_PADRAO_BANCO[contexto];
  return getImagemBanco(nomeArquivo);
}

